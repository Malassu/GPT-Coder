// Import the parseXMLMessage function and any other necessary modules
const { parseXMLMessage } = require('../src/helpers');

// Test Suite for XML Parser
describe('XML Parser', () => {
  // Test case 1: Test parsing of basic XML structure
  it('should parse basic XML structure correctly', () => {
    const xmlString = `
      <filelist>
        <modification>
          <path>index.html</path>
          <contents><h1>hello world!</h1></contents>
          <message>Create index.html</message>
        </modification>
      </filelist>
    `;

    const expectedOutput = {
      "filelist": {
        "modification": [
          {
            "path": "index.html",
            "contents": btoa("<h1>hello world!</h1>"),
            "message": "Create index.html"
          }
        ]
      }
    };

    expect(parseXMLMessage(xmlString)).toEqual(expectedOutput);
  });

  it('should ignore XML attributes', () => {
    const xmlString = `
      <filelist version='1.0'>
        <modification>
          <path>index.html</path>
          <contents><h1>hello world!</h1></contents>
          <message>Create index.html</message>
        </modification>
      </filelist>
    `;

    const expectedOutput = {
      "filelist": {
        "modification": [
          {
            "path": "index.html",
            "contents": btoa("<h1>hello world!</h1>"),
            "message": "Create index.html"
          }
        ]
      }
    };

    expect(parseXMLMessage(xmlString)).toEqual(expectedOutput);
  });

  // Test case 2: Test parsing with multiple modifications
  it('should parse XML with multiple modifications correctly', () => {
    const xmlString = `
      <filelist>
        <modification>
          <path>index.html</path>
          <contents><h1>hello world!</h1></contents>
          <message>Create index.html</message>
        </modification>
        <modification>
          <path>src/hello.html</path>
          <contents><html><head>Hello there</head></html></contents>
          <message>Create hello.html</message>
        </modification>
      </filelist>
    `;

    const expectedOutput = {
      "filelist": {
        "modification": [
          {
            "path": "index.html",
            "contents": btoa("<h1>hello world!</h1>"),
            "message": "Create index.html"
          },
          {
            "path": "src/hello.html",
            "contents": btoa("<html><head>Hello there</head></html>"),
            "message": "Create hello.html"
          }
        ]
      }
    };

    expect(parseXMLMessage(xmlString)).toEqual(expectedOutput);
  });

  // Test case 3: Test parsing when contents are empty
  it('should parse XML with empty contents correctly', () => {
    const xmlString = `
      <filelist>
        <modification>
          <path>index.html</path>
          <contents></contents>
          <message>Create index.html</message>
        </modification>
      </filelist>
    `;

    const expectedOutput = {
      "filelist": {
        "modification": [
          {
            "path": "index.html",
            "contents": btoa(""),
            "message": "Create index.html"
          }
        ]
      }
    };

    expect(parseXMLMessage(xmlString)).toEqual(expectedOutput);
  });

  it('should trim any leading and trailing characters', () => {
    const xmlString = `I'm a language model, here's my answer:
      <filelist>
        <modification>
          <path>index.html</path>
          <contents><h1>hello world!</h1></contents>
          <message>Create index.html</message>
        </modification>
      </filelist> Hopefully this helps!
    `;

    const expectedOutput = {
      "filelist": {
        "modification": [
          {
            "path": "index.html",
            "contents": btoa("<h1>hello world!</h1>"),
            "message": "Create index.html"
          }
        ]
      }
    };

    expect(parseXMLMessage(xmlString)).toEqual(expectedOutput);
  });
});