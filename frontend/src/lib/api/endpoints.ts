import { api } from "./apiInstance";

export const endpoints = {
  users: {
    create: () => api.post("/users"),
    getByClerkId: (clerkId: string) => api.get(`/users/${clerkId}`),
    update: (clerkId: string, data: unknown) => api.put(`/users/${clerkId}`, data),
    delete: (clerkId: string) => api.delete(`/users/${clerkId}`),
  },

  profiles: {
    updateOwn: (username: string, data: unknown) => api.put(`/profile/${username}`, data),
    getByUsername: (username: string) => api.get(`/profile/${username}`),
    getById: (userId: string) => api.get(`/profile/id/${userId}`),
    getUserPosts: (username: string, params?: unknown) =>
      api.get(`/profile/${username}/posts`, { params }),
    getUserStories: (username: string, params?: unknown) =>
      api.get(`/profile/${username}/stories`, { params }),
    getUserPolls: (username: string, params?: unknown) =>
      api.get(`/profile/${username}/polls`, { params }),
  },

  posts: {
    create: (data: unknown) => api.post("/posts", data),
    getAll: (params?: unknown) => api.get("/posts", { params }),
    getById: (id: string) => api.get(`/posts/${id}`),
    update: (id: string, data: unknown) => api.put(`/posts/${id}`, data),
    delete: (id: string) => api.delete(`/posts/${id}`),
  },

  stories: {
    create: (data: unknown) => api.post("/stories", data),
    getAll: (params?: unknown) => api.get("/stories", { params }),
    getMine: (params?: unknown) => api.get("/stories/me", { params }),
    getById: (id: string) => api.get(`/stories/${id}`),
    update: (id: string, data: unknown) => api.put(`/stories/${id}`, data),
    delete: (id: string) => api.delete(`/stories/${id}`),
  },

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

  feed: {
    getGeneral: (params?: unknown) => api.get("/feed", { params }),
    getFollowing: (params?: unknown) => api.get("/feed/following", { params }),
    getForYou: (params?: unknown) => api.get("/feed/foryou", { params }),
    getNewCount: (params?: unknown) => api.get("/feed/new-count", { params }),
  },

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

  reactions: {
    toggle: (data: unknown) => api.post("/reactions", data),
    getUserReactions: (params?: unknown) => api.get("/reactions/me", { params }),
    getByContent: (contentType: string, contentId: string) =>
      api.get(`/reactions/${contentType}/${contentId}`),
    remove: (contentType: string, contentId: string) =>
      api.delete(`/reactions/${contentType}/${contentId}`),
  },

  comments: {
    create: (data: unknown) => api.post("/comments", data),
    getByContent: (contentType: string, contentId: string, params?: unknown) =>
      api.get(`/comments/${contentType}/${contentId}`, { params }),
    getById: (id: string) => api.get(`/comments/${id}`),
    getReplies: (id: string, params?: unknown) => api.get(`/comments/${id}/replies`, { params }),
    update: (id: string, data: unknown) => api.put(`/comments/${id}`, data),
    delete: (id: string) => api.delete(`/comments/${id}`),
    toggleLike: (data: unknown) => api.post("/comments/like", data),
    getLikes: (id: string) => api.get(`/comments/${id}/likes`),
  },

  bookmarks: {
    toggle: (data: unknown) => api.post("/bookmarks", data),
    list: (params?: unknown) => api.get("/bookmarks", { params }),
    remove: (contentType: string, contentId: string) =>
      api.delete(`/bookmarks/${contentType}/${contentId}`),
    check: (contentType: string, contentId: string) =>
      api.get(`/bookmarks/${contentType}/${contentId}/check`),
  },

  analytics: {
    profile: (params?: unknown) => api.get("/analytics/profile", { params }),
    followers: (params?: unknown) => api.get("/analytics/followers", { params }),
    summary: () => api.get("/analytics/summary"),
    recordProfileView: (data: unknown) => api.post("/analytics/profile-view", data),
    content: (params?: unknown) => api.get("/analytics/content", { params }),
  },

  chat: {
    sendMessage: (data: unknown) => api.post("/chat/messages", data),
    getMessages: (params?: unknown) => api.get("/chat/messages", { params }),
    editMessage: (id: string, data: unknown) => api.put(`/chat/messages/${id}`, data),
    deleteMessage: (id: string) => api.delete(`/chat/messages/${id}`),
    addReaction: (id: string, data: unknown) => api.post(`/chat/messages/${id}/reactions`, data),
    removeReaction: (id: string) => api.delete(`/chat/messages/${id}/reactions`),
    markAsRead: (data: unknown) => api.post("/chat/read", data),
  },

  search: {
    global: (params?: unknown) => api.get("/search/global", { params }),
    users: (params?: unknown) => api.get("/search/users", { params }),
    posts: (params?: unknown) => api.get("/search/posts", { params }),
    stories: (params?: unknown) => api.get("/search/stories", { params }),
    polls: (params?: unknown) => api.get("/search/polls", { params }),
    suggestions: (params?: unknown) => api.get("/search/suggestions", { params }),
    history: (params?: unknown) => api.get("/search/history", { params }),
    deleteHistory: (id?: string) =>
      id ? api.delete(`/search/history/${id}`) : api.delete("/search/history"),
    getPopular: (params?: unknown) => api.get("/search/analytics/popular", { params }),
    getTrending: (params?: unknown) => api.get("/search/analytics/trending", { params }),
  },

  notifications: {
    getAll: (params?: unknown) => api.get("/notifications", { params }),
    getUnreadCount: () => api.get("/notifications/unread-count"),
    markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.patch("/notifications/read-all"),
    delete: (id: string) => api.delete(`/notifications/${id}`),
    deleteAllRead: () => api.delete("/notifications/read"),
  },

  upload: {
    post: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/upload/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
    },
    story: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/upload/story", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
    },
    poll: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/upload/poll", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
    },
    chat: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/upload/chat", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
    },
    profile: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/upload/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
    },
    cover: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/upload/cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
    },
    delete: (url: string) => api.delete("/upload", { data: { url } }),
  },
};
