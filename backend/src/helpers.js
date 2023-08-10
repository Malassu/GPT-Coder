const { GITHUB_API_BASE_URL } = require('./config');
const axios = require('axios');
const { XMLSerializer } = require('xmldom');
const { DOMParser } = require('xmldom');

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
        ref: `refs/heads/${branch}`
      },
      {
        headers: {
          Authorization: `Bearer ${ghToken}`,
        },
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
      contents.content = atob(objectContents.data.content);
      return contents;
    } else if (contents.type === 'dir') {
      contents.content = await expandRepoContents(objectContents.data, repository, ghToken, newBranch);
      return contents;
    }
  }
  return contents;
}

function trimOutsideFilelistTags(str) {
  const regex = /(<filelist[\s\S]*<\/filelist>)/;
  const match = str.match(regex);
  if (match) {
    const insideFilelist = match[1].trim();
    return insideFilelist;
  } else {
    return '';
  }
}

function nodeToString(node) {
  const serializer = new XMLSerializer();
  let result = '';
  try {
    result = serializer.serializeToString(node);
  } catch (error) {
    console.log('nodeToString Error:', error.message);
  }
  return result;
}

const parseMessage = (message) => {
  const start = message.indexOf('{');
  const end = message.lastIndexOf('}');
  const jsonString = message.slice(start, end + 1);
  return JSON.parse(jsonString);
}

function parseXMLMessage(message) {
  const result = {'filelist':  {'modification': []}};
  const xmlString = trimOutsideFilelistTags(message);
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  const modifications = xmlDoc.getElementsByTagName('modification');
  for(let i = 0; i < modifications.length; i++) {
    let modification = modifications[i];
    let contents = modification.getElementsByTagName('contents')[0].childNodes[0]
    let parsedContents = nodeToString(contents);
    if(contents === undefined) parsedContents = '';
    result['filelist']['modification'].push({
      'path': modification.getElementsByTagName('path')[0].childNodes[0].nodeValue,
      'contents': btoa(parsedContents),
      'message': modification.getElementsByTagName('message')[0].childNodes[0].nodeValue
    })
  }
  return result;
}

module.exports = {
  createBranch,
  generateUniqueBranchName,
  expandRepoContents,
  fetchRepoContents,
  sleep,
  getFileSha,
  updateFile,
  putFile,
  parseMessage,
  parseXMLMessage
}
