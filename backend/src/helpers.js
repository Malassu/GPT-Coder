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
  const baseRef = `heads/${baseBranch}`;
  const branchReference = await getBranchReference(baseRef, repository, ghToken);
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
    return response.data;
  } catch (error) {
    console.error('Error creating branch:', error);
    throw error;
  }
}

async function fetchRepoContents(repository, branch, ghToken) {
  const repoResponse = await axios.get(`${GITHUB_API_BASE_URL}/repos/${repository}/contents/`,
    {
      ref: `refs/heads/${branch}`
    },
    {
      headers: {
        Authorization: `Bearer ${ghToken}`,
      },
    }
  );
  return repoResponse.data;
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function expandRepoContents(contents, repository, ghToken, newBranch) {
  if (Array.isArray(contents)) {
    const expandedContents = await Promise.all(contents.map(async (item) => await expandRepoContents(item, repository, ghToken, newBranch)));
    return expandedContents;
  } else if (typeof contents === 'object' && contents !== null) {
    const objectContents = await axios.get(`${GITHUB_API_BASE_URL}/repos/${repository}/contents/${contents.path}`,
      {
        ref: `refs/heads/${newBranch}`
      },
      {
        headers: {
          Authorization: `Bearer ${ghToken}`,
        },
      }
    );
    await sleep(150);
    if (contents.type === 'file') {
      contents.content = objectContents.data.content;
      return contents;
    } else if (contents.type === 'dir') {
      contents.content = await expandRepoContents(objectContents.data, repository, ghToken, newBranch);
      return contents;
    }
  }
  return contents;
}

module.exports = {
  createBranch,
  generateUniqueBranchName,
  expandRepoContents,
  fetchRepoContents,
  sleep
}
