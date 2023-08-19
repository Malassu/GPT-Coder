// Import the parseXMLMessage function and any other necessary modules
const { parseXMLMessage } = require('../src/helpers');

// Test Suite for XML Parser
describe('XML Parser', () => {
  // Test case 1: Test parsing of basic XML structure
  it('should parse basic XML structure correctly', () => {
    const xmlString = `
        <|fileUpdate>
          <|path>index.html</|path>
          <|contents><h1>hello world!</h1></|contents>
          <|message>Create index.html</|message>
        </|fileUpdate>
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
        <|fileUpdate>
          <|path>index.html</|path>
          <|contents><h1>hello world!</h1></|contents>
          <|message>Create index.html</|message>
        </|fileUpdate>
        <|fileUpdate>
          <|path>src/hello.html</|path>
          <|contents><html><head>Hello there</head></html></|contents>
          <|message>Create hello.html</|message>
        </|fileUpdate>
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
        <|fileUpdate>
          <|path>index.html</|path>
          <|contents></|contents>
          <|message>Create index.html</|message>
        </|fileUpdate>
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
        <|fileUpdate>
          <|path>index.html</|path>
          <|contents><h1>hello world!</h1></|contents>
          <|message>Create index.html</|message>
        </|fileUpdate>
      Hopefully this helps!
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
  it('should parse XML with JSON and HTML correctly', () => {
    const xmlString = `
<|fileUpdate><|path>package.json</|path><|contents>{
  "name": "fullstack-application",
  "version": "1.0.0",
  "description": "",
  "main": "src/index.js",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "react": "^16.13.1",
    "react-dom": "^16.13.1",
    "react-scripts": "3.4.1"
  }
}</|contents><|message>Create package.json file</|message></|fileUpdate>
<|fileUpdate><|path>src/index.html</|path><|contents>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html></|contents><|message>Create index.html file</|message></|fileUpdate>
    `;

    const expectedOutput = {
      "filelist": {
        "modification": [
          {
            "path": "package.json",
            "contents": btoa(`{
  "name": "fullstack-application",
  "version": "1.0.0",
  "description": "",
  "main": "src/index.js",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "react": "^16.13.1",
    "react-dom": "^16.13.1",
    "react-scripts": "3.4.1"
  }
}`),
            "message": "Create package.json file"
          },
          {
            "path": "src/index.html",
            "contents": btoa(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`),
            "message": "Create index.html file"
          }
        ]
      }
    };
    expect(parseXMLMessage(xmlString)).toEqual(expectedOutput);
  });

});