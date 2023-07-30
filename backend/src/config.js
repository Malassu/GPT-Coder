require('dotenv').config();

const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 8000;
const GPT_MODEL = process.env.GPT_MODEL || 'gpt-3.5-turbo';

module.exports = {
  GITHUB_API_BASE_URL,
  GITHUB_ACCESS_TOKEN,
  PORT,
  OPENAI_API_KEY,
  GPT_MODEL
};
