import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { logError } from "./errorHandling";
import { requestCache, generateCacheKey } from "./requestCache";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Rate limiting state
interface RateLimitState {
  retryAfter: number | null;
  requestCount: number;
  windowStart: number;
}

const rateLimitState: RateLimitState = {
  retryAfter: null,
  requestCount: 0,
  windowStart: Date.now(),
};

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Note: Clerk tokens will be added per-request using useAuthenticatedRequest hook
// This is because Clerk tokens are dynamic and managed by the Clerk SDK

// Request interceptor to add auth token, CSRF token, handle rate limiting, and implement caching
api.interceptors.request.use(
  async (config) => {
    // Check if we're in a rate limit cooldown
    if (rateLimitState.retryAfter && Date.now() < rateLimitState.retryAfter) {
      const waitTime = Math.ceil(
        (rateLimitState.retryAfter - Date.now()) / 1000
      );
      return Promise.reject(
        new Error(
          `Rate limited. Please wait ${waitTime} seconds before retrying.`
        )
      );
    }

    // Add auth token from Clerk when available
    const token = localStorage.getItem("clerk-db-jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests
    const method = config.method?.toUpperCase() || "GET";
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const { getCSRFToken } = await import("./csrfProtection");
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }

    // Add retry metadata
    if (!config.headers["X-Retry-Count"]) {
      config.headers["X-Retry-Count"] = "0";
    }

    // For GET requests, check cache and deduplicate
    if (config.method?.toLowerCase() === "get") {
      const cacheKey = generateCacheKey(
        config.url || "",
        config.params as Record<string, unknown>
      );

      // Check if we should skip cache (e.g., for real-time data)
      const skipCache = config.headers["X-Skip-Cache"] === "true";

      if (!skipCache) {
        // Check cache first
        const cached = requestCache.get<AxiosResponse>(cacheKey);
        if (cached) {
          // Return cached response
          return Promise.reject({
            config,
            response: cached,
            isCache: true,
          });
        }
      }
    }

    return config;
  },
  (error) => {
    logError(error, { component: "API", action: "request-interceptor" });
    return Promise.reject(error);
  }
);

// Response interceptor for error handling with retry logic and caching
api.interceptors.response.use(
  (response) => {
    // Reset rate limit state on successful response
    if (rateLimitState.retryAfter && Date.now() >= rateLimitState.retryAfter) {
      rateLimitState.retryAfter = null;
      rateLimitState.requestCount = 0;
    }

    const request = response?.request as XMLHttpRequest | undefined;
    const finalUrl = request?.responseURL;

    if (typeof finalUrl === "string" && !finalUrl.includes("/api/")) {
      localStorage.removeItem("clerk-db-jwt");
      window.location.href = "/login";
      return Promise.reject(new Error("Session expired"));
    }

    // Cache GET responses
    if (response.config.method?.toLowerCase() === "get") {
      const skipCache = response.config.headers["X-Skip-Cache"] === "true";
      if (!skipCache) {
        const cacheKey = generateCacheKey(
          response.config.url || "",
          response.config.params as Record<string, unknown>
        );

        // Determine TTL based on endpoint
        let ttl = 5 * 60 * 1000; // 5 minutes default

        // Static data can be cached longer
        if (
          response.config.url?.includes("/profile/") ||
          response.config.url?.includes("/users/")
        ) {
          ttl = 10 * 60 * 1000; // 10 minutes for user data
        }

        // Real-time data should have shorter TTL
        if (
          response.config.url?.includes("/feed") ||
          response.config.url?.includes("/notifications")
        ) {
          ttl = 30 * 1000; // 30 seconds for feed/notifications
        }

        requestCache.set(cacheKey, response, ttl);
      }
    }

    return response;
  },
  async (
    error:
      | AxiosError
      | {
          config: InternalAxiosRequestConfig;
          response: AxiosResponse;
          isCache: true;
        }
  ) => {
    // Handle cached responses
    if ("isCache" in error && error.isCache) {
      return Promise.resolve(error.response);
    }

    const axiosError = error as AxiosError;
    const originalRequest = axiosError.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Handle 401 Unauthorized - clear token and redirect to login
    if (axiosError.response?.status === 401) {
      localStorage.removeItem("clerk-db-jwt");

      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        // Store intended destination
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
        window.location.href = "/login";
      }

      logError(axiosError, {
        component: "API",
        action: "authentication-error",
      });

      return Promise.reject(axiosError);
    }

    // Handle 429 Rate Limiting
    if (axiosError.response?.status === 429) {
      const retryAfterHeader = axiosError.response.headers["retry-after"];
      const retryAfterSeconds = retryAfterHeader
        ? parseInt(retryAfterHeader, 10)
        : 60; // Default to 60 seconds
      const retryAfter = retryAfterSeconds * 1000;

      rateLimitState.retryAfter = Date.now() + retryAfter;

      // Record rate limit for this endpoint
      const endpoint = originalRequest?.url || "unknown";
      const { rateLimitManager } = await import("./rateLimitHandler");
      rateLimitManager.recordRateLimit(endpoint, retryAfterSeconds);

      logError(axiosError, {
        component: "API",
        action: "rate-limit-error",
        metadata: { retryAfter, endpoint },
      });

      return Promise.reject(axiosError);
    }

    // Retry logic for network errors and 5xx errors
    const shouldRetry =
      !axiosError.response || // Network error
      (axiosError.response.status >= 500 && axiosError.response.status < 600); // Server error

    if (shouldRetry && originalRequest && !originalRequest._retry) {
      const retryCount = originalRequest._retryCount || 0;
      const maxRetries = 3;

      if (retryCount < maxRetries) {
        originalRequest._retry = true;
        originalRequest._retryCount = retryCount + 1;

        // Update retry count header
        originalRequest.headers["X-Retry-Count"] = String(retryCount + 1);

        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);

        logError(axiosError, {
          component: "API",
          action: "retry-attempt",
          metadata: {
            retryCount: retryCount + 1,
            maxRetries,
            delay,
          },
        });

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));

        return api(originalRequest);
      }
    }

    // Log server errors
    if (axiosError.response?.status && axiosError.response.status >= 500) {
      logError(axiosError, {
        component: "API",
        action: "server-error",
        metadata: {
          status: axiosError.response.status,
          url: originalRequest?.url,
        },
      });
    }

    // Log network errors
    if (!axiosError.response) {
      logError(axiosError, {
        component: "API",
        action: "network-error",
        metadata: {
          url: originalRequest?.url,
        },
      });
    }

    return Promise.reject(axiosError);
  }
);

