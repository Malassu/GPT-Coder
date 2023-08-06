const { GITHUB_API_BASE_URL } = require('./config');
const { fetchSubtasks, executeTask } = require('./gpt');
const { createBranch, generateUniqueBranchName, expandRepoContents, fetchRepoContents, getFileSha, putFile } = require('./helpers')
const axios = require('axios');

async function createPullRequest(description, repository, ghToken, apiToken) {
  const subtasks = await fetchSubtasks(description, apiToken);
  try {
    const repoResponse = await axios.get(`${GITHUB_API_BASE_URL}/repos/${repository}`, {
      headers: {
        Authorization: `Bearer ${ghToken}`,
      },
    });

    const defaultBranch = repoResponse.data.default_branch;
    const newBranch = generateUniqueBranchName();
    await createBranch(newBranch, defaultBranch, repository, ghToken);

    var repoContents = await fetchRepoContents(repository, newBranch, ghToken);
    var expRepoContents = await expandRepoContents(repoContents, repository, ghToken, newBranch);
    console.log("Repo contents: ", expRepoContents);
    for (let i = 0; i < subtasks.length; i++) {
      let subtask = subtasks[i];
      let taskResult = await executeTask(subtask.description, expRepoContents, apiToken);
      console.log('Subtask execution: ', taskResult);
      for (let j = 0; j < taskResult.modifiedFiles.length; j++) {
        let item = taskResult.modifiedFiles[j];
        let content = btoa(item.contents);
        let params = {
          branch: newBranch,
          message: item.message,
          content: content,
        };
        let sha = getFileSha(item.path, expRepoContents);
        if(sha !== null) params['sha'] = sha;
        let fileRes = await axios.put(`${GITHUB_API_BASE_URL}/repos/${repository}/contents/${item.path}`,
          params,
          {
            headers: {
              Authorization: `Bearer ${ghToken}`,
            },
          }
        )
          .catch(function (error) {
            console.error('Error pushing to GitHub: ', error);
            throw error;
          });
        let createdSha = fileRes.data.content.sha;
        putFile(item.path, item.contents, createdSha, expRepoContents);
      }
      console.log("Updated repo contents: ", expRepoContents);
    }
    return {'result': 'SUCCESS'};

  } catch (error) {
    console.error('Error fetching GitHub information:', error);
    throw error;
  }
}

module.exports = {
  createPullRequest
};
