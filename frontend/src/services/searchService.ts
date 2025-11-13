import { endpoints } from '@/lib/api';
import type { 
  ApiProfile, 
  ApiSearchResult,
  UserSearchParams,
  GlobalSearchResult
} from '@/types/api';

export class SearchService {
  // Search users
  static async searchUsers(params: UserSearchParams): Promise<ApiSearchResult<ApiProfile>> {
    const response = await endpoints.search.users({
      q: params.q,
      limit: params.limit || 20,
      offset: params.offset || 0,
      sortBy: params.sortBy || 'relevance',
      fuzzy: params.fuzzy || false,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo
    });
    
    return {
      results: response.data.data.users || [],
      total: response.data.data.total || 0,
      page: Math.floor((params.offset || 0) / (params.limit || 20)) + 1,
      limit: params.limit || 20,
      hasMore: response.data.data.hasMore || false
    };
  }

  // Get search suggestions (autocomplete)
  static async getSearchSuggestions(query: string, limit = 10): Promise<string[]> {
    const response = await endpoints.search.suggestions({
      q: query,
      limit
    });
    
    return response.data.data.suggestions || [];
  }

  // Get search history
  static async getSearchHistory(limit = 20): Promise<string[]> {
    const response = await endpoints.search.history({ limit });
    return response.data.data.history || [];
  }

  // Clear search history
  static async clearSearchHistory(): Promise<void> {
    await endpoints.search.deleteHistory();
  }

  // Delete specific search from history
  static async deleteSearchHistoryItem(id: string): Promise<void> {
    await endpoints.search.deleteHistory(id);
  }

  // Get popular searches
  static async getPopularSearches(searchType = 'users', limit = 10): Promise<string[]> {
    const response = await endpoints.search.getPopular({
      searchType,
      limit
    });
    
    return response.data.data.searches || [];
  }

  // Get trending searches
  static async getTrendingSearches(searchType = 'users', limit = 10): Promise<string[]> {
    const response = await endpoints.search.getTrending({
      searchType,
      limit
    });
    
    return response.data.data.searches || [];
  }

  // Global search (all content types)
  static async globalSearch(query: string, limit = 20): Promise<GlobalSearchResult> {
    const response = await endpoints.search.global({
      q: query,
      limit
    });
    
    return {
      users: response.data.data.users || [],
      posts: response.data.data.posts || [],
      stories: response.data.data.stories || [],
      polls: response.data.data.polls || [],
      total: response.data.data.total || 0
    };
  }

  // Quick user search for components
  static async quickUserSearch(query: string): Promise<ApiProfile[]> {
    if (!query.trim()) return [];
    
    const result = await this.searchUsers({
      q: query,
      limit: 10,
      sortBy: 'relevance'
    });
    
    return result.results;
  }
}