// Export cache invalidation helpers
export function invalidateCache(pattern?: string | RegExp) {
  if (!pattern) {
    requestCache.clear();
  } else if (typeof pattern === "string") {
    requestCache.invalidate(pattern);
  } else {
    requestCache.invalidatePattern(pattern);
  }
}

// API endpoints based on verified backend routes
export const endpoints = {
  // Authentication & Users
  users: {
    create: () => api.post("/users"),
    getByClerkId: (clerkId: string) => api.get(`/users/${clerkId}`),
    update: (clerkId: string, data: unknown) =>
      api.put(`/users/${clerkId}`, data),
    delete: (clerkId: string) => api.delete(`/users/${clerkId}`),
  },

  // Profiles
  profiles: {
    // Backend exposes GET /profile/:username and PUT /profile/:username
    updateOwn: (username: string, data: unknown) =>
      api.put(`/profile/${username}`, data),
    getByUsername: (username: string) => api.get(`/profile/${username}`),
    getById: (userId: string) => api.get(`/profile/id/${userId}`),
    getUserPosts: (username: string, params?: unknown) =>
      api.get(`/profile/${username}/posts`, { params }),
    getUserStories: (username: string, params?: unknown) =>
      api.get(`/profile/${username}/stories`, { params }),
    getUserPolls: (username: string, params?: unknown) =>
      api.get(`/profile/${username}/polls`, { params }),
  },

  // Posts
  posts: {
    create: (data: unknown) => api.post("/posts", data),
    getAll: (params?: unknown) => api.get("/posts", { params }),
    getById: (id: string) => api.get(`/posts/${id}`),
    update: (id: string, data: unknown) => api.put(`/posts/${id}`, data),
    delete: (id: string) => api.delete(`/posts/${id}`),
  },

  // Stories
  stories: {
    create: (data: unknown) => api.post("/stories", data),
    getAll: (params?: unknown) => api.get("/stories", { params }),
    getMine: (params?: unknown) => api.get("/stories/me", { params }),
    getById: (id: string) => api.get(`/stories/${id}`),
    update: (id: string, data: unknown) => api.put(`/stories/${id}`, data),
    delete: (id: string) => api.delete(`/stories/${id}`),
  },

  // Polls
  polls: {
    create: (data: unknown) => api.post("/polls", data),
    getAll: (params?: unknown) => api.get("/polls", { params }),
    getMine: (params?: unknown) => api.get("/polls/me", { params }),
    getById: (id: string) => api.get(`/polls/${id}`),
    update: (id: string, data: unknown) => api.put(`/polls/${id}`, data),
    delete: (id: string) => api.delete(`/polls/${id}`),
    vote: (id: string, data: unknown) => api.post(`/polls/${id}/vote`, data),
    removeVote: (id: string) => api.delete(`/polls/${id}/vote`),
    close: (id: string) => api.post(`/polls/${id}/close`),
  },

  // Feed
  feed: {
    getGeneral: (params?: unknown) => api.get("/feed", { params }),
    getFollowing: (params?: unknown) => api.get("/feed/following", { params }),
    getForYou: (params?: unknown) => api.get("/feed/foryou", { params }),
    getNewCount: (params?: unknown) => api.get("/feed/new-count", { params }),
  },

  // Follow System
  follow: {
    followUser: (userId: string) => api.post(`/follow/${userId}`),
    unfollowUser: (userId: string) => api.delete(`/follow/${userId}`),
    getFollowers: (userId: string, params?: unknown) =>
      api.get(`/follow/${userId}/followers`, { params }),
    getFollowing: (userId: string, params?: unknown) =>
      api.get(`/follow/${userId}/following`, { params }),
    checkFollowing: (userId: string) => api.get(`/follow/${userId}/check`),
    getMutualFollows: (userId: string) => api.get(`/follow/${userId}/mutual`),
    getStats: (userId: string) => api.get(`/follow/${userId}/stats`),
  },

  // Reactions
  reactions: {
    toggle: (data: unknown) => api.post("/reactions", data),
    getUserReactions: () => api.get("/reactions/me"),
    getByContent: (contentType: string, contentId: string) =>
      api.get(`/reactions/${contentType}/${contentId}`),
    remove: (contentType: string, contentId: string) =>
      api.delete(`/reactions/${contentType}/${contentId}`),
  },

  // Comments
  comments: {
    create: (data: unknown) => api.post("/comments", data),
    getByContent: (contentType: string, contentId: string, params?: unknown) =>
      api.get(`/comments/${contentType}/${contentId}`, { params }),
    getById: (id: string) => api.get(`/comments/${id}`),
    getReplies: (id: string, params?: unknown) =>
      api.get(`/comments/${id}/replies`, { params }),
    update: (id: string, data: unknown) => api.put(`/comments/${id}`, data),
    delete: (id: string) => api.delete(`/comments/${id}`),
    toggleLike: (data: unknown) => api.post("/comments/like", data),
    getLikes: (id: string) => api.get(`/comments/${id}/likes`),
  },

  // Chat
  chat: {
    sendMessage: (data: unknown) => api.post("/chat/messages", data),
    getMessages: (params?: unknown) => api.get("/chat/messages", { params }),
    editMessage: (id: string, data: unknown) =>
      api.put(`/chat/messages/${id}`, data),
    deleteMessage: (id: string) => api.delete(`/chat/messages/${id}`),
    addReaction: (id: string, data: unknown) =>
      api.post(`/chat/messages/${id}/reactions`, data),
    removeReaction: (id: string) =>
      api.delete(`/chat/messages/${id}/reactions`),
    markAsRead: (data: unknown) => api.post("/chat/read", data),
  },

  // Search
  search: {
    global: (params?: unknown) => api.get("/search/global", { params }),
    users: (params?: unknown) => api.get("/search/users", { params }),
    posts: (params?: unknown) => api.get("/search/posts", { params }),
    stories: (params?: unknown) => api.get("/search/stories", { params }),
    polls: (params?: unknown) => api.get("/search/polls", { params }),
    suggestions: (params?: unknown) =>
      api.get("/search/suggestions", { params }),
    history: (params?: unknown) => api.get("/search/history", { params }),
    deleteHistory: (id?: string) =>
      id ? api.delete(`/search/history/${id}`) : api.delete("/search/history"),
    getPopular: (params?: unknown) =>
      api.get("/search/analytics/popular", { params }),
    getTrending: (params?: unknown) =>
      api.get("/search/analytics/trending", { params }),
  },

  // Notifications
  notifications: {
    getAll: (params?: unknown) => api.get("/notifications", { params }),
    getUnreadCount: () => api.get("/notifications/unread-count"),
    markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.patch("/notifications/read-all"),
    delete: (id: string) => api.delete(`/notifications/${id}`),
    deleteAllRead: () => api.delete("/notifications/read"),
  },

  // File Uploads
  upload: {
    post: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/upload/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // 60 seconds for file uploads
      });
    },
    story: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/upload/story", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // 60 seconds for file uploads
      });
    },
    poll: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/upload/poll", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // 60 seconds for file uploads
      });
    },
    chat: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/upload/chat", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // 60 seconds for file uploads
      });
    },
    profile: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/upload/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // 60 seconds for file uploads
      });
    },
    cover: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/upload/cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // 60 seconds for file uploads
      });
    },
    delete: (url: string) => api.delete("/upload", { data: { url } }),
  },
};

export default api;
