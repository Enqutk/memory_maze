import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (email, password) => 
    api.post('/auth/register', { email, password }),
  
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
};

// Stories API
export const storiesAPI = {
  getAll: () => api.get('/stories'),
  
  getById: (storyId) => api.get(`/stories/${storyId}`),
  
  getChapter: (storyId, chapterNumber) => 
    api.get(`/stories/${storyId}/chapters/${chapterNumber}`),
};

// Progress API
export const progressAPI = {
  get: (storyId) => api.get(`/progress/${storyId}`),
  
  submitCheckpoint: (storyId, chapterNumber, answers, score) =>
    api.post(`/progress/${storyId}/checkpoint`, {
      chapterNumber,
      answers,
      score,
    }),
  
  verifyAnswers: (storyId, chapterNumber, answers) =>
    api.post(`/progress/${storyId}/verify`, {
      chapterNumber,
      answers,
    }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  
  updateSettings: (settings) => api.put('/users/settings', settings),
  
  updateStreak: () => api.post('/users/streak'),
  
  addBadge: (storyId, storyTitle) => api.post('/users/badge', { storyId, storyTitle }),
  
  saveBook: (storyId) => api.post('/users/saved-books', { storyId }),
  
  unsaveBook: (storyId) => api.delete(`/users/saved-books/${storyId}`),
};

// Admin API
export const adminAPI = {
  // User Management
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (email, role) => api.put(`/admin/users/${email}/role`, { role }),
  deleteUser: (email) => api.delete(`/admin/users/${email}`),
  
  // Statistics
  getStats: () => api.get('/admin/stats'),
  getProgress: () => api.get('/admin/progress'),
  
  // Story Management
  getStories: () => api.get('/admin/stories'),
  createStory: (storyData) => api.post('/admin/stories', storyData),
  updateStory: (storyId, storyData) => api.put(`/admin/stories/${storyId}`, storyData),
  deleteStory: (storyId) => api.delete(`/admin/stories/${storyId}`),
};

// Notes API
export const notesAPI = {
  saveNote: (storyId, chapterNumber, noteData) => 
    api.post('/notes', { storyId, chapterNumber, ...noteData }),
  
  getNote: (storyId, chapterNumber) => 
    api.get(`/notes/${storyId}/${chapterNumber}`),
  
  getAllNotesForStory: (storyId) => 
    api.get(`/notes/${storyId}`),
  
  getAllNotes: () => 
    api.get('/notes/all'),
};

// Chat API
export const chatAPI = {
  sendMessage: (message, conversationHistory = []) =>
    api.post('/chat/message', { message, conversationHistory }),
  
  getRecommendations: (preferences = {}) =>
    api.post('/chat/recommendations', { preferences }),
};

export default api;
