const { createPullRequest } = require('../src/service');
const { fetchChatCompletion } = require('../src/gpt');
const { fetchRepoContents, expandRepoContents, createBranch, cloneGitRepository } = require('../src/helpers');
const axios = require('axios');

jest.mock('../src/gpt', () => ({
  fetchChatCompletion: jest.fn()
}));

jest.mock('../src/helpers', () => ({
  ...jest.requireActual('../src/helpers'),
  fetchRepoContents: jest.fn(),
  expandRepoContents: jest.fn(),
  createBranch: jest.fn(),
  cloneGitRepository: jest.fn()
}));

const initialRepo = [
  {
    "name": "README.md",
    "path": "README.md",
    "sha": "d37d7779cd624f70485b66967d45f2553a283b82",
    "size": 23,
    "type": "file"
  }
]

const repoInfo = {
  "id": 403020410,
  "node_id": "MDEwOlJlcG9zaXRvcnk0MDMwMjA0MTA=",
  "name": "react-weatherapp",
  "full_name": "Malassu/react-weatherapp",
  "private": false,
  "owner": {
    "login": "Malassu"
  },
  "default_branch": "master"
}

const expandedRepo = [
    {
      "name": "README.md",
      "path": "README.md",
      "sha": "d37d7779cd624f70485b66967d45f2553a283b82",
      "content": btoa("This is a fullstack-application"),
      "size": 23,
      "type": "file"
    }
  ]

// Mock the axios module
jest.mock('axios');

