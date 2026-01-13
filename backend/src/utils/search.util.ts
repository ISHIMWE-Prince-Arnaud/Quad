import { User } from "../models/User.model.js";
import { Post } from "../models/Post.model.js";
import { logger } from "./logger.util.js";
import { Poll } from "../models/Poll.model.js";
import { Story } from "../models/Story.model.js";
import { SearchHistory } from "../models/SearchHistory.model.js";
import { SearchAnalytics } from "../models/SearchAnalytics.model.js";

type UserSearchLean = {
  clerkId: string;
  username?: string;
  displayName?: string;
  profileImage?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  createdAt?: Date;
  score?: number;
};

type PostSearchLean = {
  _id: unknown;
  text?: string;
  createdAt?: Date;
  reactionsCount?: number;
  commentsCount?: number;
  score?: number;
};

type PollSearchLean = {
  _id: unknown;
  question?: string;
  createdAt?: Date;
  totalVotes?: number;
  reactionsCount?: number;
  commentsCount?: number;
  score?: number;
};

type StorySearchLean = {
  _id: unknown;
  title?: string;
  content?: string;
  createdAt?: Date;
  publishedAt?: Date;
  viewsCount?: number;
  reactionsCount?: number;
  commentsCount?: number;
  score?: number;
};

type SortCriteria = Record<string, 1 | -1 | { $meta: "textScore" }>;

// =========================
// MONGODB SEARCH UTILITIES
// =========================

// Search options interface
interface SearchOptions {
  query?: string;
  limit?: number;
  offset?: number;
  dateFrom?: Date | undefined;
  dateTo?: Date | undefined;
  author?: string;
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'popular';
  fuzzy?: boolean;
}

// Search result interface
interface SearchResult<T> {
  results: T[];
  total: number;
  hasMore: boolean;
  page: number;
  totalPages: number;
  highlights?: { [key: string]: string[] };
}

/**
 * Enhanced search users with filters, pagination, and fuzzy search
 */
export const searchUsers = async (
  options: SearchOptions
): Promise<SearchResult<UserSearchLean>> => {
  try {
    const { 
      query = "", 
      limit = 20, 
      offset = 0, 
      dateFrom, 
      dateTo, 
      sortBy = 'relevance',
      fuzzy = false 
    } = options;

    // Build search query
    const searchQuery: Record<string, unknown> = {};
    
    if (query && query.trim().length > 0) {
      if (fuzzy) {
        // Fuzzy search using regex for typo tolerance
        const fuzzyPattern = query.split('').join('.*');
        searchQuery.$or = [
          { $text: { $search: query } },
          { username: { $regex: fuzzyPattern, $options: 'i' } },
          { displayName: { $regex: fuzzyPattern, $options: 'i' } }
        ];
      } else {
        searchQuery.$text = { $search: query };
      }
    }

    // Add date filters
    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt.$gte = dateFrom;
      if (dateTo) createdAt.$lte = dateTo;
      searchQuery.createdAt = createdAt;
    }

    // Build sort criteria
    let sortCriteria: SortCriteria = {};
    switch (sortBy) {
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'popular':
        sortCriteria = { followersCount: -1, createdAt: -1 };
        break;
      case 'relevance':
      default:
        if (query && !fuzzy) {
          sortCriteria = { score: { $meta: "textScore" } };
        } else {
          sortCriteria = { createdAt: -1 };
        }
        break;
    }

    // Get total count for pagination
    const total = await User.countDocuments(searchQuery);
    
    // Execute search with pagination
    const projection = query && !fuzzy ? { score: { $meta: "textScore" } } : {};
    const users = await User.find(searchQuery, projection)
      .sort(sortCriteria)
      .skip(offset)
      .limit(limit)
      .select("clerkId username displayName bio profileImage followersCount followingCount createdAt")
      .lean<UserSearchLean[]>();

    // Calculate pagination info
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    const hasMore = offset + limit < total;

    // Generate highlights for text search
    const highlights: { [key: string]: string[] } = {};
    if (query && users.length > 0) {
      users.forEach((user) => {
        const userHighlights: string[] = [];
        if (user.username?.toLowerCase().includes(query.toLowerCase())) {
          userHighlights.push(user.username);
        }
        if (user.displayName?.toLowerCase().includes(query.toLowerCase())) {
          userHighlights.push(user.displayName);
        }
        if (userHighlights.length > 0) {
          highlights[user.clerkId] = userHighlights;
        }
      });
    }

    return {
      results: users,
      total,
      hasMore,
      page,
      totalPages,
      highlights
    };
  } catch (error) {
    logger.error("Error searching users", error);
    return {
      results: [],
      total: 0,
      hasMore: false,
      page: 1,
      totalPages: 0
    };
  }
};

