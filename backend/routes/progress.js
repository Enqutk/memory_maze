const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const progressController = require('../controllers/progressController');

router.get('/:storyId', verifyToken, progressController.getProgress);
router.post('/:storyId/checkpoint', verifyToken, progressController.updateProgress);
router.post('/:storyId/verify', verifyToken, progressController.verifyAnswers);

module.exports = router;
