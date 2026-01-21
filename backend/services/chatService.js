const { Groq } = require('groq-sdk');
const { getAllStories } = require('../utils/fileUtils');
const userService = require('./userService');
const fs = require('fs').promises;
const path = require('path');
const NodeCache = require('node-cache');
const { getKeyRotation } = require('../utils/keyRotation');

// Initialize cache with 5 minute TTL for similar queries
const responseCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Initialize key rotation
let keyRotation = null;
try {
  keyRotation = getKeyRotation();
  if (keyRotation) {
    console.log('🔄 API Key rotation enabled');
  }
} catch (error) {
  console.log('ℹ️ Using single API key (no rotation)');
}

// Initialize Groq client (Free AI alternative - no credit card needed!)
// This will be recreated with each request if using key rotation
let groq = null;

function getGroqClient() {
  const apiKey = keyRotation 
    ? keyRotation.getLeastUsedKey() 
    : (process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || '');
  
  return new Groq({ apiKey });
}

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
async function chatWithAI(email, message, conversationHistory = [], retryCount = 0) {
  const currentApiKey = keyRotation 
    ? keyRotation.getLeastUsedKey() 
    : (process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY);
  
  try {
    if (!currentApiKey) {
      throw new Error('AI API key not configured. Please add GROQ_API_KEY or GROQ_API_KEYS to your backend/.env file.');
    }

    // Check cache for similar queries (only for simple questions without conversation history)
    if (conversationHistory.length === 0) {
      const cacheKey = `chat:${email}:${message.toLowerCase().trim()}`;
      const cachedResponse = responseCache.get(cacheKey);
      if (cachedResponse) {
        console.log('Returning cached response for:', message.substring(0, 50));
        return cachedResponse;
      }
    }

    const stories = await getAllStoriesData();
    const userProgress = await getUserReadingContext(email);
    const creatorName = process.env.CREATOR_NAME || 'Enku Tadesse';
    const creatorPortfolioUrl = process.env.CREATOR_PORTFOLIO_URL || 'https://enkuv2.vercel.app/';
    
    // Build system prompt
    const systemPrompt = `You are KimemAI, a friendly and knowledgeable bookstore assistant for "Memory Maze", a reading platform. Think of yourself as working in a cozy bookstore where readers come to find their next great read.

YOUR PERSONALITY & BEHAVIOR:
- Act like a cool, friendly bookstore assistant with a Gen Z vibe - you genuinely love books and get excited about helping readers
- Give SHORT, concise answers - be brief and to the point, but keep it engaging
- Only explain in detail when the user specifically asks for more information or when clarification is necessary
- Be warm, friendly, energetic, and relatable - use Gen Z language naturally (like "no cap", "fr fr", "this hits different", "based", "slaps", etc.) but don't overdo it
- Be ready to help with ANYTHING about the books on our platform: recommendations, summaries, difficulty levels, themes, chapter counts, reading tips, etc.
- Use casual, conversational Gen Z language - like you're texting a friend who's looking for book recommendations
- Keep responses brief unless asked to elaborate, but make them engaging and fun
- Show enthusiasm for books and reading, but keep it real and authentic
- Use emojis sparingly (like occasionally 🚀 📚 ✨) but don't overuse them

IMPORTANT IDENTITY INFORMATION:
- Your name is KimemAI. Always refer to yourself as "she" and "her". When users ask "what is your name" or "who are you", always respond that you are KimemAI.
- You were created by ${creatorName} (also spelled Enku Taddesse), a talented Full Stack Developer who built the Memory Maze platform. Refer to ${creatorName} as "she" and "her". When users ask "who created you", "who made you", "who built you", or similar creator questions, always mention that you were created by ${creatorName}. Speak positively about her - you can mention that she is a Full Stack Developer, Core Team Lead at DDU ICT Club ABOL Solution, and the creator of this wonderful reading platform. She has experience building useful tools, mentoring student developers, and creating practical solutions.
- When talking about ${creatorName}, always recommend checking out her portfolio at ${creatorPortfolioUrl} to see more of her work and projects. You can mention that her portfolio showcases her skills in web development, product design, and mentorship. If users ask about her portfolio, projects, work, or how to contact her, enthusiastically recommend visiting ${creatorPortfolioUrl}.

Available books in the library:
${stories.map(s => `- ${s.title} (${s.difficulty} difficulty, ${s.totalChapters} chapters): ${s.description}`).join('\n')}

User's reading progress:
${userProgress.length > 0 
  ? userProgress.map(p => {
      const story = stories.find(s => s.id === p.storyId);
      return `- ${story?.title || p.storyId}: ${p.completed ? 'Completed' : `Chapter ${p.currentChapter} of ${p.totalChapters}`}`;
    }).join('\n')
  : 'No reading history yet'}

Remember: Keep responses SHORT and conversational with that Gen Z energy. Act like a cool bookstore assistant - be helpful, friendly, engaging, and brief. Only elaborate when asked or when clarification is needed. Be ready to help with anything about our books! Keep it real and fun!`;

    // Build conversation messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Get Groq client (with rotated key if available)
    const groqClient = getGroqClient();
    
    // Call Groq API (Free alternative - uses Llama models)
    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Smaller, faster model - uses fewer tokens
      messages: messages,
      temperature: 0.7,
      max_tokens: 300 // Reduced to save tokens
    });

    const result = {
      response: completion.choices[0].message.content,
      model: completion.model
    };

    // Cache the response for simple queries
    if (conversationHistory.length === 0) {
      const cacheKey = `chat:${email}:${message.toLowerCase().trim()}`;
      responseCache.set(cacheKey, result);
    }

    return result;
  } catch (error) {
    console.error('AI API error:', error);
    
    // Mark key as errored if using rotation
    if (keyRotation) {
      keyRotation.markKeyError(currentApiKey, error);
    }
    
    // More specific error messages
    if (error.message?.includes('API key') || !currentApiKey) {
      throw new Error('AI API key is not configured. Please add GROQ_API_KEY or GROQ_API_KEYS to your backend/.env file.');
    }
    if (error.response?.status === 401) {
      throw new Error('Invalid AI API key. Please check your GROQ_API_KEY or GROQ_API_KEYS in backend/.env');
    }
    if (error.response?.status === 429) {
      // If using key rotation, try another key
      if (keyRotation && keyRotation.apiKeys.length > 1 && retryCount === 0) {
        console.log('🔄 Rate limited, trying next API key...');
        return chatWithAI(email, message, conversationHistory, retryCount + 1);
      }
      
      // Implement exponential backoff retry for single key or exhausted rotation
      const maxRetries = 2;
      if (retryCount < maxRetries) {
        const waitTime = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited. Retrying in ${waitTime}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return chatWithAI(email, message, conversationHistory, retryCount + 1);
      }
      
      const keyInfo = keyRotation 
        ? `All ${keyRotation.apiKeys.length} API keys are rate limited.` 
        : 'API key rate limited.';
      throw new Error(`AI service is currently busy. ${keyInfo} Please wait a few minutes and try again.`);
    }
    
    throw new Error(error.message || 'Failed to get AI response. Please check your API key configuration.');
  }
}

