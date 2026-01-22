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
export type FeedType = "following" | "foryou";

interface FeedState {
  // Feed data
  feedItems: FeedItem[];
  itemIds: Set<string>;
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
  itemIds: new Set(),
  feedType: "following",
  isLoading: false,
  hasMore: true,
  cursor: null,

  setFeedType: (type) => {
    set({ feedType: type });
    get().clearFeed();
  },

  setFeedItems: (items) => {
    set({ 
      feedItems: items,
      itemIds: new Set(items.map(item => item._id))
    });
  },

  addFeedItems: (items) => {
    const { feedItems, itemIds } = get();
    const newItems = items.filter((item) => !itemIds.has(item._id));
    
    if (newItems.length > 0) {
      const nextItemIds = new Set(itemIds);
      newItems.forEach(item => nextItemIds.add(item._id));
      
      set({ 
        feedItems: [...feedItems, ...newItems],
        itemIds: nextItemIds
      });
    }
  },

  updateFeedItem: (id, updates) => {
    const items = get().feedItems;
    const updatedItems = items.map((item) =>
      item._id === id ? ({ ...item, ...updates } as FeedItem) : item
    );
    set({ feedItems: updatedItems });
  },

  removeFeedItem: (id) => {
    const { feedItems, itemIds } = get();
    const filteredItems = feedItems.filter((item) => item._id !== id);
    const nextItemIds = new Set(itemIds);
    nextItemIds.delete(id);
    
    set({ 
      feedItems: filteredItems,
      itemIds: nextItemIds
    });
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
      itemIds: new Set(),
      cursor: null,
      hasMore: true,
    });
  },
}));
