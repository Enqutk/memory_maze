const { verifyToken } = require('../services/authService');
const userService = require('../services/userService');

function verifyTokenMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    // Provide more specific error messages
    if (error.message?.includes('expired')) {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    if (error.message?.includes('malformed')) {
      return res.status(401).json({ error: 'Invalid token format.' });
    }
    
    res.status(401).json({ error: 'Invalid token. Please login again.' });
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
