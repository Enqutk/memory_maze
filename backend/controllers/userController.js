const userService = require('../services/userService');

async function getProfile(req, res) {
  try {
    const { email } = req.user;
    const profile = await userService.getUserProfile(email);
    res.json(profile);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateProfile(req, res) {
  try {
    const { email } = req.user;
    const profile = await userService.updateUserProfile(email, req.body);
    res.json({ success: true, profile });
  } catch (error) {
    if (error.message === 'User not found' ||
        error.message.includes('Username')) {
      return res.status(error.message === 'User not found' ? 404 : 400).json({ error: error.message });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateSettings(req, res) {
  try {
    const { email } = req.user;
    const settings = await userService.updateUserSettings(email, req.body);
    res.json({ success: true, settings });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateStreak(req, res) {
  try {
    const { email } = req.user;
    const stats = await userService.updateStreak(email);
    res.json({ success: true, stats });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Update streak error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function addBadge(req, res) {
  try {
    const { email } = req.user;
    const { storyId, storyTitle } = req.body;
    const result = await userService.addBadge(email, storyId, storyTitle);
    res.json({ success: true, ...result });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Add badge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function saveBook(req, res) {
  try {
    const { email } = req.user;
    const { storyId } = req.body;
    const result = await userService.saveBook(email, storyId);
    res.json({ success: true, ...result });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Save book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function unsaveBook(req, res) {
  try {
    const { email } = req.user;
    const { storyId } = req.params;
    const result = await userService.unsaveBook(email, storyId);
    res.json({ success: true, ...result });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Remove saved book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  updateSettings,
  updateStreak,
  addBadge,
  saveBook,
  unsaveBook
};
