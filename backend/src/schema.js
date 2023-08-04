const initialChat = (taskDescription) => `Hi, I'm an API service so could you give me your responses in JSON format so I can parse them?
My purpose is make code changes to a branch and open a pull request to a GitHub repository based on requirements given by a user.
The task description given by the user is the folllowing: "${taskDescription}".
How would you split this into subtasks if needed? The descriptions of the subtasks will be used in creating the subsequent prompts.
Please exclude version control tasks like creating a branch from the subtasks list.
Pushing the code changes, creating the branch and opening the pull request aren't part of the subtasks, code modifications only.
Please conform your response to the following JSON format: {"subtasks": [{"description": <task_description>}, ...]}`

const executeChat = (taskDescription, repoContents) => `Hi, I'm an API service so could you give me your responses in JSON format so I can parse them?
My purpose is make code changes to a branch and open a pull request to a GitHub repository based on requirements given by a user.
The task description given by the user is the folllowing: "${taskDescription}".
What code changes would you make to a repository with the following files to fulfill this description. This is a JSON representation of all repository files
and directories with base64 contents: ${repoContents}
Please give updated base64 encoded contents of the files you would modify, include a brief description of the changes, and conform your response to the following JSON format:
{"modifiedFiles": [{"path": <file_path>, "contents": <new_base64_file_contents>, "sha": <file_sha>/null, "message": <message_text>}, ...]},
where file_path is read from the given repository JSON when updating a file and given by you when creating a file. Make sure the file path doesn't end with a slash.
The value new_base64_file_contents is your changes encoded to base64, so please encode the file contents before responding and make sure they are valid base64. The value file_sha is the sha value of a file read from the given repository JSON when updating a file.
Set it to null in case you are creating a new file. Please make sure the sha matches the sha of an existing file if you are updating the contents of this existing file.`

const preamble = 'You are an API service that consumes plain language input from the user and uses it to return a JSON response.'

module.exports = {
  initialChat,
  executeChat,
  preamble
};
