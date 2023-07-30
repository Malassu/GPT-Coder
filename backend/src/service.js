const { OPENAI_API_KEY, GPT_MODEL } = require('./config');
const { Configuration, OpenAIApi } = require('openai');
const { initialChat, preamble } = require('./schema')

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const gptApi = new OpenAIApi(configuration);

const parseMessage = (message) => {
  const start = message.indexOf('{');
  const end = message.lastIndexOf('}');
  const jsonString = message.slice(start, end + 1);
  return JSON.parse(jsonString);
}

async function createPullRequest(description, repository) {
  const subtaskResponse = await gptApi.createChatCompletion({
    model: GPT_MODEL,
    messages: [{role: 'system', content: preamble}, {role: 'user', content: initialChat(description)}],
  });
  return parseMessage(subtaskResponse.data.choices[0].message.content);
}

module.exports = {
  createPullRequest
};
