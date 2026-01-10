const notesService = require('../services/notesService');

async function saveNote(req, res) {
  try {
    const { email } = req.user;
    const { storyId, chapterNumber, ...noteData } = req.body;

    if (!storyId || !chapterNumber) {
      return res.status(400).json({ error: 'Story ID and chapter number are required' });
    }

    const note = await notesService.saveNote(email, storyId, chapterNumber, noteData);
    res.json({ success: true, note });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Save note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getNote(req, res) {
  try {
    const { email } = req.user;
    const { storyId, chapterNumber } = req.params;

    const note = await notesService.getNote(email, storyId, chapterNumber);
    
    if (!note) {
      return res.json({ note: null });
    }

    res.json({ note });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllNotesForStory(req, res) {
  try {
    const { email } = req.user;
    const { storyId } = req.params;

    const notes = await notesService.getAllNotesForStory(email, storyId);
    res.json({ notes });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllNotes(req, res) {
  try {
    const { email } = req.user;
    const notes = await notesService.getAllNotes(email);
    res.json({ notes });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Get all notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  saveNote,
  getNote,
  getAllNotesForStory,
  getAllNotes
};
