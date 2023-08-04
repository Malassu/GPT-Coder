const { Configuration, OpenAIApi } = require('openai');
const { initialChat, executeChat, preamble } = require('./schema')
const { GPT_MODEL } = require('./config');

const parseMessage = (message) => {
  const start = message.indexOf('{');
  const end = message.lastIndexOf('}');
  const jsonString = message.slice(start, end + 1);
  return JSON.parse(jsonString);
}

async function fetchSubtasks(description, apiToken) {
  const configuration = new Configuration({
    apiKey: apiToken,
  });
  
  const gptApi = new OpenAIApi(configuration);
  const subtaskResponse = await gptApi.createChatCompletion({
    model: GPT_MODEL,
    messages: [{role: 'system', content: preamble}, {role: 'user', content: initialChat(description)}],
  });
  console.log('Received GPT response: ', subtaskResponse.data.choices[0].message.content);
  const subtasksParsed = parseMessage(subtaskResponse.data.choices[0].message.content);
  return subtasksParsed.subtasks;
}

async function executeTask(description, contents, apiToken) {
  const configuration = new Configuration({
    apiKey: apiToken,
  });
  const gptApi = new OpenAIApi(configuration);
  const subtaskResponse = await gptApi.createChatCompletion({
    model: GPT_MODEL,
    messages: [{role: 'system', content: preamble}, {role: 'user', content: executeChat(description, contents)}],
  });
  console.log('Received GPT response: ', subtaskResponse.data.choices[0].message.content);
  const taskJSON = parseMessage(subtaskResponse.data.choices[0].message.content);
  return taskJSON;
}

module.exports = {
  fetchSubtasks,
  executeTask
}
