const OpenAI = require('openai');
const { getAllStories } = require('../utils/fileUtils');
const userService = require('./userService');
const fs = require('fs').promises;
const path = require('path');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

// Get all available stories for context
async function getAllStoriesData() {
  try {
    const stories = await getAllStories();
    return stories.map(story => ({
      id: story.id,
      title: story.title,
      description: story.description,
      difficulty: story.difficulty,
      totalChapters: story.chapters?.length || 0
    }));
  } catch (error) {
    console.error('Error loading stories:', error);
    return [];
  }
}

// Get user's reading history for personalized recommendations
async function getUserReadingContext(email) {
  try {
    const user = await userService.getUserByEmail(email);
    const progressDir = path.join(__dirname, '../data/progress');
    const files = await fs.readdir(progressDir);
    const userProgress = [];
    
    for (const file of files) {
      if (file.startsWith(`${email}-`)) {
        const filePath = path.join(progressDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const progress = JSON.parse(content);
        userProgress.push({
          storyId: progress.storyId,
          currentChapter: progress.currentChapter,
          totalChapters: progress.totalChapters || 0,
          completed: progress.currentChapter > progress.totalChapters
        });
      }
    }
    
    return userProgress;
  } catch (error) {
    console.error('Error loading user progress:', error);
    return [];
  }
}

// Chat with AI about books
async function chatWithAI(email, message, conversationHistory = []) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const stories = await getAllStoriesData();
    const userProgress = await getUserReadingContext(email);
    
    // Build system prompt
    const systemPrompt = `You are a helpful and knowledgeable book recommendation assistant for "Memory Maze", a reading platform. Your role is to:
1. Recommend books based on user preferences and reading history
2. Discuss books, themes, characters, and plot points
3. Help users understand complex concepts in the books
4. Provide engaging and thoughtful conversations about literature

Available books in the library:
${stories.map(s => `- ${s.title} (${s.difficulty} difficulty, ${s.totalChapters} chapters): ${s.description}`).join('\n')}

User's reading progress:
${userProgress.length > 0 
  ? userProgress.map(p => {
      const story = stories.find(s => s.id === p.storyId);
      return `- ${story?.title || p.storyId}: ${p.completed ? 'Completed' : `Chapter ${p.currentChapter} of ${p.totalChapters}`}`;
    }).join('\n')
  : 'No reading history yet'}

Keep responses concise, engaging, and helpful. If recommending books, consider the user's reading history and preferences.`;

    // Build conversation messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      response: completion.choices[0].message.content,
      model: completion.model
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // More specific error messages
    if (error.message?.includes('API key') || !process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY to your backend/.env file.');
    }
    if (error.response?.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your OPENAI_API_KEY in backend/.env');
    }
    if (error.response?.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    }
    
    throw new Error(error.message || 'Failed to get AI response. Please check your API key configuration.');
  }
}

// Get book recommendations
async function getRecommendations(email, preferences = {}) {
  try {
    const stories = await getAllStoriesData();
    const userProgress = await getUserReadingContext(email);
    
    const completedBooks = userProgress
      .filter(p => p.completed)
      .map(p => {
        const story = stories.find(s => s.id === p.storyId);
        return story?.title || p.storyId;
      });
    
    const inProgressBooks = userProgress
      .filter(p => !p.completed)
      .map(p => {
        const story = stories.find(s => s.id === p.storyId);
        return story?.title || p.storyId;
      });

    const availableBooks = stories.map(s => s.title);
    
    const prompt = `Based on the user's reading history, recommend 3 books from the available library.

User's completed books: ${completedBooks.length > 0 ? completedBooks.join(', ') : 'None'}
User's books in progress: ${inProgressBooks.length > 0 ? inProgressBooks.join(', ') : 'None'}

Available books: ${availableBooks.join(', ')}

User preferences: ${preferences.genre || 'Not specified'}, ${preferences.difficulty || 'Any difficulty'}

Provide 3 personalized recommendations with brief explanations (1-2 sentences each) for why each book would be a good fit. Format as a JSON array with objects containing "title", "reason", and "difficulty" fields.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a book recommendation assistant. Always respond with valid JSON arrays.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    const responseText = completion.choices[0].message.content;
    
    // Try to parse JSON from response
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If JSON parsing fails, return formatted recommendations
    }

    // Fallback: return formatted text recommendations
    return [
      {
        title: stories[0]?.title || 'The Alchemist',
        reason: responseText.split('\n')[0] || 'A great book to start your journey',
        difficulty: stories[0]?.difficulty || 'medium'
      }
    ];
  } catch (error) {
    console.error('Recommendation error:', error);
    // Fallback recommendations
    const stories = await getAllStoriesData();
    return stories.slice(0, 3).map(s => ({
      title: s.title,
      reason: `A ${s.difficulty} difficulty book with ${s.totalChapters} chapters`,
      difficulty: s.difficulty
    }));
  }
}

module.exports = {
  chatWithAI,
  getRecommendations
};
