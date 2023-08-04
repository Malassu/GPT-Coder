const initialChat = (taskDescription) => `Hi, I'm an API service so could you give me your responses in JSON format so I can parse them?
My purpose is make code changes to a branch and open a pull request to a GitHub repository based on requirements given by a user.
The task description given by the user is the folllowing: "${taskDescription}".
How would you split this into subtasks if needed? The descriptions of the subtasks will be used in creating the subsequent prompts.
Please exclude version control tasks like creating a branch from the subtasks list. Please also exclude any developer setup tasks that don't reflect any changes to the code base.
Pushing the code changes, creating the branch and opening the pull request aren't part of the subtasks, code modifications only.
Please conform your response to the following JSON format: {"subtasks": [{"description": <task_description>}, ...]}`

const executeChat = (taskDescription, repoContents) => `Hi, I'm an API service so could you give me your responses in JSON format so I can parse them?
My purpose is make code changes to a GitHub repository based on a task description.
The task description is the folllowing: "${taskDescription}".
The JSON representation of the repository contents are as follows: ${repoContents}
The source code in the files is base64 encoded to the "content" field of each object that has the type "file".
The directory contents are a list of these same file objects.
What files would you change and what new files would you add to the repository described above to fulfill the task description?

Please conform your response to the following JSON format:
{"modifiedFiles": [{"path": <file_path>, "contents": <new_file_contents>, "message": <message_text>}, ...]}, where:
 - <file_path> is replaced with the path of the file you need to create/update.
 - <new_file_contents> is replaced with the source code of the file to be created/updated. Do NOT base64 encode this field.
 - <message_text> is replaced with a commit message that would the best describe the code changes made in this task.
When you need to update a file:
- Base64 decode the "content" of the respective file from the repository contents to analyze what needs to be updated.
- Make sure you set the <file_path> to the "path" field of the respective file object from the repository contents JSON.
- Give the updated source code in the value <new_file_contents>
When you need to create a file:
- Don't create folders separately if they are included in the path of the file.
- Please make sure that the file doesn't already exist in the repository contents. If it does, update it according to the instructions above.
- Give the generated source code of the file in <new_file_contents> value`

const preamble = 'You are an API service that consumes plain language input from the user and uses it to return a JSON response.'

module.exports = {
  initialChat,
  executeChat,
  preamble
};
