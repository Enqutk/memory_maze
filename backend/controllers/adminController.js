const adminService = require('../services/adminService');
const storyService = require('../services/storyService');

async function getAllUsers(req, res) {
  try {
    const users = await adminService.getAllUsersData();
    res.json({ users, total: users.length });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateUserRole(req, res) {
  try {
    const { email } = req.params;
    const { role } = req.body;
    const result = await adminService.updateUserRole(email, role);
    res.json({ success: true, ...result });
  } catch (error) {
    if (error.message === 'Invalid role. Must be "admin" or "user"' ||
        error.message === 'User not found' ||
        error.message === 'Cannot remove the last admin') {
      return res.status(error.message.includes('Cannot') ? 400 : 
                       error.message === 'User not found' ? 404 : 400)
                 .json({ error: error.message });
    }
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteUser(req, res) {
  try {
    const { email } = req.params;
    await adminService.deleteUser(email);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    if (error.message === 'User not found' ||
        error.message === 'Cannot delete the last admin') {
      return res.status(error.message === 'User not found' ? 404 : 400)
                 .json({ error: error.message });
    }
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getSystemStats(req, res) {
  try {
    const stats = await adminService.getSystemStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllStoriesAdmin(req, res) {
  try {
    const stories = await storyService.getAllStoriesMetadata();
    res.json({ stories, total: stories.length });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createStory(req, res) {
  try {
    const story = await storyService.createStory(req.body);
    res.status(201).json({ success: true, story });
  } catch (error) {
    if (error.message.includes('Missing required fields') ||
        error.message.includes('Story ID') ||
        error.message.includes('already exists') ||
        error.message.includes('Chapter') ||
        error.message.includes('question')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Create story error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateStory(req, res) {
  try {
    const { storyId } = req.params;
    const story = await storyService.updateStory(storyId, req.body);
    res.json({ success: true, story });
  } catch (error) {
    if (error.message === 'Story not found' ||
        error.message.includes('Chapters') ||
        error.message.includes('Chapter')) {
      return res.status(error.message === 'Story not found' ? 404 : 400)
                 .json({ error: error.message });
    }
    console.error('Update story error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteStory(req, res) {
  try {
    const { storyId } = req.params;
    await storyService.removeStory(storyId);
    await adminService.deleteStoryProgress(storyId);
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    if (error.message === 'Story not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Delete story error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllProgress(req, res) {
  try {
    const progress = await adminService.getAllProgressData();
    res.json({ progress, total: progress.length });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSystemStats,
  getAllStoriesAdmin,
  createStory,
  updateStory,
  deleteStory,
  getAllProgress
};
