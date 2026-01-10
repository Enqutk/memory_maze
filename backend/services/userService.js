const { loadUsers, saveUsers } = require('../utils/fileUtils');

async function getUserProfile(email) {
  const users = await loadUsers();
  const user = users[email];

  if (!user) {
    throw new Error('User not found');
  }

  return {
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
  };
}

async function updateUserProfile(email, updates) {
  const { username, name, avatar, bio, theme } = updates;
  const users = await loadUsers();
  const user = users[email];

  if (!user) {
    throw new Error('User not found');
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

  if (username !== undefined) {
    if (username.length < 3 || username.length > 20) {
      throw new Error('Username must be between 3 and 20 characters');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    const usernameTaken = Object.values(users).some(
      u => u.email !== email && u.profile?.username?.toLowerCase() === username.toLowerCase()
    );

    if (usernameTaken) {
      throw new Error('Username is already taken');
    }

    user.profile.username = username;
  }

  if (name !== undefined) user.profile.name = name;
  if (avatar !== undefined) user.profile.avatar = avatar;
  if (bio !== undefined) user.profile.bio = bio;
  if (theme !== undefined) user.profile.theme = theme;

  await saveUsers(users);

  return user.profile;
}

async function updateUserSettings(email, settings) {
  const { notifications, dailyReminder, readingGoal } = settings;
  const users = await loadUsers();
  const user = users[email];

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.settings) {
    user.settings = { notifications: true, dailyReminder: false, readingGoal: 1 };
  }

  if (notifications !== undefined) user.settings.notifications = notifications;
  if (dailyReminder !== undefined) user.settings.dailyReminder = dailyReminder;
  if (readingGoal !== undefined) user.settings.readingGoal = readingGoal;

  await saveUsers(users);

  return user.settings;
}

async function updateStreak(email) {
  const users = await loadUsers();
  const user = users[email];

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.stats) {
    user.stats = {
      totalBooksRead: 0,
      totalChaptersRead: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
      totalReadingTime: 0
    };
  }

  const today = new Date().toDateString();
  const lastReadDate = user.stats.lastReadDate ? new Date(user.stats.lastReadDate).toDateString() : null;
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (lastReadDate === today) {
    return user.stats;
  }

  if (lastReadDate === yesterday) {
    user.stats.currentStreak += 1;
  } else if (lastReadDate === null || lastReadDate !== today) {
    user.stats.currentStreak = 1;
  }

  if (user.stats.currentStreak > user.stats.longestStreak) {
    user.stats.longestStreak = user.stats.currentStreak;
  }

  user.stats.lastReadDate = new Date().toISOString();
  user.stats.totalChaptersRead = (user.stats.totalChaptersRead || 0) + 1;

  await saveUsers(users);

  return user.stats;
}

async function addBadge(email, storyId, storyTitle) {
  const users = await loadUsers();
  const user = users[email];

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.badges) {
    user.badges = [];
  }

  const existingBadge = user.badges.find(b => b.storyId === storyId);
  if (existingBadge) {
    return { badge: existingBadge, isNew: false, stats: user.stats };
  }

  const badge = {
    id: `badge-${Date.now()}`,
    storyId,
    storyTitle,
    earnedAt: new Date().toISOString(),
    type: 'book_completed'
  };

  user.badges.push(badge);

  if (!user.stats) {
    user.stats = {
      totalBooksRead: 0,
      totalChaptersRead: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
      totalReadingTime: 0
    };
  }

  user.stats.totalBooksRead = (user.stats.totalBooksRead || 0) + 1;

  await saveUsers(users);

  return { badge, isNew: true, stats: user.stats };
}

async function saveBook(email, storyId) {
  const users = await loadUsers();
  const user = users[email];

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.savedBooks) {
    user.savedBooks = [];
  }

  if (user.savedBooks.includes(storyId)) {
    return { message: 'Book already saved', savedBooks: user.savedBooks };
  }

  user.savedBooks.push(storyId);
  await saveUsers(users);

  return { savedBooks: user.savedBooks };
}

async function unsaveBook(email, storyId) {
  const users = await loadUsers();
  const user = users[email];

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.savedBooks) {
    user.savedBooks = [];
  }

  user.savedBooks = user.savedBooks.filter(id => id !== storyId);
  await saveUsers(users);

  return { savedBooks: user.savedBooks };
}

async function getUserByEmail(email) {
  const users = await loadUsers();
  return users[email] || null;
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateUserSettings,
  updateStreak,
  addBadge,
  saveBook,
  unsaveBook,
  getUserByEmail
};
