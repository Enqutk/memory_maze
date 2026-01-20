const chatService = require('../services/chatService');

async function sendMessage(req, res) {
  try {
    const { message, conversationHistory = [] } = req.body;
    const { email } = req.user;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await chatService.chatWithAI(email, message, conversationHistory);
    
    res.json({
      success: true,
      response: result.response,
      model: result.model
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process chat message' 
    });
  }
}

async function getRecommendations(req, res) {
  try {
    const { email } = req.user;
    const preferences = req.body.preferences || {};

    const recommendations = await chatService.getRecommendations(email, preferences);
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get recommendations' 
    });
  }
}

module.exports = {
  sendMessage,
  getRecommendations
};
