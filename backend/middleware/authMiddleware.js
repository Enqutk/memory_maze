const { verifyToken } = require('../services/authService');
const userService = require('../services/userService');

function verifyTokenMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

async function verifyAdminMiddleware(req, res, next) {
  try {
    const { email } = req.user;
    const user = await userService.getUserByEmail(email);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Verify admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  verifyToken: verifyTokenMiddleware,
  verifyAdmin: verifyAdminMiddleware
};
