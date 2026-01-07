import type { ContentItem } from "@/types/api";

export interface EngagementSummary {
  posts: {
    total: number;
    reactions: number;
    comments: number;
  };
  stories: {
    total: number;
    views: number;
  };
  polls: {
    total: number;
    votes: number;
  };
}

export type AnalyticsContent = {
  posts: ContentItem[];
  stories: ContentItem[];
  polls: ContentItem[];
};

export type MonthCount = { label: string; count: number };
