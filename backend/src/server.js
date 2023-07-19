const { GITHUB_API_BASE_URL, GITHUB_ACCESS_TOKEN, PORT } = require('./config');

const express = require('express');
const axios = require('axios');

const app = express();

app.get('/repositories', async (req, res) => {
  try {
    const response = await axios.get(`${GITHUB_API_BASE_URL}/user/repos`, {
      headers: {
        Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
