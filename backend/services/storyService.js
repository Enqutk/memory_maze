const { loadStory, saveStory, deleteStory, storyExists, getAllStories } = require('../utils/fileUtils');

async function getAllStoriesMetadata() {
  const stories = await getAllStories();
  return stories.map(story => ({
    id: story.id,
    title: story.title,
    description: story.description,
    difficulty: story.difficulty,
    totalChapters: story.chapters.length,
    coverImage: story.coverImage
  }));
}

async function getStoryById(storyId) {
  const story = await loadStory(storyId);
  if (!story) {
    throw new Error('Story not found');
  }
  return story;
}

async function getChapter(storyId, chapterNumber) {
  const story = await loadStory(storyId);
  if (!story) {
    throw new Error('Story not found');
  }

  const chapterNum = parseInt(chapterNumber);
  const chapter = story.chapters.find(ch => ch.chapter === chapterNum);

  if (!chapter) {
    throw new Error('Chapter not found');
  }

  return {
    chapter: chapter.chapter,
    title: chapter.title,
    content: chapter.content,
    questions: chapter.questions.map(q => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options
    }))
  };
}

async function createStory(storyData) {
  const { id, title, description, difficulty, chapters, coverImage } = storyData;

  if (!id || !title || !chapters || !Array.isArray(chapters)) {
    throw new Error('Missing required fields: id, title, chapters (array)');
  }

  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    throw new Error('Story ID can only contain letters, numbers, and hyphens');
  }

  if (await storyExists(id)) {
    throw new Error('Story with this ID already exists');
  }

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    if (!chapter.chapter || !chapter.title || !chapter.content || !chapter.questions) {
      throw new Error(`Chapter ${i + 1} missing required fields: chapter, title, content, questions`);
    }
    if (!Array.isArray(chapter.questions) || chapter.questions.length === 0) {
      throw new Error(`Chapter ${i + 1} must have at least one question`);
    }
    for (const question of chapter.questions) {
      if (!question.id || !question.question || !question.answer) {
        throw new Error(`Chapter ${i + 1} has invalid question format`);
      }
    }
  }

  const story = {
    id,
    title,
    description: description || '',
    difficulty: difficulty || 'medium',
    coverImage: coverImage || null,
    chapters: chapters
  };

  await saveStory(id, story);

  return story;
}

async function updateStory(storyId, updates) {
  const { title, description, difficulty, chapters, coverImage } = updates;
  const story = await loadStory(storyId);

  if (!story) {
    throw new Error('Story not found');
  }

  if (title !== undefined) story.title = title;
  if (description !== undefined) story.description = description;
  if (difficulty !== undefined) story.difficulty = difficulty;
  if (coverImage !== undefined) story.coverImage = coverImage;

  if (chapters !== undefined) {
    if (!Array.isArray(chapters)) {
      throw new Error('Chapters must be an array');
    }
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      if (!chapter.chapter || !chapter.title || !chapter.content || !chapter.questions) {
        throw new Error(`Chapter ${i + 1} missing required fields`);
      }
    }
    story.chapters = chapters;
  }

  await saveStory(storyId, story);

  return story;
}

async function removeStory(storyId) {
  const exists = await storyExists(storyId);
  if (!exists) {
    throw new Error('Story not found');
  }

  await deleteStory(storyId);
}

module.exports = {
  getAllStoriesMetadata,
  getStoryById,
  getChapter,
  createStory,
  updateStory,
  removeStory
};
