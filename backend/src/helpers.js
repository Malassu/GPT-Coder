/* eslint no-useless-escape: 0 */
const { GITHUB_API_BASE_URL } = require('./config');
const axios = require('axios');

const filteredExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.bmp',
  'package-lock.json',
  'yarn.lock',
  'license',
  '.zip',
  '.tar',
  '.gz',
  '.git',
  '.gitignore'
];

function isExcluded(filePath) {
  const extension = filePath.toLowerCase();
  return filteredExtensions.some(item => extension.includes(item));
}

function generateUniqueBranchName() {
  const prefix = 'gpt-coder-task';
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 8);

  return `${prefix}-${timestamp}-${randomString}`;
}

function putFile(searchPath, newContent, newSha, data, path = '') {
  for (const item of data) {
    if (item.type === 'file' && item.path === searchPath) {
      item.sha = newSha;
      item.content = newContent;
      return true;
    } else if (item.type === 'dir' && Array.isArray(item.content) && searchPath.includes(item.path)) {
      const found = putFile(searchPath, newContent, newSha, item.content, item.path);
      if (found) {
        return true;
      }
    }
  }
  let currentPath = path;
  var traversed = path.split('/')
  var pathParts = searchPath.split('/');
  const fileName = pathParts.pop();
  let currentDir = data;
  if (traversed.length === 1 && traversed[0] === '') traversed = [];
  pathParts = pathParts.slice(traversed.length);

  for (const dirName of pathParts) {
    let dirObj = currentDir.find(item => item.type === 'dir' && item.name === dirName);
    let newPath = `${currentPath}/${dirName}`;
    if (currentPath === '') newPath = dirName;
    if (!dirObj) {
      dirObj = { name: dirName, type: 'dir', path: newPath, content: [] };
      currentDir.push(dirObj);
    }
    currentDir = dirObj.content;
    currentPath = newPath;
  }

  currentDir.push({ name: fileName, type: 'file', path: searchPath, sha: newSha, content: newContent });
  return true;
}

function updateFile(searchPath, newContent, newSha, data) {
  for (const item of data) {
    if (item.type === 'file' && item.path === searchPath) {
      item.sha = newSha;
      item.content = newContent;
      return true;
    } else if (item.type === 'dir' && Array.isArray(item.content) && searchPath.includes(item.path)) {
      const found = updateFile(searchPath, newContent, newSha, item.content);
      if (found) {
        return true;
      }
    }
  }

  return true;
}

function getFileSha(path, contents) {
  for (const item of contents) {
    if (item.type === 'file' && item.path === path) {
      return item.sha;
    } else if (item.type === 'dir' && Array.isArray(item.content) && path.includes(item.path)) {
      const foundSha = getFileSha(path, item.content);
      if (foundSha !== null) {
        return foundSha;
      }
    }
  }

  return null;
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
  try {
    const repoResponse = await axios.get(`${GITHUB_API_BASE_URL}/repos/${repository}/contents/`,
      {
        headers: {
          Authorization: `Bearer ${ghToken}`,
        },
      },
      {
        params: {
          ref: `refs/heads/${branch}`
        }
      }
    );
    return repoResponse.data;
  } catch (error) {
    console.error('Error fetching repo contents:', error);
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function expandRepoContents(contents, repository, ghToken, newBranch) {
  if (Array.isArray(contents)) {
    contents = contents.filter((item) => !isExcluded(item.path));
    const expandedContents = await Promise.all(contents.map(async (item) => await expandRepoContents(item, repository, ghToken, newBranch)));
    return expandedContents;
  } else if (typeof contents === 'object' && contents !== null) {
    const objectContents = await axios.get(`${GITHUB_API_BASE_URL}/repos/${repository}/contents/${contents.path}`,
      {
        headers: {
          Authorization: `Bearer ${ghToken}`,
        },
      },
      {
        params: {
          ref: `refs/heads/${newBranch}`
        }
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


function cloneGitRepository(repositoryFull, username, ghToken) {
  var shell = require('shelljs');
  if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
  }
  const tmpDir = generateUniqueBranchName();
  if(shell.exec(`git clone https://${username}:${ghToken}@github.com/${repositoryFull}.git ${tmpDir}`).code !== 0) throw new Error('Cannot clone git repository');
  return tmpDir;
}


function expandRepoContentsCli(tmpDir) {
  var shell = require('shelljs');
  const contents = [];
  shell.find(`${tmpDir}/`).map(function(file){
    let newStr = file.replace(`${tmpDir}/`, '');
    if (newStr !== '') return newStr;
  })
    .filter(function(file) {
      if(file == undefined) return false;
      return !isExcluded(file);
    })
    .forEach(function(file) {
      try {
        let contentRes = shell.cat([`${tmpDir}/${file}`])
        if(contentRes.code === 0) {
          contents.push({name: file.split('/').at(-1), path: file, type: 'file', content: btoa(contentRes), sha: undefined});
        }
      } catch (error) {
        console.warn(`Encountered error: ${error} while processing file: `, file);
      }
    });
  shell.rm('-rf', tmpDir);
  return contents;
}

function parseXMLMessage(message) {
  const result = {'filelist':  {'modification': []}};
  const modRegex = /\<\|fileUpdate\>([\s\S]+?)\<\/\|fileUpdate\>/g;
  const pathRegex = /\<\|path\>([\s\S]+?)\<\/\|path\>/;
  const contentsRegex = /\<\|contents\>([\s\S]+?)\<\/\|contents\>/;
  const messageRegex = /\<\|message\>([\s\S]+?)\<\/\|message\>/;
  let modification;

  while((modification = modRegex.exec(message))) {
    const path = modification[1].match(pathRegex);
    const contents = modification[1].match(contentsRegex);
    const message = modification[1].match(messageRegex);
    if(path && message) {
      let parsedContents = '';
      if (contents) parsedContents = contents[1].trim();
      console.log('Parsed contents: ', parsedContents);
      result['filelist']['modification'].push({
        'path': path[1],
        'contents': btoa(parsedContents),
        'message': message[1]
      })
    }
  }

  return result;
}

const parseJSONMessage = (message) => {
  const start = message.indexOf('{');
  const end = message.lastIndexOf('}');
  const jsonString = message.slice(start, end + 1);
  return JSON.parse(jsonString);
}

module.exports = {
  cloneGitRepository,
  expandRepoContentsCli,
  createBranch,
  generateUniqueBranchName,
  expandRepoContents,
  fetchRepoContents,
  sleep,
  getFileSha,
  updateFile,
  putFile,
  parseXMLMessage,
  parseJSONMessage
}
