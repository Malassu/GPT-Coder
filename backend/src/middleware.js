const extractTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (authHeader && authHeader.startsWith('Bearer ')) {
    req.token = authHeader.split(' ')[1]
  } else {
    req.token = null;
  }
  next();
};

module.exports = {
  extractTokenMiddleware
};
