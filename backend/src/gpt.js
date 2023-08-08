const { Configuration, OpenAIApi } = require('openai');
const { preamble } = require('./schema');
const { GPT_MODEL } = require('./config');

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

module.exports = {
  fetchChatCompletion
}
