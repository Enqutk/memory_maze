const { loadUsers, saveUsers } = require('../utils/fileUtils');

async function saveNote(email, storyId, chapterNumber, noteData) {
  const users = await loadUsers();
  const user = users[email];

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.notes) {
    user.notes = {};
  }

  const noteKey = `${storyId}-chapter-${chapterNumber}`;
  
  user.notes[noteKey] = {
    storyId,
    chapterNumber,
    ...noteData,
    updatedAt: new Date().toISOString(),
    createdAt: user.notes[noteKey]?.createdAt || new Date().toISOString()
  };

  await saveUsers(users);

  return user.notes[noteKey];
}

async function getNote(email, storyId, chapterNumber) {
  const users = await loadUsers();
  const user = users[email];

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.notes) {
    return null;
  }

  const noteKey = `${storyId}-chapter-${chapterNumber}`;
  return user.notes[noteKey] || null;
}

async function getAllNotesForStory(email, storyId) {
  const users = await loadUsers();
  const user = users[email];

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.notes) {
    return [];
  }

  return Object.values(user.notes).filter(note => note.storyId === storyId);
}

module.exports = {
  saveNote,
  getNote,
  getAllNotesForStory
};
