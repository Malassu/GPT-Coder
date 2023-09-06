const executeResponseSchema = {
  'type': 'object',
  'properties': {
    'filelist': {
      'type': 'object',
      'properties': {
        'modification': {
          'type': 'array',
          'items': {
            'type': 'object',
            'properties': {
              'path': {'type': 'string'},
              'contents': {'type': 'string'},
              'message': {'type': 'string'}
            }
          }
        }
      }
    }
  }
}

const prTitleSchema = {
  'type': 'object',
  'properties': {
    'prTitle': {
      'type': 'string',
    }
  }
}

const executeChat = (taskDescription, repoContents) => `I have the following GitHub repository files, preceeded by their respective paths:\n---${repoContents}\n
Could you give me the updated/modified code for the repository given the following task: "${taskDescription}"?
Please make sure that if code in your answer references any other files in the repository, you refer with the correct paths that I gave above.
Please prefix each source code snippet of your answer to the format of this following example:
<|fileUpdate><|path>file path here, refer to repository contents above</|path><|contents>file contents here</|contents><|message>a commit message for your code snippet</|message></|fileUpdate>
Be sure to use "<|" for opening tags and "</|" for closing tags. Your response can contain multiple file updates of the above format.
The file doesn't have to exist in the repo if you intend to create it and the path shouldn't start with a slash.
Please make sure that if I write the parsed code to a file, all the identation and whitespace in the resulting file is valid with respect to the file type. Also, please add an empty line to the end of each file.`

const prTitle = (description) => `What would be the best GitHub pull request title for a PR that implements the following changes: ${description}
Please give your response in the following JSON format: {"prTitle": <your_response>}, where you replace <your_response> with the PR title suggestion.`

const preamble = 'You are an API service that consumes plain language input from the client and uses it to return a response that is formatted based on user preference.'

const retryExecutionPrompt = 'I wasn\'t able to parse that. Could you give your response so that it conforms to the following format: <filelist><|fileUpdate><|path>#file_path#</|path><|contents>#new_file_contents#</|contents><|message>#message_text#</|message></|fileUpdate><|fileUpdate>...</|fileUpdate></filelist>'

function printRepo(repoContents, resultString = '') {
  for (const item of repoContents) {
    if (item.type === 'file') {
      resultString = resultString.concat('\nFile path:\n')
      resultString = resultString.concat(item.path.concat('\n'));
      resultString = resultString.concat('File contents:\n');
      resultString = resultString.concat(atob(item.content).concat('\n---'));
    } else if (item.type === 'dir' && Array.isArray(item.content)) {
      resultString = printRepo(item.content, resultString);
    }
  }
  return resultString;
}

module.exports = {
  executeChat,
  preamble,
  executeResponseSchema,
  retryExecutionPrompt,
  printRepo,
  prTitle,
  prTitleSchema
};
