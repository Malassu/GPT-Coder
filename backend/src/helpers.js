const { GITHUB_API_BASE_URL } = require('./config');
const axios = require('axios');

function generateUniqueBranchName() {
  const prefix = 'gpt-coder-task';
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 8);

  return `${prefix}-${timestamp}-${randomString}`;
}

async function createBranch(branchName, baseBranch, repository, ghToken) {
  const url = `${GITHUB_API_BASE_URL}/repos/${repository}/git/refs`;

  const branchRef = `refs/heads/${branchName}`;
  const baseRef = `heads/${baseBranch}`
  const branchReference = await getBranchReference(baseRef, repository, ghToken)
  console.log("Branch reference: ", branchReference)
  try {
    const response = await axios.post(
      url,
      {
          ref: branchRef,
          sha: branchReference.object.sha,
      },
      {
        headers: {
          Authorization: `Bearer ${ghToken}`,
        },
      }
    );

    console.log('Branch created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating branch:', error);
    throw error;
  }
}

async function getBranchReference(branchRef, repository, ghToken) {
  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/repos/${repository}/git/ref/${branchRef}`, {
      headers: {
        Authorization: `Bearer ${ghToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching branch information:', error);
    throw error;
  }
}

module.exports = {
  createBranch,
  generateUniqueBranchName
}