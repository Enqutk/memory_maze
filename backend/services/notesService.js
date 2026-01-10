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
  
  const existingNote = user.notes[noteKey];
  const createdAt = existingNote?.createdAt || new Date().toISOString();
  
  user.notes[noteKey] = {
    storyId,
    chapterNumber,
    storyTitle: noteData.storyTitle || existingNote?.storyTitle || '',
    chapterTitle: noteData.chapterTitle || existingNote?.chapterTitle || '',
    ...noteData,
    updatedAt: new Date().toISOString(),
    createdAt: createdAt
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

async function getAllNotes(email) {
  const users = await loadUsers();
  const user = users[email];

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.notes) {
    return [];
  }

  return Object.values(user.notes).sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
}

module.exports = {
  saveNote,
  getNote,
  getAllNotesForStory,
  getAllNotes
};
