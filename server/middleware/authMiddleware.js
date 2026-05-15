const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Grab the token from the request header
  const token = req.header('x-auth-token');

  // 2. If no token, block access
  if (!token) {
    return res.status(401).json({ error: 'ACCESS_DENIED: MISSING_CREDENTIALS' });
  }

  // 3. Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attaches the decoded user ID to the request
    next(); // Pass control to the next route
  } catch (err) {
    res.status(400).json({ error: 'ACCESS_DENIED: INVALID_TOKEN' });
  }
};