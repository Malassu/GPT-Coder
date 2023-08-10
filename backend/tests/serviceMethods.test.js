const { createPullRequest } = require('../src/service');
const { fetchChatCompletion } = require('../src/gpt');
const { fetchRepoContents, expandRepoContents, createBranch } = require('../src/helpers');
const axios = require('axios');

jest.mock('../src/gpt', () => ({
  fetchChatCompletion: jest.fn()
}));

jest.mock('../src/helpers', () => ({
  ...jest.requireActual('../src/helpers'),
  fetchRepoContents: jest.fn(),
  expandRepoContents: jest.fn(),
  createBranch: jest.fn(),
}));

const initialRepo = [
  {
    "name": "README.md",
    "path": "README.md",
    "sha": "d37d7779cd624f70485b66967d45f2553a283b82",
    "size": 23,
    "url": "https://api.github.com/repos/QCodersOy/fullstack-application/contents/README.md?ref=main",
    "html_url": "https://github.com/QCodersOy/fullstack-application/blob/main/README.md",
    "git_url": "https://api.github.com/repos/QCodersOy/fullstack-application/git/blobs/d37d7779cd624f70485b66967d45f2553a283b82",
    "download_url": "https://raw.githubusercontent.com/QCodersOy/fullstack-application/main/README.md",
    "type": "file",
    "_links": {
      "self": "https://api.github.com/repos/QCodersOy/fullstack-application/contents/README.md?ref=main",
      "git": "https://api.github.com/repos/QCodersOy/fullstack-application/git/blobs/d37d7779cd624f70485b66967d45f2553a283b82",
      "html": "https://github.com/QCodersOy/fullstack-application/blob/main/README.md"
    }
  }
]

const expandedRepo = [
    {
      "name": "README.md",
      "path": "README.md",
      "sha": "d37d7779cd624f70485b66967d45f2553a283b82",
      "content": btoa("This is a fullstack-application"),
      "size": 23,
      "url": "https://api.github.com/repos/QCodersOy/fullstack-application/contents/README.md?ref=main",
      "html_url": "https://github.com/QCodersOy/fullstack-application/blob/main/README.md",
      "git_url": "https://api.github.com/repos/QCodersOy/fullstack-application/git/blobs/d37d7779cd624f70485b66967d45f2553a283b82",
      "download_url": "https://raw.githubusercontent.com/QCodersOy/fullstack-application/main/README.md",
      "type": "file",
      "_links": {
        "self": "https://api.github.com/repos/QCodersOy/fullstack-application/contents/README.md?ref=main",
        "git": "https://api.github.com/repos/QCodersOy/fullstack-application/git/blobs/d37d7779cd624f70485b66967d45f2553a283b82",
        "html": "https://github.com/QCodersOy/fullstack-application/blob/main/README.md"
      }
    }
  ]

// Mock the axios module
jest.mock('axios');

describe('createPullRequest', () => {
  // Mocked values
  const description = 'user message';
  const repository = 'your/repository';
  const ghToken = 'github-token';
  const apiToken = 'api-token';

  it('updates file successfully', async () => {
    // Mock the fetchChatCompletion function for different calls
    fetchChatCompletion.mockResolvedValueOnce('{"subtasks": [{"description": "Update README.md"}]}')
                       .mockResolvedValueOnce(`
                          <filelist>
                            <modification>
                                <path>README.md</path>
                                <contents>These are the new contents</contents>
                                <message>Update README.md</message>
                            </modification>
                          </filelist>`
                        );

    // Mock the fetchRepoContents and expandRepoContents functions
    fetchRepoContents.mockResolvedValue(initialRepo);
    expandRepoContents.mockResolvedValue(expandedRepo);

    // Mock the createBranch function
    createBranch.mockResolvedValue();

    // Mock the axios get and put requests
    axios.get.mockResolvedValueOnce({
      data: initialRepo,
    });
    axios.put.mockResolvedValueOnce({
      data: { content: { sha: 'new-sha' } },
    });
    const updatedRepo = [
        {
          "name": "README.md",
          "path": "README.md",
          "sha": "new-sha",
          "content": btoa("These are the new contents"),
          "size": 23,
          "url": "https://api.github.com/repos/QCodersOy/fullstack-application/contents/README.md?ref=main",
          "html_url": "https://github.com/QCodersOy/fullstack-application/blob/main/README.md",
          "git_url": "https://api.github.com/repos/QCodersOy/fullstack-application/git/blobs/d37d7779cd624f70485b66967d45f2553a283b82",
          "download_url": "https://raw.githubusercontent.com/QCodersOy/fullstack-application/main/README.md",
          "type": "file",
          "_links": {
            "self": "https://api.github.com/repos/QCodersOy/fullstack-application/contents/README.md?ref=main",
            "git": "https://api.github.com/repos/QCodersOy/fullstack-application/git/blobs/d37d7779cd624f70485b66967d45f2553a283b82",
            "html": "https://github.com/QCodersOy/fullstack-application/blob/main/README.md"
          }
        }
      ]
    // Call the function and check the result
    const result = await createPullRequest(description, repository, ghToken, apiToken);
    expect(result).toEqual(updatedRepo);
  });

  it('creates new file successfully', async () => {
    // Mock the fetchChatCompletion function for different calls
    fetchChatCompletion.mockResolvedValueOnce('{"subtasks": [{"description": "Create index.html"}]}')
                       .mockResolvedValueOnce(`
                          <filelist>
                            <modification>
                                <path>index.html</path>
                                <contents><h1>Hello world!</h1></contents>
                                <message>Create index.html</message>
                            </modification>
                          </filelist>`
                        );

    // Mock the fetchRepoContents and expandRepoContents functions
    fetchRepoContents.mockResolvedValue(initialRepo);
    expandRepoContents.mockResolvedValue(expandedRepo);

    // Mock the createBranch function
    createBranch.mockResolvedValue();

    // Mock the axios get and put requests
    axios.get.mockResolvedValueOnce({
      data: initialRepo,
    });
    axios.put.mockResolvedValueOnce({
      data: { content: { sha: 'new-sha' } },
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
    const result = await createPullRequest(description, repository, ghToken, apiToken);
    expect(result).toEqual(updatedRepo);
  });

  it('creates new file in a folder successfully', async () => {
    // Mock the fetchChatCompletion function for different calls
    fetchChatCompletion.mockResolvedValueOnce('{"subtasks": [{"description": "Create App.js"}]}')
                       .mockResolvedValueOnce(`
                          <filelist>
                            <modification>
                                <path>src/App.js</path>
                                <contents>import React from 'react';</contents>
                                <message>Create App.js</message>
                            </modification>
                          </filelist>`
                        );

    // Mock the fetchRepoContents and expandRepoContents functions
    fetchRepoContents.mockResolvedValue(initialRepo);
    expandRepoContents.mockResolvedValue(expandedRepo);

    // Mock the createBranch function
    createBranch.mockResolvedValue();

    // Mock the axios get and put requests
    axios.get.mockResolvedValueOnce({
      data: initialRepo,
    });
    axios.put.mockResolvedValueOnce({
      data: { content: { sha: 'new-sha' } },
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
    const result = await createPullRequest(description, repository, ghToken, apiToken);
    expect(result).toEqual(updatedRepo);
  });

});
