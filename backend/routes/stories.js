const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const storyController = require('../controllers/storyController');

router.get('/', storyController.getAllStories);
router.get('/:storyId', verifyToken, storyController.getStory);
router.get('/:storyId/chapters/:chapterNumber', verifyToken, storyController.getChapter);

module.exports = router;
