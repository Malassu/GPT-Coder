const { getFileSha } = require('../src/helpers'); // Adjust the path to the function file accordingly

describe('getFileSha', () => {
  let data;

  beforeEach(() => {
    // Initialize the data before each test
    data = [
      {
        type: 'dir',
        name: 'dir1',
        path: 'dir1',
        sha: 'dir1sha',
        content: [
          {
            type: 'file',
            name: 'file1.js',
            path: 'dir1/file1.js',
            sha: 'file1sha',
            content: btoa("console.log('hello world!')")
          },
        ],
      },
      {
        type: 'file',
        name: 'file0.js',
        path: 'file0.js',
        sha: 'file0sha',
        content: btoa("console.log('hello void!')")
      },
    ];
  });

  test('should get the sha of an existing file within a folder', () => {
    const searchPath = 'dir1/file1.js';
    const result = getFileSha(searchPath, data);

    expect(result).toBe("file1sha");
  });

  test('should get the sha of an existing file', () => {
    const searchPath = 'file0.js';
    const result = getFileSha(searchPath, data);

    expect(result).toBe("file0sha");
  });

  test('should return null on a non existing file', () => {
    const searchPath = 'none.js';
    const result = getFileSha(searchPath, data);

    expect(result).toBe(null);
  });

  test('should return null on a non existing file within a dir', () => {
    const searchPath = 'dir1/none.js';
    const result = getFileSha(searchPath, data);

    expect(result).toBe(null);
  });

});
