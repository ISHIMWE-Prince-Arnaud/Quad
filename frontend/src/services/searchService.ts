import type { ApiProfile, ApiPost, ApiStory, ApiPoll } from "@/types/api";

export interface SearchHistoryItem {
  _id: string;
  query: string;
  createdAt?: string;
}

type ApiSearchResult<T> = {
  results: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

type UserSearchParams = {
  q: string;
  sortBy?: "relevance" | "date" | "followers";
  fuzzy?: boolean;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
};

type GlobalSearchResult = {
  users: ApiProfile[];
  posts: ApiPost[];
  stories: ApiStory[];
  polls: ApiPoll[];
  total: number;
};

type ContentSearchParams = {
  q: string;
  limit?: number;
  offset?: number;
  sortBy?: "relevance" | "date" | "popularity";
  fuzzy?: boolean;
  dateFrom?: string;
  dateTo?: string;
};

export class SearchService {
  // Search users
  static async searchUsers(
    params: UserSearchParams
  ): Promise<ApiSearchResult<ApiProfile>> {
    return {
      results: [],
      total: 0,
      page: Math.floor((params.offset || 0) / (params.limit || 20)) + 1,
      limit: params.limit || 20,
      hasMore: false,
    };
  }

  // Get search suggestions (autocomplete)
  static async getSearchSuggestions(
    query: string,
    limit = 10
  ): Promise<string[]> {
    void query;
    void limit;
    return [];
  }

  // Get search history
  static async getSearchHistory(limit = 20): Promise<SearchHistoryItem[]> {
    void limit;
    return [];
  }

  // Clear search history
  static async clearSearchHistory(): Promise<void> {
    return;
  }

  // Delete specific search from history
  static async deleteSearchHistoryItem(id: string): Promise<void> {
    void id;
    return;
  }

  // Get popular searches
  static async getPopularSearches(
    searchType = "users",
    limit = 10
  ): Promise<string[]> {
    void searchType;
    void limit;
    return [];
  }

  // Get trending searches
  static async getTrendingSearches(
    searchType = "users",
    limit = 10
  ): Promise<string[]> {
    void searchType;
    void limit;
    return [];
  }

  // Global search (all content types)
  static async globalSearch(
    params: ContentSearchParams
  ): Promise<GlobalSearchResult> {
    void params;
    return {
      users: [],
      posts: [],
      stories: [],
      polls: [],
      total: 0,
    };
  }

  // Search posts
  static async searchPosts(
    params: ContentSearchParams
  ): Promise<ApiSearchResult<ApiPost>> {
    void params;
    return {
      results: [],
      total: 0,
      page: Math.floor((params.offset || 0) / (params.limit || 20)) + 1,
      limit: params.limit || 20,
      hasMore: false,
    };
  }

  // Search stories
  static async searchStories(
    params: ContentSearchParams
  ): Promise<ApiSearchResult<ApiStory>> {
    void params;
    return {
      results: [],
      total: 0,
      page: Math.floor((params.offset || 0) / (params.limit || 20)) + 1,
      limit: params.limit || 20,
      hasMore: false,
    };
  }

  // Search polls
  static async searchPolls(
    params: ContentSearchParams
  ): Promise<ApiSearchResult<ApiPoll>> {
    void params;
    return {
      results: [],
      total: 0,
      page: Math.floor((params.offset || 0) / (params.limit || 20)) + 1,
      limit: params.limit || 20,
      hasMore: false,
    };
  }

  // Quick user search for components
  static async quickUserSearch(query: string): Promise<ApiProfile[]> {
    if (!query.trim()) return [];

    const result = await this.searchUsers({
      q: query,
      limit: 10,
      sortBy: "relevance",
    });

    return result.results;
  }
}
