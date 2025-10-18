import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Axios instance with base URL
 */
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

/**
 * Add token to requests if it exists
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Auth API calls
 */
export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  getMe: () => api.get('/auth/me'),
};

/**
 * Posts API calls
 */
export const postsAPI = {
  getPosts: () => api.get('/posts'),
  createPost: (formData: FormData) =>
    api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  likePost: (postId: string) => api.post(`/posts/${postId}/like`),
  getComments: (postId: string) => api.get(`/posts/${postId}/comments`),
  addComment: (postId: string, content: string) =>
    api.post(`/posts/${postId}/comment`, { content }),
};

/**
 * Polls API calls
 */
export const pollsAPI = {
  getPolls: (type?: 'regular' | 'would-you-rather') =>
    api.get('/polls', { params: { type } }),
  createPoll: (formData: FormData) =>
    api.post('/polls', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  votePoll: (pollId: string, optionIndex: number) =>
    api.post(`/polls/${pollId}/vote`, { optionIndex }),
};

/**
 * Confessions API calls
 */
export const confessionsAPI = {
  getConfessions: () => api.get('/confessions'),
  createConfession: (formData: FormData) =>
    api.post('/confessions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  likeConfession: (confessionId: string, anonymousAuthorId: string) =>
    api.post(`/confessions/${confessionId}/like`, { anonymousAuthorId }),
  addThought: (confessionId: string, content: string, anonymousAuthorId: string) =>
    api.post(`/confessions/${confessionId}/thought`, { content, anonymousAuthorId }),
};

/**
 * Chat API calls
 */
export const chatAPI = {
  getMessages: (limit?: number) =>
    api.get('/chat/messages', { params: { limit } }),
  sendMessage: (formData: FormData) =>
    api.post('/chat/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

/**
 * Users API calls
 */
export const usersAPI = {
  getUserProfile: (username: string) => api.get(`/users/${username}`),
  updateProfilePicture: (formData: FormData) =>
    api.put('/users/me/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