// Get book recommendations
async function getRecommendations(email, preferences = {}, retryCount = 0) {
  try {
    // Check cache for recommendations
    const cacheKey = `recommendations:${email}:${JSON.stringify(preferences)}`;
    const cachedRecommendations = responseCache.get(cacheKey);
    if (cachedRecommendations) {
      console.log('Returning cached recommendations for:', email);
      return cachedRecommendations;
    }

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

    const currentApiKey = keyRotation 
      ? keyRotation.getLeastUsedKey() 
      : (process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY);
    
    if (!currentApiKey) {
      // Return fallback recommendations
      const stories = await getAllStoriesData();
      return stories.slice(0, 3).map(s => ({
        title: s.title,
        reason: `A ${s.difficulty} difficulty book with ${s.totalChapters} chapters`,
        difficulty: s.difficulty
      }));
    }

    const groqClient = getGroqClient();
    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Smaller model for recommendations
      messages: [
        { role: 'system', content: 'You are a book recommendation assistant. Always respond with valid JSON arrays.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 250 // Reduced to save tokens
    });

    const responseText = completion.choices[0].message.content;
    
    let recommendations = [];
    // Try to parse JSON from response
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If JSON parsing fails, return formatted recommendations
      recommendations = [
        {
          title: stories[0]?.title || 'The Alchemist',
          reason: responseText.split('\n')[0] || 'A great book to start your journey',
          difficulty: stories[0]?.difficulty || 'medium'
        }
      ];
    }

    // Cache the recommendations
    responseCache.set(cacheKey, recommendations);
    
    return recommendations;
  } catch (error) {
    console.error('Recommendation error:', error);
    
    // Handle rate limiting with retry
    if (error.response?.status === 429) {
      const maxRetries = 2;
      if (retryCount < maxRetries) {
        const waitTime = Math.pow(2, retryCount) * 1000;
        console.log(`Rate limited. Retrying recommendations in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return getRecommendations(email, preferences, retryCount + 1);
      }
    }
    
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
