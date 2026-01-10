const authService = require('../services/authService');

async function register(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.registerUser(email, password);
    res.status(201).json({
      message: 'User registered successfully',
      ...result
    });
  } catch (error) {
    if (error.message === 'Email and password are required' || 
        error.message === 'Password must be at least 6 characters' ||
        error.message === 'User already exists') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    if (error.message === 'Email and password are required' ||
        error.message === 'Invalid credentials') {
      return res.status(error.message === 'Invalid credentials' ? 401 : 400).json({ error: error.message });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  register,
  login
};
