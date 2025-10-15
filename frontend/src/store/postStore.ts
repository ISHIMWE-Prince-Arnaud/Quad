import { create } from "zustand";
import api from "../utils/api";
import { Post, EmojiType } from "../types";
import { socketService } from "../services/socketService";

interface PostState {
  posts: Post[];
  isLoading: boolean;
  currentFilter: string;
  currentTag: string | null;
  fetchPosts: (filter?: string, tag?: string) => Promise<void>;
  uploadPost: (formData: FormData) => Promise<void>;
  reactToPost: (postId: string, emoji: EmojiType) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;

  setFilter: (filter: string) => void;
  setTag: (tag: string | null) => void;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,
  currentFilter: "newest",
  currentTag: null,

  fetchPosts: async (filter = "newest", tag?: string) => {
    try {
      set({ isLoading: true });
      const params: any = { sort: filter };
      if (tag) params.tag = tag;

      const response = await api.get("/posts", { params });
      set({
        posts: response.data.posts,
        isLoading: false,
        currentFilter: filter,
        currentTag: tag || null,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  uploadPost: async (formData: FormData) => {
    try {
      const response = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newPost = response.data;

      // Add new post to the beginning of the list
      set((state) => ({
        posts: [newPost, ...state.posts],
      }));

      // Emit new post event
      socketService.emitPostCreate(newPost);

      return newPost;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Upload failed");
    }
  },

  reactToPost: async (postId: string, emoji: EmojiType) => {
    try {
      const response = await api.post(`/posts/${postId}/react`, { emoji });

      // Update post in the list
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? response.data : post
        ),
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Reaction failed");
    }
  },

  addComment: async (postId: string, text: string) => {
    try {
      const response = await api.post(`/posts/${postId}/comment`, { text });
      const updatedPost = response.data;

      // Update post with new comment
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? updatedPost : post
        ),
      }));

      // Return the new comment for socket emission
      return updatedPost.comments[updatedPost.comments.length - 1];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Comment failed");
    }
  },

  setFilter: (filter: string) => {
    set({ currentFilter: filter });
    get().fetchPosts(filter, get().currentTag || undefined);
  },

  setTag: (tag: string | null) => {
    set({ currentTag: tag });
    get().fetchPosts(get().currentFilter, tag || undefined);
  },
}));
