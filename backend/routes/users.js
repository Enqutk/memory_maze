const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.put('/settings', verifyToken, userController.updateSettings);
router.post('/streak', verifyToken, userController.updateStreak);
router.post('/badge', verifyToken, userController.addBadge);
router.post('/saved-books', verifyToken, userController.saveBook);
router.delete('/saved-books/:storyId', verifyToken, userController.unsaveBook);

module.exports = router;
