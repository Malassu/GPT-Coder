const { putFile } = require('../src/helpers'); // Adjust the path to the function file accordingly

describe('putFile', () => {
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

  test('should update the sha of an existing file', () => {
    const searchPath = 'dir1/file1.js';
    const newSha = 'new_sha';
    const newContent = btoa("console.log('hello space!')");
    const result = putFile(searchPath, newContent, newSha, data);

    expect(result).toBe(true);
    expect(data[0].content[0].sha).toBe(newSha);
    expect(data[0].content[0].content).toBe(newContent);
    expect(data[0].content[0].name).toBe(searchPath.split("/").pop());
  });

  test('should update the sha of an existing file in base dir', () => {
    const searchPath = 'file0.js';
    const newSha = 'new_sha';
    const newContent = btoa("console.log('hello nothingness!')");
    const result = putFile(searchPath, newContent, newSha, data);

    expect(result).toBe(true);
    expect(data[1].sha).toBe(newSha);
    expect(data[1].content).toBe(newContent);
    expect(data[1].name).toBe(searchPath);
  });

  test('should add a new file to an existing directory', () => {
    const searchPath = 'dir1/file2.js';
    const newSha = 'sha2';
    const newContent = btoa("console.log('new file!')");
    const result = putFile(searchPath, newContent, newSha, data);

    expect(result).toBe(true);
    expect(data[0].content.length).toBe(2);
    expect(data[0].content[1].path).toBe(searchPath);
    expect(data[0].content[1].sha).toBe(newSha);
    expect(data[0].content[1].content).toBe(newContent);
    expect(data[0].content[1].name).toBe(searchPath.split("/").pop());
  });

  test('should add a new file to a new directory within a directory', () => {
    const searchPath = 'dir1/dir2/file2.js';
    const newSha = 'sha2';
    const newContent = btoa("console.log('new file!')");
    const result = putFile(searchPath, newContent, newSha, data);

    expect(result).toBe(true);
    expect(data[0].content.length).toBe(2);
    expect(data[0].content[1].content.length).toBe(1);
    expect(data[0].content[1].content[0].path).toBe(searchPath);
    expect(data[0].content[1].content[0].sha).toBe(newSha);
    expect(data[0].content[1].content[0].content).toBe(newContent);
    expect(data[0].content[1].content[0].name).toBe(searchPath.split("/").pop());
  });

  test('should add a new file to a new directory', () => {
    const searchPath = 'dir2/file3.js';
    const newSha = 'sha3';
    const newContent = btoa("console.log('new file in a new dir!')");
    const result = putFile(searchPath, newContent, newSha, data);

    expect(result).toBe(true);
    expect(data.length).toBe(3);
    expect(data[2].path).toBe('dir2');
    expect(data[2].content.length).toBe(1);
    expect(data[2].content[0].path).toBe(searchPath);
    expect(data[2].content[0].sha).toBe(newSha);
    expect(data[2].content[0].content).toBe(newContent);
    expect(data[2].content[0].name).toBe(searchPath.split("/").pop());
  });

  test('should add a new file to base directory', () => {
    const searchPath = 'file3.js';
    const newSha = 'sha3';
    const newContent = btoa("console.log('new file in base dir!')");
    const result = putFile(searchPath, newContent, newSha, data);

    expect(result).toBe(true);
    expect(data.length).toBe(3);
    expect(data[2].path).toBe(searchPath);
    expect(data[2].name).toBe(searchPath);
    expect(data[2].content).toBe(newContent);
    expect(data[2].sha).toBe(newSha);
  });
});
