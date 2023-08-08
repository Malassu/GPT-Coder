const { GITHUB_API_BASE_URL, MAX_REPO_RECURSION } = require('./config');
const { fetchChatCompletion } = require('./gpt');
const { initialChat, executeChat, taskResponseSchema, retryTasksPrompt, executeResponseSchema, retryExecutionPrompt } = require('./schema')
const { createBranch, generateUniqueBranchName, expandRepoContents, fetchRepoContents, getFileSha, putFile, parseMessage, parseXMLMessage } = require('./helpers')
const axios = require('axios');
const util = require('util')
const Ajv = require('ajv');

const ajv = new Ajv();

async function createPullRequest(description, repository, ghToken, apiToken) {
  const validateTask = ajv.compile(taskResponseSchema);
  const resultTask = await fetchChatCompletion(initialChat(description), apiToken);
  let parsedTask = parseMessage(resultTask);
  let isValidTask = validateTask(parsedTask);
  if (!isValidTask) {
    console.warn('Invalid response from GPT, retrying. Response: ', parsedTask);
    const retryTask = [{role: 'assistant', content: resultTask}, {role: 'user', content: retryTasksPrompt}];
    const resultTaskRetried = await fetchChatCompletion(initialChat(description), apiToken, retryTask);
    parsedTask = parseMessage(resultTaskRetried);
    isValidTask = validateTask(parsedTask);
    if (!isValidTask) throw new Error('Invalid GPT response after retry');
  }
  const subtasks = parsedTask.subtasks;
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
    console.log('Repo contents: ', util.inspect(expRepoContents, {depth: MAX_REPO_RECURSION}));
    for (let i = 0; i < subtasks.length; i++) {
      let subtask = subtasks[i];
      const validateExc = ajv.compile(executeResponseSchema);
      const resultExc = await fetchChatCompletion(executeChat(subtask.description), apiToken);
      let taskResult = parseXMLMessage(resultExc);
      let isValidExc = validateExc(taskResult);
      if (!isValidExc) {
        console.warn('Invalid response from GPT, retrying..')
        const retryExc = [{role: 'assistant', content: resultExc}, {role: 'user', content: retryExecutionPrompt}];
        const resultExcRetried = await fetchChatCompletion(executeChat(subtask.description), apiToken, retryExc);
        taskResult = parseMessage(resultExcRetried);
        isValidExc = validateExc(taskResult);
        if (!isValidExc) throw new Error('Invalid GPT response after retry');
      }
      taskResult = taskResult.filelist;
      console.log('Subtask execution: ', util.inspect(taskResult, {depth: MAX_REPO_RECURSION}));
      for (let j = 0; j < taskResult.modification.length; j++) {
        let item = taskResult.modification[j];
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
      console.log('Updated repo contents: ', util.inspect(expRepoContents, {depth: MAX_REPO_RECURSION}));
    }
    return expRepoContents;

  } catch (error) {
    console.error('Error fetching GitHub information:', error);
    throw error;
  }
}

module.exports = {
  createPullRequest
};
