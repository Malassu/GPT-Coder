const { GITHUB_API_BASE_URL, PORT } = require('./config');
const { extractTokenMiddleware } = require('./middleware');

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

app.get('/repositories', extractTokenMiddleware, async (req, res) => {
  var token = req.token;
  if (!token) {
    res.status(403).json({ message: 'No token provided' });
    return
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
