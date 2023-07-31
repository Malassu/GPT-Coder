const { Configuration, OpenAIApi } = require('openai');
const { initialChat, preamble } = require('./schema')
const { OPENAI_API_KEY, GPT_MODEL } = require('./config');

const parseMessage = (message) => {
  const start = message.indexOf('{');
  const end = message.lastIndexOf('}');
  const jsonString = message.slice(start, end + 1);
  return JSON.parse(jsonString);
}

// Remove after testing
const mockResponse = {
  subtasks: [
    { description: 'Create a .env file in the backend application' },
    {
      description: 'Identify all configurable variables used in the application'
    },
    { description: 'Move the hardcoded variables to the .env file' },
    {
      description: 'Ensure the application can read and use the values from the .env file'
    }
  ]
}

async function fetchChatCompletion(description, apiToken) {
  const configuration = new Configuration({
    apiKey: apiToken,
  });
  
  const gptApi = new OpenAIApi(configuration);
  //const subtaskResponse = await gptApi.createChatCompletion({
  //model: GPT_MODEL,
  //messages: [{role: 'system', content: preamble}, {role: 'user', content: initialChat(description)}],
  //});
  //const subtasksJSON = parseMessage(subtaskResponse.data.choices[0].message.content);
  const subtasksJSON = mockResponse;
  return subtasksJSON;
}

module.exports = {
  fetchChatCompletion
}
