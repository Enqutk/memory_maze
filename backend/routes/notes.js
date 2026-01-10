const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const notesController = require('../controllers/notesController');

router.post('/', verifyToken, notesController.saveNote);
router.get('/all', verifyToken, notesController.getAllNotes);
router.get('/:storyId/:chapterNumber', verifyToken, notesController.getNote);
router.get('/:storyId', verifyToken, notesController.getAllNotesForStory);

module.exports = router;
