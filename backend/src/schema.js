const initialChat = (taskDescription) => `Hi, I'm an API service so could you give me your responses in JSON format so I can parse them?
My purpose is make code changes to a branch and open a pull request to a GitHub repository based on requirements given by a user.
The task description given by the user is the folllowing: "${taskDescription}".
How would you split this into subtasks if needed? The descriptions of the subtasks will be used in creating the subsequent prompts.
Pushing the code changes, creating the branch and opening the pull request aren't part of the subtasks, code modifications only.
Please conform your response to the following JSON format: {"subtasks": [{"description": <task_description>}, ...]}`

const preamble = 'You are an API service that consumes plain language input from the user and uses it to return a JSON response.'

module.exports = {
  initialChat,
  preamble
};
