import type { Request, Response } from "express";
import { logger } from "../utils/logger.util.js";
import {
  searchUsers,
  searchPosts,
  searchPolls,
  searchStories,
  globalSearch,
  getSearchSuggestions,
  saveSearchHistory,
  getUserSearchHistory,
  deleteSearchHistory,
  clearSearchHistory,
  getPopularSearches,
  getTrendingSearches,
} from "../utils/search.util.js";

type SearchSortBy = "relevance" | "newest" | "oldest" | "popular";

const parseSortBy = (value: unknown): SearchSortBy => {
  if (typeof value !== "string") return "relevance";
  if (value === "relevance" || value === "newest" || value === "oldest" || value === "popular") {
    return value;
  }
  return "relevance";
};

// =========================
// SEARCH CONTROLLERS
// =========================

/**
 * Enhanced search users
 * GET /api/search/users?q=query&limit=20&offset=0&sortBy=relevance&fuzzy=false&dateFrom=2023-01-01&dateTo=2023-12-31
 */
export const searchUsersController = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const {
      q: query,
      limit,
      offset,
      sortBy,
      fuzzy,
      dateFrom,
      dateTo,
    } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'q' is required",
      });
    }

    const searchOptions = {
      query,
      limit: Number(limit) || 20,
      offset: Number(offset) || 0,
      sortBy: parseSortBy(sortBy),
      fuzzy: fuzzy === "true",
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
    };

    const result = await searchUsers(searchOptions);

    // Save to search history
    if (userId) {
      await saveSearchHistory(userId, query, "users", result.total, {
        sortBy: searchOptions.sortBy,
        fuzzy: searchOptions.fuzzy,
        dateFrom: searchOptions.dateFrom,
        dateTo: searchOptions.dateTo,
      });
    }

    return res.json({
      success: true,
      data: {
        query,
        results: result.results,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
          total: result.total,
          count: result.results.length,
        },
        highlights: result.highlights,
      },
    });
  } catch (error) {
    logger.error("Error in searchUsersController", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Enhanced search posts
 * GET /api/search/posts?q=javascript&limit=20&offset=0&sortBy=relevance&fuzzy=false&author=user123&dateFrom=2023-01-01&dateTo=2023-12-31
 */
export const searchPostsController = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const {
      q: query,
      limit,
      offset,
      sortBy,
      fuzzy,
      author,
      dateFrom,
      dateTo,
    } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'q' is required",
      });
    }

    const searchOptions = {
      query,
      limit: Number(limit) || 20,
      offset: Number(offset) || 0,
      sortBy: parseSortBy(sortBy),
      fuzzy: fuzzy === "true",
      author: author as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
    };

    const result = await searchPosts(searchOptions);

    // Save to search history
    if (userId) {
      await saveSearchHistory(userId, query, "posts", result.total, {
        sortBy: searchOptions.sortBy,
        fuzzy: searchOptions.fuzzy,
        author: searchOptions.author,
        dateFrom: searchOptions.dateFrom,
        dateTo: searchOptions.dateTo,
      });
    }

    return res.json({
      success: true,
      data: {
        query,
        results: result.results,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
          total: result.total,
          count: result.results.length,
        },
        highlights: result.highlights,
      },
    });
  } catch (error) {
    logger.error("Error in searchPostsController", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Enhanced search polls
 * GET /api/search/polls?q=favorite&limit=20&offset=0&sortBy=relevance&fuzzy=false&author=user123&dateFrom=2023-01-01&dateTo=2023-12-31
 */
export const searchPollsController = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const {
      q: query,
      limit,
      offset,
      sortBy,
      fuzzy,
      author,
      dateFrom,
      dateTo,
    } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'q' is required",
      });
    }

    const searchOptions = {
      query,
      limit: Number(limit) || 20,
      offset: Number(offset) || 0,
      sortBy: parseSortBy(sortBy),
      fuzzy: fuzzy === "true",
      author: author as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
    };

    const result = await searchPolls(searchOptions);

    // Save to search history
    if (userId) {
      await saveSearchHistory(userId, query, "polls", result.total, {
        sortBy: searchOptions.sortBy,
        fuzzy: searchOptions.fuzzy,
        author: searchOptions.author,
        dateFrom: searchOptions.dateFrom,
        dateTo: searchOptions.dateTo,
      });
    }

    return res.json({
      success: true,
      data: {
        query,
        results: result.results,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
          total: result.total,
          count: result.results.length,
        },
        highlights: result.highlights,
      },
    });
  } catch (error) {
    logger.error("Error in searchPollsController", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Enhanced search stories
 * GET /api/search/stories?q=tutorial&limit=20&offset=0&sortBy=relevance&fuzzy=false&author=user123&dateFrom=2023-01-01&dateTo=2023-12-31
 */
export const searchStoriesController = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const {
      q: query,
      limit,
      offset,
      sortBy,
      fuzzy,
      author,
      dateFrom,
      dateTo,
    } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'q' is required",
      });
    }

    const searchOptions = {
      query,
      limit: Number(limit) || 20,
      offset: Number(offset) || 0,
      sortBy: parseSortBy(sortBy),
      fuzzy: fuzzy === "true",
      author: author as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
    };

    const result = await searchStories(searchOptions);

    // Save to search history
    if (userId) {
      await saveSearchHistory(userId, query, "stories", result.total, {
        sortBy: searchOptions.sortBy,
        fuzzy: searchOptions.fuzzy,
        author: searchOptions.author,
        dateFrom: searchOptions.dateFrom,
        dateTo: searchOptions.dateTo,
      });
    }

    return res.json({
      success: true,
      data: {
        query,
        results: result.results,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
          total: result.total,
          count: result.results.length,
        },
        highlights: result.highlights,
      },
    });
  } catch (error) {
    logger.error("Error in searchStoriesController", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Enhanced global search across all content types
 * GET /api/search/global?q=react&limit=5&sortBy=relevance&fuzzy=false
 */
export const globalSearchController = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const { q: query, limit, sortBy, fuzzy } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'q' is required",
      });
    }

    const searchOptions = {
      query,
      limit: Number(limit) || 5,
      sortBy: parseSortBy(sortBy),
      fuzzy: fuzzy === "true",
    };

    const results = await globalSearch(searchOptions);

    // Save to search history
    if (userId) {
      await saveSearchHistory(userId, query, "global", results.total, {
        sortBy: searchOptions.sortBy,
        fuzzy: searchOptions.fuzzy,
      });
    }

    return res.json({
      success: true,
      data: {
        query,
        results,
        counts: {
          users: results.users.length,
          posts: results.posts.length,
          polls: results.polls.length,
          stories: results.stories.length,
          total: results.total,
        },
      },
    });
  } catch (error) {
    logger.error("Error in globalSearchController", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get search suggestions (autocomplete)
 * GET /api/search/suggestions?q=query&limit=10
 */
export const getSearchSuggestionsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { q: query, limit } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'q' is required",
      });
    }

    const suggestions = await getSearchSuggestions(query, Number(limit) || 10);

    return res.json({
      success: true,
      data: {
        query,
        suggestions,
        count: suggestions.length,
      },
    });
  } catch (error) {
    logger.error("Error in getSearchSuggestionsController", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// SEARCH HISTORY CONTROLLERS
// =========================

/**
 * Get user's search history
 * GET /api/search/history?limit=20
 */
export const getSearchHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.auth?.userId;
    const { limit } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const history = await getUserSearchHistory(userId, Number(limit) || 20);

    return res.json({
      success: true,
      data: {
        history,
        count: history.length,
      },
    });
  } catch (error) {
    logger.error("Error in getSearchHistoryController", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Delete search from history
 * DELETE /api/search/history/:id
 */
export const deleteSearchHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.auth?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "History ID is required",
      });
    }

    const deleted = await deleteSearchHistory(userId, id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Search history not found",
      });
    }

    return res.json({
      success: true,
      message: "Search history deleted",
    });
  } catch (error) {
    logger.error("Error in deleteSearchHistoryController", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Clear all search history
 * DELETE /api/search/history
 */
export const clearSearchHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const deletedCount = await clearSearchHistory(userId);

    return res.json({
      success: true,
      message: `Cleared ${deletedCount} search history items`,
    });
  } catch (error) {
    logger.error("Error in clearSearchHistoryController", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// SEARCH ANALYTICS CONTROLLERS
// =========================

/**
 * Get popular searches
 * GET /api/search/analytics/popular?searchType=users&limit=10
 */
export const getPopularSearchesController = async (
  req: Request,
  res: Response
) => {
  try {
    const { searchType, limit } = req.query;

    const popularSearches = await getPopularSearches(
      searchType as string,
      Number(limit) || 10
    );

    return res.json({
      success: true,
      data: {
        popularSearches,
        count: popularSearches.length,
      },
    });
  } catch (error) {
    logger.error("Error in getPopularSearchesController", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get trending searches
 * GET /api/search/analytics/trending?searchType=users&limit=10
 */
export const getTrendingSearchesController = async (
  req: Request,
  res: Response
) => {
  try {
    const { searchType, limit } = req.query;

    const trendingSearches = await getTrendingSearches(
      searchType as string,
      Number(limit) || 10
    );

    return res.json({
      success: true,
      data: {
        trendingSearches,
        count: trendingSearches.length,
      },
    });
  } catch (error) {
    logger.error("Error in getTrendingSearchesController", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
