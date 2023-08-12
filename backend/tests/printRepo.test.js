const { printRepo } = require('../src/schema');


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
    },
    {
      "name": "index.html",
      "path": "index.html",
      "sha": "new-sha",
      "type": "file",
      "content": btoa("<h1>Hello world!</h1>")
    },
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

describe('printRepo', () => {

  it('prints repo successfully', async () => {
    const printedRepo = `
File path:
README.md
File contents:
This is a fullstack-application
---
File path:
index.html
File contents:
<h1>Hello world!</h1>
---
File path:
src/App.js
File contents:
import React from 'react';
---`
    // Call the function and check the result
    const result = printRepo(expandedRepo);
    expect(result).toEqual(printedRepo);
  });

});