/**
 * Enhanced search posts with filters, pagination, and fuzzy search
 */
export const searchPosts = async (
  options: SearchOptions
): Promise<SearchResult<PostSearchLean>> => {
  try {
    const { 
      query = "", 
      limit = 20, 
      offset = 0, 
      dateFrom, 
      dateTo, 
      author,
      sortBy = 'relevance',
      fuzzy = false 
    } = options;

    // Build search query
    const searchQuery: Record<string, unknown> = {};
    
    if (query && query.trim().length > 0) {
      if (fuzzy) {
        // Fuzzy search using regex
        const fuzzyPattern = query.split(' ').map(word => 
          word.split('').join('.*')
        ).join('|');
        searchQuery.$or = [
          { $text: { $search: query } },
          { text: { $regex: fuzzyPattern, $options: 'i' } }
        ];
      } else {
        searchQuery.$text = { $search: query };
      }
    }

    // Add date filters
    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt.$gte = dateFrom;
      if (dateTo) createdAt.$lte = dateTo;
      searchQuery.createdAt = createdAt;
    }

    // Add author filter
    if (author) {
      searchQuery["author.clerkId"] = author;
    }

    // Build sort criteria
    let sortCriteria: SortCriteria = {};
    switch (sortBy) {
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'popular':
        sortCriteria = { reactionsCount: -1, commentsCount: -1, createdAt: -1 };
        break;
      case 'relevance':
      default:
        if (query && !fuzzy) {
          sortCriteria = { score: { $meta: "textScore" } };
        } else {
          sortCriteria = { createdAt: -1 };
        }
        break;
    }

    // Get total count for pagination
    const total = await Post.countDocuments(searchQuery);
    
    // Execute search with pagination
    const projection = query && !fuzzy ? { score: { $meta: "textScore" } } : {};
    const posts = await Post.find(searchQuery, projection)
      .sort(sortCriteria)
      .skip(offset)
      .limit(limit)
      .select("userId author text media reactionsCount commentsCount createdAt")
      .lean<PostSearchLean[]>();

    // Calculate pagination info
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    const hasMore = offset + limit < total;

    // Generate highlights for text search
    const highlights: { [key: string]: string[] } = {};
    if (query && posts.length > 0) {
      posts.forEach((post) => {
        if (post.text?.toLowerCase().includes(query.toLowerCase())) {
          highlights[String(post._id)] = [post.text.substring(0, 100) + "..."];
        }
      });
    }

    return {
      results: posts,
      total,
      hasMore,
      page,
      totalPages,
      highlights
    };
  } catch (error) {
    logger.error("Error searching posts", error);
    return {
      results: [],
      total: 0,
      hasMore: false,
      page: 1,
      totalPages: 0
    };
  }
};

/**
 * Enhanced search polls with filters, pagination, and fuzzy search
 */
export const searchPolls = async (
  options: SearchOptions
): Promise<SearchResult<PollSearchLean>> => {
  try {
    const { 
      query = "", 
      limit = 20, 
      offset = 0, 
      dateFrom, 
      dateTo, 
      author,
      sortBy = 'relevance',
      fuzzy = false 
    } = options;

    // Build search query
    const searchQuery: Record<string, unknown> = { status: "active" }; // Only active polls
    
    if (query && query.trim().length > 0) {
      if (fuzzy) {
        const fuzzyPattern = query.split(' ').map(word => 
          word.split('').join('.*')
        ).join('|');
        searchQuery.$or = [
          { $text: { $search: query } },
          { question: { $regex: fuzzyPattern, $options: 'i' } }
        ];
      } else {
        searchQuery.$text = { $search: query };
      }
    }

    // Add date filters
    if (dateFrom || dateTo) {
      const createdAt: Record<string, Date> = {};
      if (dateFrom) createdAt.$gte = dateFrom;
      if (dateTo) createdAt.$lte = dateTo;
      searchQuery.createdAt = createdAt;
    }

    // Add author filter
    if (author) {
      searchQuery["author.clerkId"] = author;
    }

    // Build sort criteria
    let sortCriteria: SortCriteria = {};
    switch (sortBy) {
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'popular':
        sortCriteria = { totalVotes: -1, createdAt: -1 };
        break;
      case 'relevance':
      default:
        if (query && !fuzzy) {
          sortCriteria = { score: { $meta: "textScore" } };
        } else {
          sortCriteria = { createdAt: -1 };
        }
        break;
    }

    // Get total count for pagination
    const total = await Poll.countDocuments(searchQuery);
    
    // Execute search with pagination
    const projection = query && !fuzzy ? { score: { $meta: "textScore" } } : {};
    const polls = await Poll.find(searchQuery, projection)
      .sort(sortCriteria)
      .skip(offset)
      .limit(limit)
      .select("author question options status totalVotes reactionsCount commentsCount expiresAt createdAt")
      .lean<PollSearchLean[]>();

    // Calculate pagination info
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    const hasMore = offset + limit < total;

    return {
      results: polls,
      total,
      hasMore,
      page,
      totalPages
    };
  } catch (error) {
    logger.error("Error searching polls", error);
    return {
      results: [],
      total: 0,
      hasMore: false,
      page: 1,
      totalPages: 0
    };
  }
};

