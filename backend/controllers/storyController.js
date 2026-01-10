const storyService = require('../services/storyService');

async function getAllStories(req, res) {
  try {
    const stories = await storyService.getAllStoriesMetadata();
    res.json(stories);
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getStory(req, res) {
  try {
    const { storyId } = req.params;
    const story = await storyService.getStoryById(storyId);
    res.json(story);
  } catch (error) {
    if (error.message === 'Story not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Get story error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getChapter(req, res) {
  try {
    const { storyId, chapterNumber } = req.params;
    const chapter = await storyService.getChapter(storyId, chapterNumber);
    res.json(chapter);
  } catch (error) {
    if (error.message === 'Story not found' || error.message === 'Chapter not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Get chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllStories,
  getStory,
  getChapter
};
