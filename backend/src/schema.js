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

const executeChat = (taskDescription, repoContents) => `Hi, I'm an API service so could you give me your responses strictly formatted so I can parse them?
My purpose is make code changes to a GitHub repository based on a task description.
The task description is the folllowing: "${taskDescription}".
The repository file paths and contents, separated with "---", are as follows:\n---${repoContents}\n
These contents been retreived from GitHub repository content API.
The source code of all files has been decoded to text.
What files from the repository would you change and what new files would you add to the repository described above to fulfill the task description?

Please conform each modification in your response to the following format so that I can parse the reponse by catching the start/end markers using regex:
<modification><path>#file_path#</path><contents>#new_file_contents#</contents><message>#message_text#</message></modification>, where:
 - #file_path# is replaced with the path of the file you need to create/update. This element should be a string and shouldn't start with a slash. Please make sure this is the intended path from the repository.
 - #new_file_contents# is replaced with the source code of the file to be created/updated. This is a string representation of the file contents and I'll parse them from each modification using the following regex:  /\\<contents\\>([\\s\\S]+?)\\<\\/contents\\>/. Please make sure that if I write the parsed text to a file, all the identation and whitespace in the resulting file is valid with respect to the file type.
 - #message_text# is replaced with a commit message that would the best describe the code changes made for the modification. This field should be a string.
When you need to update a file:
- See the "File contents" of the respective file from the repository contents to analyze what needs to be updated.
- Make sure you set the #file_path# to the "path" field of the respective file object from the repository contents.
- Give the updated source code in the value #new_file_contents#
When you need to create a file:
- Don't create folders separately if they are included in the path of the file.
- Please make sure that the file doesn't already exist in the repository contents. If it does, update it according to the instructions above.
- Give the generated source code of the file in #new_file_contents# value`

const prTitle = (description) => `What would be the best GitHub pull request title for a PR that implements the following changes: ${description}
Please give your response in the following JSON format: {"prTitle": <your_response>}, where you replace <your_response> with the PR title suggestion.`

const preamble = 'You are an API service that consumes plain language input from the client and uses it to return a response that is formatted based on user preference.'

const retryExecutionPrompt = 'I wasn\'t able to parse that. Could you give your response so that it conforms to the following format: <filelist><modification><path>#file_path#</path><contents>#new_file_contents#</contents><message>#message_text#</message></modification><modification>...</modification></filelist>'

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
