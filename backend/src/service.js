const { GITHUB_API_BASE_URL } = require('./config');
const { fetchChatCompletion } = require('./gpt');
const axios = require('axios');

async function parseGitFolder(repository, token, user) {
  return
}

async function createPullRequest(description, repository, ghToken, apiToken) {
  const subtaskResponse = fetchChatCompletion(description, apiToken);
  const userResponse = await axios.get(`${GITHUB_API_BASE_URL}/user`, {
    headers: {
      Authorization: `Bearer ${ghToken}`,
    },
  });
  const user = userResponse.data.login;
  const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${user}/${repository}/contents/`, {
    headers: {
      Authorization: `Bearer ${ghToken}`,
    },
  });
  return response.data;
}

module.exports = {
  createPullRequest
};
