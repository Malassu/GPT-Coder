const { Configuration, OpenAIApi } = require('openai');
const { initialChat, executeChat, preamble, taskResponseSchema, executeResponseSchema, retryTasksPrompt, retryExecutionPrompt } = require('./schema')
const { GPT_MODEL } = require('./config');
const Ajv = require('ajv');

const ajv = new Ajv();

const parseMessage = (message) => {
  const start = message.indexOf('{');
  const end = message.lastIndexOf('}');
  const jsonString = message.slice(start, end + 1);
  return JSON.parse(jsonString);
}

async function fetchChatCompletion(prompt, apiToken, retry = []) {
  const configuration = new Configuration({
    apiKey: apiToken,
  });
  
  const gptApi = new OpenAIApi(configuration);
  let messages = [{role: 'system', content: preamble}, {role: 'user', content: prompt}];
  if (retry.length > 0) messages = messages.concat(retry);
  const subtaskResponse = await gptApi.createChatCompletion({
    model: GPT_MODEL,
    messages: messages,
  });
  console.log('Received GPT response: ', subtaskResponse.data.choices[0].message.content);
  return subtaskResponse.data.choices[0].message.content;
}

async function fetchSubtasks(description, apiToken) {
  const validate = ajv.compile(taskResponseSchema);
  const subtasks = await fetchChatCompletion(initialChat(description), apiToken);
  const parsed = parseMessage(subtasks);
  const isValid = validate(parsed);
  if (isValid) return parsed.subtasks;
  console.warn('Invalid response from GPT, retrying..')
  const retry = [{role: 'assistant', content: subtasks}, {role: 'user', content: retryTasksPrompt}];
  const subtasksRetried = await fetchChatCompletion(initialChat(description), apiToken, retry);
  const parsedRetry = parseMessage(subtasksRetried);
  const isValidRetry = validate(parsedRetry);
  if (isValidRetry) return parsedRetry.subtasks;
  throw new Error('Invalid GPT response after retry');
}

async function executeTask(description, contents, apiToken) {
  const validate = ajv.compile(executeResponseSchema);
  const taskResult = await fetchChatCompletion(executeChat(description, contents), apiToken);
  const parsed = parseMessage(taskResult);
  const isValid = validate(parsed);
  if (isValid) return parsed;
  console.warn('Invalid response from GPT, retrying..')
  const retry = [{role: 'assistant', content: taskResult}, {role: 'user', content: retryExecutionPrompt}];
  const taskRetried = await fetchChatCompletion(initialChat(description), apiToken, retry);
  const parsedRetry = parseMessage(taskRetried);
  const isValidRetry = validate(parsedRetry);
  if (isValidRetry) return parsedRetry;
  throw new Error('Invalid GPT response after retry');
}

module.exports = {
  fetchSubtasks,
  executeTask
}
