import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Axios instance with base URL
 */
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

/**
 * Add access token to requests if it exists
 */
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * Handle response format and automatic token refresh
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
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;

        // Update stored access token
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

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
