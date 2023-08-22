const { GITHUB_API_BASE_URL, PORT, GITHUB_ACCESS_TOKEN, OPENAI_API_KEY } = require('./config');
const { extractTokenMiddleware } = require('./middleware');
const { createPullRequest } = require('./service')

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

app.get('/repositories', extractTokenMiddleware, async (req, res) => {
  var token = req.token;
  if (!token) {
    console.warn('No GH access token in request, defaulting to env');
    token = GITHUB_ACCESS_TOKEN;
  }
  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/user/repos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/ticket', extractTokenMiddleware, async (req, res) => {
  var token = req.token;
  if (!token) {
    console.warn('No GH access token in request, defaulting to env');
    token = GITHUB_ACCESS_TOKEN;
  }
  var apiToken = req.apiToken;
  if (!apiToken) {
    console.warn('No OpenAI access token in request, defaulting to env');
    apiToken = OPENAI_API_KEY;
  }
  try {
    const { description, repository, cli } = req.body;
    const useCli = cli === 'true';
    const response = await createPullRequest(description, repository, token, apiToken, useCli);
    console.log('Created code to git:', response);
    res.json(response);
  } catch (error) {
    console.error('Error generating completion:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
