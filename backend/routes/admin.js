const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

router.get('/users', verifyToken, verifyAdmin, adminController.getAllUsers);
router.put('/users/:email/role', verifyToken, verifyAdmin, adminController.updateUserRole);
router.delete('/users/:email', verifyToken, verifyAdmin, adminController.deleteUser);
router.get('/stats', verifyToken, verifyAdmin, adminController.getSystemStats);
router.get('/api-keys/stats', verifyToken, verifyAdmin, adminController.getApiKeyStats);
router.get('/stories', verifyToken, verifyAdmin, adminController.getAllStoriesAdmin);
router.post('/stories', verifyToken, verifyAdmin, adminController.createStory);
router.put('/stories/:storyId', verifyToken, verifyAdmin, adminController.updateStory);
router.delete('/stories/:storyId', verifyToken, verifyAdmin, adminController.deleteStory);
router.get('/progress', verifyToken, verifyAdmin, adminController.getAllProgress);

module.exports = router;
