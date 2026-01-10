const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { loadUsers, saveUsers } = require('../utils/fileUtils');

const JWT_SECRET = process.env.JWT_SECRET || 'memory-maze-secret-key';

async function registerUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const users = await loadUsers();

  if (users[email]) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const isFirstUser = Object.keys(users).length === 0;

  const userData = {
    email,
    password: hashedPassword,
    role: isFirstUser ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
    profile: {
      username: email.split('@')[0],
      name: email.split('@')[0],
      avatar: null,
      bio: '',
      theme: 'light'
    },
    stats: {
      totalBooksRead: 0,
      totalChaptersRead: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
      totalReadingTime: 0
    },
    badges: [],
    savedBooks: [],
    settings: {
      notifications: true,
      dailyReminder: false,
      readingGoal: 1
    }
  };

  users[email] = userData;
  await saveUsers(users);

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });

  return {
    token,
    user: {
      email: userData.email,
      role: userData.role,
      profile: userData.profile,
      stats: userData.stats,
      badges: userData.badges,
      savedBooks: userData.savedBooks,
      settings: userData.settings
    }
  };
}

async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const users = await loadUsers();
  const user = users[email];

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  if (!user.profile) {
    user.profile = {
      username: email.split('@')[0],
      name: email.split('@')[0],
      avatar: null,
      bio: '',
      theme: 'light'
    };
  }

  if (!user.profile.username) {
    user.profile.username = user.profile.name || email.split('@')[0];
  }

  if (!user.role) {
    user.role = 'user';
    await saveUsers(users);
  }

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });

  return {
    token,
    user: {
      email: user.email,
      role: user.role || 'user',
      profile: user.profile || {
        username: email.split('@')[0],
        name: email.split('@')[0],
        avatar: null,
        bio: '',
        theme: 'light'
      },
      stats: user.stats || {
        totalBooksRead: 0,
        totalChaptersRead: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastReadDate: null,
        totalReadingTime: 0
      },
      badges: user.badges || [],
      savedBooks: user.savedBooks || [],
      settings: user.settings || {
        notifications: true,
        dailyReminder: false,
        readingGoal: 1
      }
    }
  };
}

function generateToken(email) {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

module.exports = {
  registerUser,
  loginUser,
  generateToken,
  verifyToken,
  JWT_SECRET
};
