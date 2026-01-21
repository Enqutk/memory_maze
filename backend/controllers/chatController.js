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
    const statusCode = error.message?.includes('API key') ? 503 : 500;
    res.status(statusCode).json({ 
      error: error.message || 'Failed to process chat message',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    const statusCode = error.message?.includes('API key') ? 503 : 500;
    res.status(statusCode).json({ 
      error: error.message || 'Failed to get recommendations',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

module.exports = {
  sendMessage,
  getRecommendations
};
