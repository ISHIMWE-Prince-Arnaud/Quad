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
 * Handle response format
 * Extract data from success responses, handle error responses
 */
api.interceptors.response.use(
  (response) => {
    // If response has success flag and data, extract it
    if (response.data && typeof response.data === 'object') {
      // Keep the original response structure but normalize it
      return response;
    }
    return response;
  },
  (error) => {
    // Handle error responses with structured error format
    if (error.response?.data) {
      const errorData = error.response.data;
      // Create a more descriptive error message
      const message = errorData.message || 'An error occurred';
      const errorCode = errorData.errorCode || 'UNKNOWN_ERROR';
      
      // Attach error details to the error object
      error.errorCode = errorCode;
      error.errorDetails = errorData.details;
      error.message = message;
    }
    return Promise.reject(error);
  }
);

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
  getPosts: (page: number = 1, limit: number = 20) =>
    api.get('/posts', { params: { page, limit } }),
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
  getPolls: (type?: 'regular' | 'would-you-rather', page: number = 1, limit: number = 20) =>
    api.get('/polls', { params: { type, page, limit } }),
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
  getConfessions: (page: number = 1, limit: number = 20) =>
    api.get('/confessions', { params: { page, limit } }),
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
  getMessages: (page: number = 1, limit: number = 50) =>
    api.get('/chat/messages', { params: { page, limit } }),
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
