const extractTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (authHeader && authHeader.startsWith('Bearer ')) {
    req.token = authHeader.split(' ')[1]
  } else {
    req.token = null;
  }
  const apiAuthHeader = req.headers['authorization-openai']

  if (apiAuthHeader && apiAuthHeader.startsWith('Bearer ')) {
    req.apiToken = apiAuthHeader.split(' ')[1]
  } else {
    req.apiToken = null;
  }
  next();
};

module.exports = {
  extractTokenMiddleware
};
