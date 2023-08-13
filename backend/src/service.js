const { GITHUB_API_BASE_URL, MAX_REPO_RECURSION } = require('./config');
const { fetchChatCompletion } = require('./gpt');
const { executeChat, printRepo, executeResponseSchema, retryExecutionPrompt, prTitle, prTitleSchema } = require('./schema')
const { createBranch, generateUniqueBranchName, expandRepoContents, fetchRepoContents, getFileSha, putFile, parseXMLMessage, parseJSONMessage } = require('./helpers')
const axios = require('axios');
const util = require('util')
const Ajv = require('ajv');

const ajv = new Ajv();

async function createPullRequest(description, repository, ghToken, apiToken) {
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
    const validateExc = ajv.compile(executeResponseSchema);
    const resultExc = await fetchChatCompletion(
      executeChat(description, printRepo(expRepoContents)), apiToken
    );
    let taskResult = parseXMLMessage(resultExc);
    console.log('Task execution result: ', util.inspect(taskResult, {depth: MAX_REPO_RECURSION}));
    let isValidExc = validateExc(taskResult);
    if (!isValidExc) {
      console.warn('Invalid response from GPT, retrying..')
      const retryExc = [{role: 'assistant', content: resultExc}, {role: 'user', content: retryExecutionPrompt}];
      const resultExcRetried = await fetchChatCompletion(
        executeChat(description, printRepo(expRepoContents)), apiToken, retryExc
      );
      taskResult = parseXMLMessage(resultExcRetried);
      isValidExc = validateExc(taskResult);
      if (!isValidExc) throw new Error('Invalid GPT response after retry');
    }
    taskResult = taskResult.filelist;
    console.log('Subtask execution: ', util.inspect(taskResult, {depth: MAX_REPO_RECURSION}));
    for (let j = 0; j < taskResult.modification.length; j++) {
      let item = taskResult.modification[j];
      let content = item.contents;
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
    const validatePr = ajv.compile(prTitleSchema);
    const resultPr = await fetchChatCompletion(
      prTitle(description), apiToken
    );
    let prResult = parseJSONMessage(resultPr);
    console.log('PR title result: ', prResult);
    let isValidPr = validatePr(prResult);
    let prTitleText = `CodeGPT task: ${newBranch}`;
    if (isValidPr) prTitleText = prResult.prTitle;
    let pullRes = await axios.post(`${GITHUB_API_BASE_URL}/repos/${repository}/pulls`,
      {
        head: newBranch,
        base: defaultBranch,
        body: description,
        title: prTitleText
      },
      {
        headers: {
          Authorization: `Bearer ${ghToken}`,
        },
      }
    )
    return {'pullRequest': pullRes.data.html_url};

  } catch (error) {
    console.error('Error fetching GitHub information:', error);
    throw error;
  }
}

module.exports = {
  createPullRequest
};
