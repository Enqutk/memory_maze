const { loadProgress, saveProgress, loadStory } = require('../utils/fileUtils');
const userService = require('./userService');

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
          if (!user.badges) {
            user.badges = [];
          }
          const existingBadge = user.badges.find(b => b.storyId === storyId);
          if (!existingBadge) {
            user.badges.push({
              id: `badge-${Date.now()}`,
              storyId,
              storyTitle: story.title,
              earnedAt: new Date().toISOString(),
              type: 'book_completed'
            });
            user.stats.totalBooksRead = (user.stats.totalBooksRead || 0) + 1;
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

async function verifyAnswers(storyId, chapterNumber, answers) {
  const story = await loadStory(storyId);
  if (!story) {
    throw new Error('Story not found');
  }

  const chapter = story.chapters.find(ch => ch.chapter === chapterNumber);
  if (!chapter) {
    throw new Error('Chapter not found');
  }

  let correctCount = 0;
  const results = chapter.questions.map((q, index) => {
    const userAnswer = answers[index]?.toLowerCase().trim();
    const correctAnswer = q.answer.toLowerCase().trim();
    const isCorrect = userAnswer === correctAnswer;
    
    if (isCorrect) correctCount++;
    
    return {
      questionId: q.id,
      isCorrect,
      correctAnswer: q.answer,
      userAnswer: answers[index]
    };
  });

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
