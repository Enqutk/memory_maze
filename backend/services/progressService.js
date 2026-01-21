const { loadProgress, saveProgress, loadStory } = require('../utils/fileUtils');
const userService = require('./userService');
const { Groq } = require('groq-sdk');

// Initialize Groq for AI-powered answer checking
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || ''
});

async function getUserProgress(email, storyId) {
  const progress = await loadProgress(email, storyId);
  
  if (!progress) {
    return {
      email,
      storyId,
      currentChapter: 1,
      unlockedChapters: [1],
      attempts: {},
      scores: {},
      lastAccess: new Date().toISOString()
    };
  }

  return progress;
}

async function updateProgressAfterCheckpoint(email, storyId, chapterNumber, answers, score) {
  if (typeof chapterNumber !== 'number' || !Array.isArray(answers) || typeof score !== 'number') {
    throw new Error('Invalid request data');
  }

  let progress = await loadProgress(email, storyId);

  if (!progress) {
    progress = {
      email,
      storyId,
      currentChapter: 1,
      unlockedChapters: [1],
      attempts: {},
      scores: {},
      lastAccess: new Date().toISOString()
    };
  }

  const chapterKey = `chapter${chapterNumber}`;
  
  if (!progress.attempts[chapterKey]) {
    progress.attempts[chapterKey] = 0;
  }
  progress.attempts[chapterKey]++;

  progress.scores[chapterKey] = score;

  const PASSING_SCORE = 70;
  if (score >= PASSING_SCORE) {
    const nextChapter = chapterNumber + 1;
    if (!progress.unlockedChapters.includes(nextChapter)) {
      progress.unlockedChapters.push(nextChapter);
    }
    progress.currentChapter = Math.max(progress.currentChapter, nextChapter);
  }

  progress.lastAccess = new Date().toISOString();

  await saveProgress(email, storyId, progress);

  try {
    const user = await userService.getUserByEmail(email);
    if (user) {
      if (!user.stats) {
        user.stats = {
          totalBooksRead: 0,
          totalChaptersRead: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastReadDate: null,
          totalReadingTime: 0
        };
      }

      const today = new Date().toDateString();
      const lastReadDate = user.stats.lastReadDate ? new Date(user.stats.lastReadDate).toDateString() : null;
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (lastReadDate === yesterday) {
        user.stats.currentStreak += 1;
      } else if (lastReadDate !== today) {
        user.stats.currentStreak = 1;
      }

      if (user.stats.currentStreak > user.stats.longestStreak) {
        user.stats.longestStreak = user.stats.currentStreak;
      }

      user.stats.lastReadDate = new Date().toISOString();
      user.stats.totalChaptersRead = (user.stats.totalChaptersRead || 0) + 1;

      if (score >= PASSING_SCORE) {
        const nextChapter = chapterNumber + 1;
        const story = await loadStory(storyId);
        
        if (story && nextChapter > story.chapters.length) {
          // Book completed - check for green badge (90+ on all chapters)
          if (!user.badges) {
            user.badges = [];
          }
          
          // Check if all chapters have 90+ score
          const allChaptersScored90Plus = story.chapters.every(ch => {
            const chapterKey = `chapter${ch.chapter}`;
            const chapterScore = progress.scores[chapterKey];
            return chapterScore !== null && chapterScore >= 90;
          });
          
          const existingCompletedBadge = user.badges.find(b => 
            b.storyId === storyId && b.type === 'book_completed'
          );
          const existingGreenBadge = user.badges.find(b => 
            b.storyId === storyId && b.type === 'excellent_score'
          );
          
          // Add completed badge if not exists
          if (!existingCompletedBadge) {
            user.badges.push({
              id: `badge-${Date.now()}`,
              storyId,
              storyTitle: story.title,
              earnedAt: new Date().toISOString(),
              type: 'book_completed',
              score: score
            });
            user.stats.totalBooksRead = (user.stats.totalBooksRead || 0) + 1;
          }
          
          // Add green badge if 90+ on all chapters and doesn't exist
          if (allChaptersScored90Plus && !existingGreenBadge) {
            user.badges.push({
              id: `badge-green-${Date.now()}`,
              storyId,
              storyTitle: story.title,
              earnedAt: new Date().toISOString(),
              type: 'excellent_score',
              score: score
            });
          }
        }
      }

      const { loadUsers, saveUsers } = require('../utils/fileUtils');
      const users = await loadUsers();
      users[email] = user;
      await saveUsers(users);
    }
  } catch (err) {
    console.error('Error updating user stats:', err);
  }

  return {
    passed: score >= PASSING_SCORE,
    progress
  };
}

// AI-powered answer checking (handles spelling errors and semantic similarity)
async function checkAnswerWithAI(question, userAnswer, correctAnswer) {
  try {
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fall back to exact match if no API key
      return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    }

    const prompt = `You are an educational assessment assistant. Check if the student's answer is correct, considering spelling errors and semantic similarity.

Question: "${question}"
Correct Answer: "${correctAnswer}"
Student's Answer: "${userAnswer}"

Instructions:
- The student's answer should be considered correct if it means the same thing as the correct answer
- Ignore minor spelling errors (e.g., "shephered" vs "shepherd" is correct)
- Ignore differences in capitalization, punctuation, and extra spaces
- Accept synonyms if they convey the same meaning
- Only mark as incorrect if the answer is fundamentally wrong or completely unrelated

Respond with ONLY "CORRECT" or "INCORRECT" (no other text).`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful educational assistant. Respond with only "CORRECT" or "INCORRECT".' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 10
    });

    const response = completion.choices[0].message.content.trim().toUpperCase();
    return response === 'CORRECT';
  } catch (error) {
    console.error('AI answer check error:', error);
    // Fall back to exact match if AI fails
    return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  }
}

async function verifyAnswers(storyId, chapterNumber, answers) {
  const story = await loadStory(storyId);
  if (!story) {
    throw new Error('Story not found');
  }

  const chapter = story.chapters.find(ch => ch.chapter === chapterNumber);
  if (!chapter) {
    throw new Error('Chapter not found');
  }

  // Check all answers (use AI for semantic checking)
  const checkPromises = chapter.questions.map(async (q, index) => {
    const userAnswer = answers[index] || '';
    const correctAnswer = q.answer;
    
    // First try exact match (faster)
    const exactMatch = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    
    if (exactMatch) {
      return {
        questionId: q.id,
        isCorrect: true,
        correctAnswer: q.answer,
        userAnswer: answers[index] || ''
      };
    }
    
    // If not exact match, use AI to check semantic similarity
    const aiCheck = await checkAnswerWithAI(q.question, userAnswer, correctAnswer);
    
    return {
      questionId: q.id,
      isCorrect: aiCheck,
      correctAnswer: q.answer,
      userAnswer: answers[index] || ''
    };
  });

  const results = await Promise.all(checkPromises);
  const correctCount = results.filter(r => r.isCorrect).length;
  const score = Math.round((correctCount / chapter.questions.length) * 100);

  return {
    score,
    passed: score >= 70,
    results
  };
}

module.exports = {
  getUserProgress,
  updateProgressAfterCheckpoint,
  verifyAnswers
};
