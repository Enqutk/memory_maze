const { loadUsers, saveUsers, getAllStories, getAllProgressFiles, deleteProgressFiles, PROGRESS_DIR } = require('../utils/fileUtils');
const fs = require('fs').promises;
const path = require('path');

async function getAllUsersData() {
  const users = await loadUsers();
  return Object.values(users).map(user => ({
    email: user.email,
    role: user.role || 'user',
    createdAt: user.createdAt,
    profile: user.profile || {},
    stats: user.stats || {
      totalBooksRead: 0,
      totalChaptersRead: 0,
      currentStreak: 0,
      longestStreak: 0
    },
    badges: user.badges || [],
    savedBooks: user.savedBooks || []
  }));
}

async function updateUserRole(email, newRole) {
  if (!newRole || !['admin', 'user'].includes(newRole)) {
    throw new Error('Invalid role. Must be "admin" or "user"');
  }

  const users = await loadUsers();
  if (!users[email]) {
    throw new Error('User not found');
  }

  if (newRole === 'user' && users[email].role === 'admin') {
    const adminCount = Object.values(users).filter(u => u.role === 'admin').length;
    if (adminCount === 1) {
      throw new Error('Cannot remove the last admin');
    }
  }

  users[email].role = newRole;
  await saveUsers(users);

  return { email, role: newRole };
}

async function deleteUser(email) {
  const users = await loadUsers();

  if (!users[email]) {
    throw new Error('User not found');
  }

  if (users[email].role === 'admin') {
    const adminCount = Object.values(users).filter(u => u.role === 'admin').length;
    if (adminCount === 1) {
      throw new Error('Cannot delete the last admin');
    }
  }

  delete users[email];
  await saveUsers(users);

  await deleteProgressFiles((file) => file.startsWith(`${email}-`));
}

async function getSystemStatistics() {
  const users = await loadUsers();
  const userList = Object.values(users);

  let storyFiles = [];
  try {
    const storyService = require('./storyService');
    const stories = await storyService.getAllStoriesMetadata();
    storyFiles = stories.map(s => `${s.id}.json`);
  } catch (error) {
    // Stories might not exist
  }

  let progressFiles = [];
  try {
    progressFiles = await getAllProgressFiles();
  } catch (error) {
    // Progress directory might not exist
  }

  const totalUsers = userList.length;
  const totalAdmins = userList.filter(u => u.role === 'admin').length;
  const totalStories = storyFiles.length;
  const totalProgress = progressFiles.length;

  const activeUsers = userList.filter(u => {
    const lastRead = u.stats?.lastReadDate;
    if (!lastRead) return false;
    const daysSinceLastRead = (Date.now() - new Date(lastRead).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastRead <= 30;
  }).length;

  const totalBooksRead = userList.reduce((sum, u) => sum + (u.stats?.totalBooksRead || 0), 0);
  const totalChaptersRead = userList.reduce((sum, u) => sum + (u.stats?.totalChaptersRead || 0), 0);
  const totalBadges = userList.reduce((sum, u) => sum + (u.badges?.length || 0), 0);

  const avgBooksPerUser = totalUsers > 0 ? (totalBooksRead / totalUsers).toFixed(2) : 0;
  const avgChaptersPerUser = totalUsers > 0 ? (totalChaptersRead / totalUsers).toFixed(2) : 0;

  const usersWithStreaks = userList.filter(u => u.stats?.currentStreak > 0);
  const longestStreak = Math.max(...userList.map(u => u.stats?.longestStreak || 0), 0);
  const avgCurrentStreak = usersWithStreaks.length > 0
    ? (usersWithStreaks.reduce((sum, u) => sum + (u.stats?.currentStreak || 0), 0) / usersWithStreaks.length).toFixed(2)
    : 0;

  return {
    overview: {
      totalUsers,
      totalAdmins,
      totalStories,
      totalProgress,
      activeUsers
    },
    reading: {
      totalBooksRead,
      totalChaptersRead,
      totalBadges,
      avgBooksPerUser: parseFloat(avgBooksPerUser),
      avgChaptersPerUser: parseFloat(avgChaptersPerUser)
    },
    streaks: {
      longestStreak,
      usersWithActiveStreaks: usersWithStreaks.length,
      avgCurrentStreak: parseFloat(avgCurrentStreak)
    }
  };
}

async function getAllProgressData() {
  const progressFiles = await getAllProgressFiles();
  const progressList = [];

  for (const file of progressFiles) {
    try {
      const filePath = path.join(PROGRESS_DIR, file);
      const data = await fs.readFile(filePath, 'utf8');
      const progress = JSON.parse(data);
      
      const match = file.match(/^(.+?)-(.+?)\.json$/);
      if (match) {
        progressList.push({
          email: match[1],
          storyId: match[2],
          ...progress
        });
      }
    } catch (error) {
      console.error(`Error reading progress file ${file}:`, error);
    }
  }

  return progressList;
}

async function deleteStoryProgress(storyId) {
  await deleteProgressFiles((file) => file.includes(`-${storyId}.json`));
}

module.exports = {
  getAllUsersData,
  updateUserRole,
  deleteUser,
  getSystemStatistics,
  getAllProgressData,
  deleteStoryProgress
};
