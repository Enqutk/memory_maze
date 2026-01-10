const progressService = require('../services/progressService');

async function getProgress(req, res) {
  try {
    const { storyId } = req.params;
    const { email } = req.user;
    const progress = await progressService.getUserProgress(email, storyId);
    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateProgress(req, res) {
  try {
    const { storyId } = req.params;
    const { email } = req.user;
    const { chapterNumber, answers, score } = req.body;

    const result = await progressService.updateProgressAfterCheckpoint(
      email,
      storyId,
      chapterNumber,
      answers,
      score
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    if (error.message === 'Invalid request data') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function verifyAnswers(req, res) {
  try {
    const { storyId } = req.params;
    const { chapterNumber, answers } = req.body;

    const result = await progressService.verifyAnswers(storyId, chapterNumber, answers);
    res.json(result);
  } catch (error) {
    if (error.message === 'Story not found' || error.message === 'Chapter not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Verify answers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getProgress,
  updateProgress,
  verifyAnswers
};
