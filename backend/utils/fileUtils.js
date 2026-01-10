const fs = require('fs').promises;
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users/users.json');
const STORIES_DIR = path.join(__dirname, '../data/stories');
const PROGRESS_DIR = path.join(__dirname, '../data/progress');

async function loadUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function loadStory(storyId) {
  const filePath = path.join(STORIES_DIR, `${storyId}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function saveStory(storyId, storyData) {
  const filePath = path.join(STORIES_DIR, `${storyId}.json`);
  await fs.writeFile(filePath, JSON.stringify(storyData, null, 2));
}

async function deleteStory(storyId) {
  const filePath = path.join(STORIES_DIR, `${storyId}.json`);
  await fs.unlink(filePath);
}

async function storyExists(storyId) {
  const filePath = path.join(STORIES_DIR, `${storyId}.json`);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getAllStories() {
  try {
    const files = await fs.readdir(STORIES_DIR);
    const stories = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(STORIES_DIR, file);
        const data = await fs.readFile(filePath, 'utf8');
        stories.push(JSON.parse(data));
      }
    }
    return stories;
  } catch (error) {
    return [];
  }
}

async function loadProgress(email, storyId) {
  const progressFile = path.join(PROGRESS_DIR, `${email}-${storyId}.json`);
  try {
    const data = await fs.readFile(progressFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function saveProgress(email, storyId, progressData) {
  const progressFile = path.join(PROGRESS_DIR, `${email}-${storyId}.json`);
  await fs.writeFile(progressFile, JSON.stringify(progressData, null, 2));
}

async function getAllProgressFiles() {
  try {
    const files = await fs.readdir(PROGRESS_DIR);
    return files.filter(f => f.endsWith('.json'));
  } catch {
    return [];
  }
}

async function deleteProgressFiles(pattern) {
  try {
    const files = await fs.readdir(PROGRESS_DIR);
    const matchingFiles = files.filter(file => {
      if (typeof pattern === 'function') {
        return pattern(file);
      }
      return file.includes(pattern);
    });
    for (const file of matchingFiles) {
      await fs.unlink(path.join(PROGRESS_DIR, file));
    }
  } catch {
    // Progress files might not exist
  }
}

module.exports = {
  loadUsers,
  saveUsers,
  loadStory,
  saveStory,
  deleteStory,
  storyExists,
  getAllStories,
  loadProgress,
  saveProgress,
  getAllProgressFiles,
  deleteProgressFiles,
  USERS_FILE,
  STORIES_DIR,
  PROGRESS_DIR
};
