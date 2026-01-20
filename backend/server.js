require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const authRoutes = require('./routes/auth');
const storyRoutes = require('./routes/stories');
const progressRoutes = require('./routes/progress');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const notesRoutes = require('./routes/notes');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data directories
async function initializeDirectories() {
  const dirs = ['data', 'data/users', 'data/stories', 'data/progress'];
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Memory Maze API is running' });
});

// Initialize and start server
initializeDirectories().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Memory Maze Backend running on http://localhost:${PORT}`);
  });
});

module.exports = app;