/**
 * Enhanced search stories with filters, pagination, and fuzzy search
 */
export const searchStories = async (
  options: SearchOptions
): Promise<SearchResult<StorySearchLean>> => {
  try {
    const { 
      query = "", 
      limit = 20, 
      offset = 0, 
      dateFrom, 
      dateTo, 
      author,
      sortBy = 'relevance',
      fuzzy = false 
    } = options;

    // Build search query
    const searchQuery: Record<string, unknown> = { status: "published" }; // Only published stories
    
    if (query && query.trim().length > 0) {
      if (fuzzy) {
        const fuzzyPattern = query.split(' ').map(word => 
          word.split('').join('.*')
        ).join('|');
        searchQuery.$or = [
          { $text: { $search: query } },
          { title: { $regex: fuzzyPattern, $options: 'i' } },
          { content: { $regex: fuzzyPattern, $options: 'i' } }
        ];
      } else {
        searchQuery.$text = { $search: query };
      }
    }

    // Add date filters
    if (dateFrom || dateTo) {
      const publishedAt: Record<string, Date> = {};
      if (dateFrom) publishedAt.$gte = dateFrom;
      if (dateTo) publishedAt.$lte = dateTo;
      searchQuery.publishedAt = publishedAt;
    }

    // Add author filter
    if (author) {
      searchQuery.userId = author;
    }

    // Build sort criteria
    let sortCriteria: SortCriteria = {};
    switch (sortBy) {
      case 'newest':
        sortCriteria = { publishedAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { publishedAt: 1 };
        break;
      case 'popular':
        sortCriteria = { viewsCount: -1, reactionsCount: -1 };
        break;
      case 'relevance':
      default:
        if (query && !fuzzy) {
          sortCriteria = { score: { $meta: "textScore" } };
        } else {
          sortCriteria = { publishedAt: -1 };
        }
        break;
    }

    // Get total count for pagination
    const total = await Story.countDocuments(searchQuery);
    
    // Execute search with pagination
    const projection = query && !fuzzy ? { score: { $meta: "textScore" } } : {};
    const stories = await Story.find(searchQuery, projection)
      .sort(sortCriteria)
      .skip(offset)
      .limit(limit)
      .select("userId author title excerpt coverImage tags viewsCount reactionsCount commentsCount publishedAt createdAt")
      .lean<StorySearchLean[]>();

    // Calculate pagination info
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    const hasMore = offset + limit < total;

    return {
      results: stories,
      total,
      hasMore,
      page,
      totalPages
    };
  } catch (error) {
    logger.error("Error searching stories", error);
    return {
      results: [],
      total: 0,
      hasMore: false,
      page: 1,
      totalPages: 0
    };
  }
};

/**
 * Enhanced global search across all content types
 */
export const globalSearch = async (options: SearchOptions) => {
  try {
    const { query = "", limit = 5 } = options;
    
    if (!query || query.trim().length === 0) {
      return {
        users: [],
        posts: [],
        polls: [],
        stories: [],
        total: 0
      };
    }

    // Search all content types in parallel
    const [users, posts, polls, stories] = await Promise.all([
      searchUsers({ ...options, limit }),
      searchPosts({ ...options, limit }),
      searchPolls({ ...options, limit }),
      searchStories({ ...options, limit })
    ]);

    return {
      users: users.results,
      posts: posts.results,
      polls: polls.results,
      stories: stories.results,
      total: users.results.length + posts.results.length + polls.results.length + stories.results.length
    };
  } catch (error) {
    logger.error("Error in global search", error);
    return {
      users: [],
      posts: [],
      polls: [],
      stories: [],
      total: 0
    };
  }
};

/**
 * Get search suggestions (autocomplete)
 */
export const getSearchSuggestions = async (query: string, limit: number = 10) => {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    // Search for users that start with the query
    const userSuggestions = await User.find({
      $or: [
        { username: { $regex: `^${query}`, $options: "i" } },
        { displayName: { $regex: `^${query}`, $options: "i" } }
      ]
    })
      .limit(limit)
      .select("username displayName profileImage")
      .lean();

    return userSuggestions.map(user => ({
      type: "user",
      text: user.username,
      displayName: user.displayName,
      profileImage: user.profileImage
    }));
  } catch (error) {
    logger.error("Error getting search suggestions", error);
    return [];
  }
};

