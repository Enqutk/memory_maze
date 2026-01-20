const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

router.post('/message', verifyToken, chatController.sendMessage);
router.post('/recommendations', verifyToken, chatController.getRecommendations);

module.exports = router;
