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
    
    // Determine appropriate status code and response
    let statusCode = 500;
    let errorMessage = error.message || 'Failed to process chat message';
    let retryAfter = null;
    
    if (error.message?.includes('API key')) {
      statusCode = 503;
    } else if (error.message?.includes('rate limit') || error.message?.includes('busy')) {
      statusCode = 429;
      retryAfter = 60; // Suggest retry after 60 seconds
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      retryAfter,
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
    
    let statusCode = 500;
    let errorMessage = error.message || 'Failed to get recommendations';
    let retryAfter = null;
    
    if (error.message?.includes('API key')) {
      statusCode = 503;
    } else if (error.message?.includes('rate limit')) {
      statusCode = 429;
      retryAfter = 300; // Suggest retry after 5 minutes
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      retryAfter,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

module.exports = {
  sendMessage,
  getRecommendations
};
