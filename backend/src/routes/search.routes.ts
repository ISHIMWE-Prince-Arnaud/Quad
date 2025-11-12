import { Router } from "express";
import { requireAuth } from "@clerk/express";
import {
  searchUsersController,
  searchPostsController,
  searchPollsController,
  searchStoriesController,
  globalSearchController,
  getSearchSuggestionsController,
  getSearchHistoryController,
  deleteSearchHistoryController,
  clearSearchHistoryController,
  getPopularSearchesController,
  getTrendingSearchesController
} from "../controllers/search.controller.js";

const router = Router();

// =========================
// ENHANCED SEARCH ROUTES
// =========================

// Enhanced search users with filters, pagination, fuzzy search
// GET /api/search/users?q=john&limit=20&offset=0&sortBy=relevance&fuzzy=false&dateFrom=2023-01-01&dateTo=2023-12-31
router.get("/users", requireAuth(), searchUsersController);

// Enhanced search posts with filters, pagination, fuzzy search
// GET /api/search/posts?q=javascript&limit=20&offset=0&sortBy=relevance&fuzzy=false&author=user123&dateFrom=2023-01-01&dateTo=2023-12-31
router.get("/posts", requireAuth(), searchPostsController);

// Enhanced search polls with filters, pagination, fuzzy search
// GET /api/search/polls?q=favorite&limit=20&offset=0&sortBy=relevance&fuzzy=false&author=user123&dateFrom=2023-01-01&dateTo=2023-12-31
router.get("/polls", requireAuth(), searchPollsController);

// Enhanced search stories with filters, pagination, fuzzy search
// GET /api/search/stories?q=tutorial&limit=20&offset=0&sortBy=relevance&fuzzy=false&author=user123&dateFrom=2023-01-01&dateTo=2023-12-31
router.get("/stories", requireAuth(), searchStoriesController);

// Enhanced global search (all content types) with filters
// GET /api/search/global?q=react&limit=5&sortBy=relevance&fuzzy=false
router.get("/global", requireAuth(), globalSearchController);

// Get search suggestions (autocomplete)
// GET /api/search/suggestions?q=jo&limit=10
router.get("/suggestions", requireAuth(), getSearchSuggestionsController);

// =========================
// SEARCH HISTORY ROUTES
// =========================

// Get user's search history
// GET /api/search/history?limit=20
router.get("/history", requireAuth(), getSearchHistoryController);

// Delete specific search from history
// DELETE /api/search/history/:id
router.delete("/history/:id", requireAuth(), deleteSearchHistoryController);

// Clear all search history
// DELETE /api/search/history
router.delete("/history", requireAuth(), clearSearchHistoryController);

// =========================
// SEARCH ANALYTICS ROUTES
// =========================

// Get popular searches
// GET /api/search/analytics/popular?searchType=users&limit=10
router.get("/analytics/popular", requireAuth(), getPopularSearchesController);

// Get trending searches (last 7 days)
// GET /api/search/analytics/trending?searchType=users&limit=10
router.get("/analytics/trending", requireAuth(), getTrendingSearchesController);

export default router;
