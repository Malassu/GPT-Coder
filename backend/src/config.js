const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN || 'YOUR_DEFAULT_GITHUB_ACCESS_TOKEN';
const PORT = process.env.PORT || 3000;

module.exports = {
  GITHUB_API_BASE_URL,
  GITHUB_ACCESS_TOKEN,
  PORT,
};
