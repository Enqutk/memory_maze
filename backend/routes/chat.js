const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { chatRateLimiter, recommendationsRateLimiter } = require('../middleware/rateLimitMiddleware');
const chatController = require('../controllers/chatController');

// Apply rate limiting to chat endpoints
router.post('/message', verifyToken, chatRateLimiter, chatController.sendMessage);
router.post('/recommendations', verifyToken, recommendationsRateLimiter, chatController.getRecommendations);

module.exports = router;
