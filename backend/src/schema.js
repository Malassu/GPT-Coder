const taskResponseSchema = {
  'type': 'object',
  'properties': {
    'subtasks': {
      'type': 'array',
      'items': {
        'type': 'object',
        'properties': {
          'description': {'type': 'string'}
        }
      }
    }
  }
}

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

const initialChat = (taskDescription) => `Hi, I'm an API service so could you give me your responses in JSON format so I can parse them?
My purpose is make code changes to a branch and open a pull request to a GitHub repository based on requirements given by a user.
The task description given by the user is the folllowing: "${taskDescription}".
How would you split this into subtasks if needed? The descriptions of the subtasks will be used in creating the subsequent prompts.
Please exclude version control tasks like creating a branch from the subtasks list. Please also exclude any developer setup tasks that don't reflect any changes to the code base.
The tasks should only include creating or updating files, not creating directory structures.
Pushing the code changes, creating the branch and opening the pull request aren't part of the subtasks, code modifications only.
Please conform your response to the following JSON format: {"subtasks": [{"description": <task_description>}, ...]}`

const executeChat = (taskDescription, repoContents) => `Hi, I'm an API service so could you give me your responses in JSON format so I can parse them?
My purpose is make code changes to a GitHub repository based on a task description.
The task description is the folllowing: "${taskDescription}".
The repository file paths and contents, separated with "---", are as follows:\n---${repoContents}\n
These contents been retreived from GitHub repository content API.
The source code of all files has been decoded to text.
What files from the repository would you change and what new files would you add to the repository described above to fulfill the task description?

Please conform your response to the following XML format without any XML attributes:
<filelist><modification><path>#file_path#</path><contents>#new_file_contents#</contents><message>#message_text#</message></modification><modification>...</modification></filelist>, where:
 - #file_path# is replaced with the path of the file you need to create/update. This element should be a string and shouldn't start with a slash. Please make sure this is the intended path from the repository.
 - #new_file_contents# is replaced with the source code of the file to be created/updated. Do NOT base64 encode this element but leave it as text.
 - #message_text# is replaced with a commit message that would the best describe the code changes made in this task. This field should be a string.
When you need to update a file:
- See the "File contents" of the respective file from the repository contents to analyze what needs to be updated.
- Make sure you set the #file_path# to the "path" field of the respective file object from the repository contents.
- Give the updated source code in the value #new_file_contents#
When you need to create a file:
- Don't create folders separately if they are included in the path of the file.
- Please make sure that the file doesn't already exist in the repository contents. If it does, update it according to the instructions above.
- Give the generated source code of the file in #new_file_contents# value`

const preamble = 'You are an API service that consumes plain language input from the user and uses it to return a JSON or an XML response based on user preference.'

const retryTasksPrompt = 'I wasn\'t able to parse that. Could you give your response so that it conforms to the following JSON format: {"subtasks": [{"description": <task_description>}, ...]}'

const retryExecutionPrompt = 'I wasn\'t able to parse that. Could you give your response so that it conforms to the following XML format: <filelist><modification><path>#file_path#</path><contents>#new_file_contents#</contents><message>#message_text#</message></modification><modification>...</modification></filelist>'

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
  initialChat,
  executeChat,
  preamble,
  taskResponseSchema,
  executeResponseSchema,
  retryTasksPrompt,
  retryExecutionPrompt,
  printRepo
};
