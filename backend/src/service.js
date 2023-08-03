const { GITHUB_API_BASE_URL } = require('./config');
const { fetchSubtasks } = require('./gpt');
const { createBranch, generateUniqueBranchName } = require('./helpers')
const axios = require('axios');

async function createPullRequest(description, repository, ghToken, apiToken) {
  const subtaskResponse = fetchSubtasks(description, apiToken);
  try {
    const repoResponse = await axios.get(`${GITHUB_API_BASE_URL}/repos/${repository}`, {
      headers: {
        Authorization: `Bearer ${ghToken}`,
      },
    });

    const defaultBranch = repoResponse.data.default_branch;
    const newBranch = generateUniqueBranchName();
    await createBranch(newBranch, defaultBranch, repository, ghToken);

    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${repository}/contents/`,
      {
        ref: `refs/heads/${newBranch}`
      },
      {
        headers: {
          Authorization: `Bearer ${ghToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching GitHub information:', error);
    throw error;
  }
}

module.exports = {
  createPullRequest
};
