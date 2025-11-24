import { create } from "zustand";
import type { ApiUser } from "@/types/api";

export interface Post {
  _id: string;
  userId: string;
  author: ApiUser;
  text?: string;
  media: Array<{
    url: string;
    type: "image" | "video";
    aspectRatio?: "1:1" | "16:9" | "9:16";
  }>;
  reactionsCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  _id: string;
  authorId: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  status: "draft" | "published";
  likesCount: number;
  viewsCount: number;
  commentsCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface Poll {
  _id: string;
  authorId: string;
  question: string;
  options: Array<{
    text: string;
    votes: number;
  }>;
  media?: string;
  totalVotes: number;
  expiresAt?: string;
  allowMultiple: boolean;
  isActive: boolean;
  userVote?: number[];
  createdAt: string;
  updatedAt: string;
}

export type FeedItem = Post | Story | Poll;
export type FeedType = "general" | "following" | "foryou";

interface FeedState {
  // Feed data
  feedItems: FeedItem[];
  feedType: FeedType;
  isLoading: boolean;
  hasMore: boolean;
  cursor: string | null;

  // Actions
  setFeedType: (type: FeedType) => void;
  setFeedItems: (items: FeedItem[]) => void;
  addFeedItems: (items: FeedItem[]) => void;
  updateFeedItem: (id: string, updates: Partial<FeedItem>) => void;
  removeFeedItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setCursor: (cursor: string | null) => void;
  clearFeed: () => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  feedItems: [],
  feedType: "general",
  isLoading: false,
  hasMore: true,
  cursor: null,

  setFeedType: (type) => {
    set({ feedType: type });
    get().clearFeed();
  },

  setFeedItems: (items) => {
    set({ feedItems: items });
  },

  addFeedItems: (items) => {
    const currentItems = get().feedItems;
    const newItems = items.filter(
      (item) => !currentItems.some((existing) => existing._id === item._id)
    );
    set({ feedItems: [...currentItems, ...newItems] });
  },

  updateFeedItem: (id, updates) => {
    const items = get().feedItems;
    const updatedItems = items.map((item) =>
      item._id === id ? ({ ...item, ...updates } as FeedItem) : item
    );
    set({ feedItems: updatedItems });
  },

  removeFeedItem: (id) => {
    const items = get().feedItems;
    const filteredItems = items.filter((item) => item._id !== id);
    set({ feedItems: filteredItems });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setHasMore: (hasMore) => {
    set({ hasMore });
  },

  setCursor: (cursor) => {
    set({ cursor });
  },

  clearFeed: () => {
    set({
      feedItems: [],
      cursor: null,
      hasMore: true,
    });
  },
}));