describe('createPullRequest', () => {
  // Mocked values
  const description = 'user message';
  const repository = 'your/repository';
  const tmpDir = 'tmp-repository';
  const ghToken = 'github-token';
  const apiToken = 'api-token';

  it('updates file successfully', async () => {
    // Mock the fetchChatCompletion function for different calls
    fetchChatCompletion.mockResolvedValueOnce(`
      <|fileUpdate>
        <|path>README.md</|path>
        <|contents>These are the new contents</|contents>
        <|message>Update README.md</|message>
      </|fileUpdate>`
    );
    fetchChatCompletion.mockResolvedValueOnce('{"prTitle": "PR Title"}');

    // Mock the fetchRepoContents and expandRepoContents functions
    fetchRepoContents.mockResolvedValue(initialRepo);
    expandRepoContents.mockResolvedValue(expandedRepo);

    // Mock the createBranch function
    createBranch.mockResolvedValue();

    // Mock the axios get and put requests
    axios.get.mockResolvedValueOnce({
      data: repoInfo,
    });
    axios.put.mockResolvedValueOnce({
      data: { content: { sha: 'new-sha' } },
    });
    axios.post.mockResolvedValueOnce({
      data: { html_url: 'github.com/pr' },
    });
    const updatedRepo = [
        {
          "name": "README.md",
          "path": "README.md",
          "sha": "new-sha",
          "content": btoa("These are the new contents"),
          "size": 23,
          "type": "file"
        }
      ]
    // Call the function and check the result
    const result = (await createPullRequest(description, repository, ghToken, apiToken)).repoContents;
    expect(result).toEqual(updatedRepo);
  });

  it('creates new file successfully', async () => {
    // Mock the fetchChatCompletion function for different calls
    fetchChatCompletion.mockResolvedValueOnce(`
      <|fileUpdate>
        <|path>index.html</|path>
        <|contents><h1>Hello world!</h1></|contents>
        <|message>Create index.html</|message>
      </|fileUpdate>`
    );
    fetchChatCompletion.mockResolvedValueOnce('{"prTitle": "PR Title"}');

    // Mock the fetchRepoContents and expandRepoContents functions
    fetchRepoContents.mockResolvedValue(initialRepo);
    expandRepoContents.mockResolvedValue(expandedRepo);

    // Mock the createBranch function
    createBranch.mockResolvedValue();

    // Mock the axios get and put requests
    axios.get.mockResolvedValueOnce({
      data: repoInfo,
    });
    axios.put.mockResolvedValueOnce({
      data: { content: { sha: 'new-sha' } },
    });
    axios.post.mockResolvedValueOnce({
      data: { html_url: 'github.com/pr' },
    });
    const updatedRepo = [
        ...expandedRepo,
        {
            "name": "index.html",
            "path": "index.html",
            "sha": "new-sha",
            "type": "file",
            "content": btoa("<h1>Hello world!</h1>")
        }
      ]
    // Call the function and check the result
    const result = (await createPullRequest(description, repository, ghToken, apiToken)).repoContents;
    expect(result).toEqual(updatedRepo);
  });

  it('creates two files successfully', async () => {
    // Mock the fetchChatCompletion function for different calls
    fetchChatCompletion.mockResolvedValueOnce(`
  <|fileUpdate>
      <|path>index.js</|path>
      <|contents>
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
      </|contents>
      <|message>Create index.html</|message>
  </|fileUpdate>
  <|fileUpdate>
    <|path>second.js</|path>
    <|contents>console.log("Second file!")</|contents>
    <|message>Create second.js</|message>
  </|fileUpdate>`
);
    fetchChatCompletion.mockResolvedValueOnce('{"prTitle": "PR Title"}');

    // Mock the fetchRepoContents and expandRepoContents functions
    fetchRepoContents.mockResolvedValue(initialRepo);
    expandRepoContents.mockResolvedValue(expandedRepo);

    // Mock the createBranch function
    createBranch.mockResolvedValue();

    // Mock the axios get and put requests
    axios.get.mockResolvedValueOnce({
      data: repoInfo,
    });
    axios.put.mockResolvedValueOnce({
      data: { content: { sha: 'new-sha' } },
    });
    axios.put.mockResolvedValueOnce({
      data: { content: { sha: 'new-sha2' } },
    });
    axios.post.mockResolvedValueOnce({
      data: { html_url: 'github.com/pr' },
    });
    const updatedRepo = [
        ...expandedRepo,
        {
            "name": "index.js",
            "path": "index.js",
            "sha": "new-sha",
            "type": "file",
            "content": btoa(`import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);`)
        },
        {
          "name": "second.js",
          "path": "second.js",
          "sha": "new-sha2",
          "type": "file",
          "content": btoa('console.log("Second file!")')
        }
      ]
    // Call the function and check the result
    const result = (await createPullRequest(description, repository, ghToken, apiToken)).repoContents;
    expect(result).toEqual(updatedRepo);
  });

  it('creates new file in a folder successfully', async () => {
    // Mock the fetchChatCompletion function for different calls
    fetchChatCompletion.mockResolvedValueOnce(`
      <|fileUpdate>
        <|path>src/App.js</|path>
        <|contents>import React from 'react';</|contents>
        <|message>Create App.js</|message>
      </|fileUpdate>`
    );
    fetchChatCompletion.mockResolvedValueOnce('{"prTitle": "PR Title"}');

    // Mock the fetchRepoContents and expandRepoContents functions
    fetchRepoContents.mockResolvedValue(initialRepo);
    expandRepoContents.mockResolvedValue(expandedRepo);

    // Mock the createBranch function
    createBranch.mockResolvedValue();

    // Mock the axios get and put requests
    axios.get.mockResolvedValueOnce({
      data: repoInfo,
    });
    axios.put.mockResolvedValueOnce({
      data: { content: { sha: 'new-sha' } },
    });
    axios.post.mockResolvedValueOnce({
      data: { html_url: 'github.com/pr' },
    });
    const updatedRepo = [
        ...expandedRepo,
        {
            "name": "src",
            "path": "src",
            "type": "dir",
            "content": [
                {
                    "name": "App.js",
                    "path": "src/App.js",
                    "sha": "new-sha",
                    "type": "file",
                    "content": btoa("import React from 'react';")
                }
            ]
        }
      ]
    // Call the function and check the result
    const result = (await createPullRequest(description, repository, ghToken, apiToken)).repoContents;
    expect(result).toEqual(updatedRepo);
  });

  it('updates file successfully on cli', async () => {
    // Mock the fetchChatCompletion function for different calls
    var shell = require('shelljs');
    shell.mkdir([tmpDir]);
    shell.touch([`${tmpDir}/README.md`]);
    shell.exec(`echo "This is a fullstack-application" > ${tmpDir}/README.md`);
    fetchChatCompletion.mockResolvedValueOnce(`
      <|fileUpdate>
        <|path>README.md</|path>
        <|contents>These are the new contents</|contents>
        <|message>Update README.md</|message>
      </|fileUpdate>`
    );
    fetchChatCompletion.mockResolvedValueOnce('{"prTitle": "PR Title"}');

    cloneGitRepository.mockReturnValue(tmpDir);

    // Mock the createBranch function
    createBranch.mockResolvedValue();

    // Mock the axios get and put requests
    axios.get.mockResolvedValueOnce({
      data: repoInfo,
    });
    axios.get.mockResolvedValueOnce({
      data: {sha: "fetched-sha"},
    });
    axios.put.mockResolvedValueOnce({
      data: { content: { sha: 'updated-sha' } },
    });
    axios.post.mockResolvedValueOnce({
      data: { html_url: 'github.com/pr' },
    });
    const updatedRepo = [
        {
          "name": "README.md",
          "path": "README.md",
          "sha": "updated-sha",
          "type": "file",
          "content": btoa("These are the new contents")
        }
      ]
    // Call the function and check the result
    const result = (await createPullRequest(description, repository, ghToken, apiToken, true)).repoContents;
    expect(result).toEqual(updatedRepo);
  });

  it('creates new file successfully on cli', async () => {
    // Mock the fetchChatCompletion function for different calls
    var shell = require('shelljs');
    shell.mkdir([`${tmpDir}-2`]);
    shell.touch([`${tmpDir}-2/README.md`]);
    shell.exec(`echo "This is a fullstack-application" > ${tmpDir}-2/README.md`);
    fetchChatCompletion.mockResolvedValueOnce(`
      <|fileUpdate>
        <|path>index.html</|path>
        <|contents><h1>Hello world!</h1></|contents>
        <|message>Create index.html</|message>
      </|fileUpdate>`
    );
    fetchChatCompletion.mockResolvedValueOnce('{"prTitle": "PR Title"}');

    cloneGitRepository.mockReturnValue(`${tmpDir}-2`);

    // Mock the createBranch function
    createBranch.mockResolvedValue();

    // Mock the axios get and put requests
    axios.get.mockResolvedValueOnce({
      data: repoInfo,
    });
    axios.get.mockRejectedValueOnce({
      response: {
        status: 404,
        data: 'Not Found',
      },
    });
    axios.put.mockResolvedValueOnce({
      data: { content: { sha: 'new-sha' } },
    });
    axios.post.mockResolvedValueOnce({
      data: { html_url: 'github.com/pr' },
    });
    const updatedRepo = [
        {
          "name": "README.md",
          "path": "README.md",
          "sha": undefined,
          "type": "file",
          "content": btoa("This is a fullstack-application\n")
        },
        {
            "name": "index.html",
            "path": "index.html",
            "sha": "new-sha",
            "type": "file",
            "content": btoa("<h1>Hello world!</h1>")
        }
      ]
    // Call the function and check the result
    const result = (await createPullRequest(description, repository, ghToken, apiToken, true)).repoContents;
    expect(result).toEqual(updatedRepo);
  });

});