// =========================
// SEARCH HISTORY FUNCTIONS
// =========================

/**
 * Save search to history
 */
export const saveSearchHistory = async (
  userId: string,
  query: string,
  searchType: 'users' | 'posts' | 'polls' | 'stories' | 'global',
  resultsCount: number,
  filters?: Record<string, unknown>
) => {
  try {
    // Don't save empty queries
    if (!query || query.trim().length === 0) {
      return;
    }

    // Check if this exact search was done recently (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSearch = await SearchHistory.findOne({
      userId,
      query: query.trim(),
      searchType,
      createdAt: { $gte: oneHourAgo }
    });

    if (!recentSearch) {
      // Save new search history
      await SearchHistory.create({
        userId,
        query: query.trim(),
        searchType,
        resultsCount,
        filters
      });
    }

    // Update analytics
    await updateSearchAnalytics(query.trim(), searchType, resultsCount);
  } catch (error) {
    logger.error("Error saving search history", error);
  }
};

/**
 * Get user's search history
 */
export const getUserSearchHistory = async (userId: string, limit: number = 20) => {
  try {
    const history = await SearchHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("query searchType resultsCount filters createdAt")
      .lean();

    return history;
  } catch (error) {
    logger.error("Error getting search history", error);
    return [];
  }
};

/**
 * Delete search from history
 */
export const deleteSearchHistory = async (userId: string, historyId: string) => {
  try {
    const result = await SearchHistory.findOneAndDelete({
      _id: historyId,
      userId
    });
    return !!result;
  } catch (error) {
    logger.error("Error deleting search history", error);
    return false;
  }
};

/**
 * Clear all search history for user
 */
export const clearSearchHistory = async (userId: string) => {
  try {
    const result = await SearchHistory.deleteMany({ userId });
    return result.deletedCount || 0;
  } catch (error) {
    logger.error("Error clearing search history", error);
    return 0;
  }
};

// =========================
// SEARCH ANALYTICS FUNCTIONS
// =========================

/**
 * Update search analytics
 */
export const updateSearchAnalytics = async (
  query: string,
  searchType: 'users' | 'posts' | 'polls' | 'stories' | 'global',
  resultsCount: number
) => {
  try {
    const existingAnalytics = await SearchAnalytics.findOne({ query, searchType });

    if (existingAnalytics) {
      // Update existing analytics
      const newAvg = (existingAnalytics.avgResultsCount * existingAnalytics.searchCount + resultsCount) / (existingAnalytics.searchCount + 1);
      
      await SearchAnalytics.findByIdAndUpdate(existingAnalytics._id, {
        $inc: { searchCount: 1 },
        $set: { 
          lastSearched: new Date(),
          avgResultsCount: newAvg
        }
      });
    } else {
      // Create new analytics entry
      await SearchAnalytics.create({
        query,
        searchType,
        searchCount: 1,
        lastSearched: new Date(),
        avgResultsCount: resultsCount
      });
    }
  } catch (error) {
    logger.error("Error updating search analytics", error);
  }
};

/**
 * Get popular searches
 */
export const getPopularSearches = async (searchType?: string, limit: number = 10) => {
  try {
    const query: Record<string, unknown> = {};
    if (searchType) {
      query.searchType = searchType;
    }

    const popularSearches = await SearchAnalytics.find(query)
      .sort({ searchCount: -1, lastSearched: -1 })
      .limit(limit)
      .select("query searchType searchCount lastSearched avgResultsCount")
      .lean();

    return popularSearches;
  } catch (error) {
    logger.error("Error getting popular searches", error);
    return [];
  }
};

/**
 * Get trending searches (popular in last 7 days)
 */
export const getTrendingSearches = async (searchType?: string, limit: number = 10) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const query: Record<string, unknown> = {
      lastSearched: { $gte: sevenDaysAgo }
    };
    
    if (searchType) {
      query.searchType = searchType;
    }

    const trendingSearches = await SearchAnalytics.find(query)
      .sort({ searchCount: -1, lastSearched: -1 })
      .limit(limit)
      .select("query searchType searchCount lastSearched avgResultsCount")
      .lean();

    return trendingSearches;
  } catch (error) {
    logger.error("Error getting trending searches", error);
    return [];
  }
};
