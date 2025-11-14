# 🔍 **Search System Documentation**

## 📋 **Overview**

Quad implements a comprehensive search system using MongoDB text indexes, providing full-text search across users, posts, stories, and polls with advanced features like fuzzy search, filters, analytics, and search suggestions.

---

## 🏗️ **Search Architecture**

### **Search Components**

```
Frontend Search → API Endpoints → Search Services → MongoDB Text Indexes → Results + Analytics
```

### **Core Features**

- **Full-text Search**: MongoDB text indexes with relevance scoring
- **Fuzzy Search**: Approximate string matching for typos
- **Advanced Filters**: Date ranges, content types, user filters
- **Search Analytics**: Track queries, popular searches, trends
- **Search History**: User search history and suggestions
- **Real-time Suggestions**: Autocomplete functionality

---

## 🗂️ **Database Indexes**

### **Text Indexes Configuration**

```typescript
// User Model Text Index
UserSchema.index(
  {
    username: "text",
    displayName: "text",
    bio: "text",
  },
  {
    weights: {
      username: 10,
      displayName: 8,
      bio: 2,
    },
  }
);

// Post Model Text Index
PostSchema.index(
  {
    content: "text",
    tags: "text",
  },
  {
    weights: {
      content: 10,
      tags: 5,
    },
  }
);

// Story Model Text Index
StorySchema.index(
  {
    title: "text",
    content: "text",
    tags: "text",
  },
  {
    weights: {
      title: 15,
      content: 10,
      tags: 5,
    },
  }
);

// Poll Model Text Index
PollSchema.index(
  {
    question: "text",
    description: "text",
  },
  {
    weights: {
      question: 10,
      description: 5,
    },
  }
);
```

---

## 🔧 **Search Services**

### **User Search** (`utils/search.util.ts`)

```typescript
export const searchUsers = async (
  options: SearchOptions
): Promise<SearchResult<IUserDocument>> => {
  try {
    const {
      query,
      limit = 20,
      offset = 0,
      sortBy = "relevance",
      fuzzy = false,
      filters = {},
    } = options;

    // Build search query
    const searchQuery: any = {
      $text: { $search: query },
    };

    // Add filters
    if (filters.verified !== undefined) {
      searchQuery.isVerified = filters.verified;
    }

    if (filters.userIds) {
      searchQuery._id = { $in: filters.userIds };
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: searchQuery },
      {
        $addFields: {
          score: { $meta: "textScore" },
          // Boost verified users
          adjustedScore: {
            $cond: [
              { $eq: ["$isVerified", true] },
              { $multiply: [{ $meta: "textScore" }, 1.5] },
              { $meta: "textScore" },
            ],
          },
        },
      },
    ];

    // Add sorting
    if (sortBy === "relevance") {
      pipeline.push({ $sort: { adjustedScore: -1 } });
    } else if (sortBy === "recent") {
      pipeline.push({ $sort: { createdAt: -1 } });
    } else if (sortBy === "followers") {
      // Join with follows to sort by follower count
      pipeline.push(
        {
          $lookup: {
            from: "follows",
            localField: "clerkId",
            foreignField: "followingId",
            as: "followers",
          },
        },
        {
          $addFields: {
            followerCount: { $size: "$followers" },
          },
        },
        { $sort: { followerCount: -1 } }
      );
    }

    // Add pagination
    pipeline.push({ $skip: offset }, { $limit: limit });

    // Execute search
    const users = await User.aggregate(pipeline);

    // Get total count
    const totalPipeline = [{ $match: searchQuery }, { $count: "total" }];
    const totalResult = await User.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Calculate pagination
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    const hasMore = offset + users.length < total;

    // Generate highlights
    const highlights = generateHighlights(users, query);

    return {
      results: users,
      total,
      hasMore,
      page,
      totalPages,
      highlights,
    };
  } catch (error) {
    logger.error("Error searching users", error);
    return {
      results: [],
      total: 0,
      hasMore: false,
      page: 1,
      totalPages: 0,
    };
  }
};
```

### **Post Search with Advanced Filters**

```typescript
export const searchPosts = async (
  options: SearchOptions
): Promise<SearchResult<IPostDocument>> => {
  try {
    const {
      query,
      limit = 20,
      offset = 0,
      sortBy = "relevance",
      filters = {},
    } = options;

    // Build search query
    const searchQuery: any = {
      $text: { $search: query },
      isArchived: false, // Only search non-archived posts
    };

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      searchQuery.createdAt = {};
      if (filters.dateFrom) {
        searchQuery.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        searchQuery.createdAt.$lte = new Date(filters.dateTo);
      }
    }

    // Author filter
    if (filters.author) {
      searchQuery.userId = filters.author;
    }

    // Media type filter
    if (filters.hasMedia) {
      searchQuery.mediaUrls = { $exists: true, $not: { $size: 0 } };
    }

    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      searchQuery.tags = { $in: filters.tags };
    }

    // Build aggregation pipeline
    const pipeline = [
      { $match: searchQuery },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "clerkId",
          as: "author",
        },
      },
      {
        $addFields: {
          score: { $meta: "textScore" },
          author: { $arrayElemAt: ["$author", 0] },
          // Engagement boost
          engagementScore: {
            $add: [
              { $multiply: ["$likesCount", 1] },
              { $multiply: ["$commentsCount", 2] },
              { $multiply: ["$sharesCount", 3] },
            ],
          },
        },
      },
    ];

    // Sorting logic
    if (sortBy === "relevance") {
      pipeline.push({
        $addFields: {
          finalScore: {
            $add: [
              { $multiply: [{ $meta: "textScore" }, 0.7] },
              { $multiply: ["$engagementScore", 0.3] },
            ],
          },
        },
      });
      pipeline.push({ $sort: { finalScore: -1 } });
    } else if (sortBy === "recent") {
      pipeline.push({ $sort: { createdAt: -1 } });
    } else if (sortBy === "popular") {
      pipeline.push({ $sort: { engagementScore: -1, createdAt: -1 } });
    }

    // Add pagination
    pipeline.push({ $skip: offset }, { $limit: limit });

    const posts = await Post.aggregate(pipeline);

    // Get total count
    const total = await Post.countDocuments(searchQuery);

    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    const hasMore = offset + posts.length < total;

    const highlights = generateHighlights(posts, query);

    return {
      results: posts,
      total,
      hasMore,
      page,
      totalPages,
      highlights,
    };
  } catch (error) {
    logger.error("Error searching posts", error);
    return {
      results: [],
      total: 0,
      hasMore: false,
      page: 1,
      totalPages: 0,
    };
  }
};
```

### **Global Search (All Content Types)**

```typescript
export const globalSearch = async (
  query: string,
  limit: number = 5,
  userId?: string
): Promise<GlobalSearchResult> => {
  try {
    const searchOptions = {
      query,
      limit,
      offset: 0,
      sortBy: "relevance" as const,
    };

    // Search all content types in parallel
    const [users, posts, polls, stories] = await Promise.all([
      searchUsers(searchOptions),
      searchPosts(searchOptions),
      searchPolls(searchOptions),
      searchStories(searchOptions),
    ]);

    // Save search history if user is provided
    if (userId) {
      await saveSearchHistory(
        userId,
        query,
        "global",
        users.results.length +
          posts.results.length +
          polls.results.length +
          stories.results.length
      );
    }

    return {
      users: users.results,
      posts: posts.results,
      polls: polls.results,
      stories: stories.results,
      total:
        users.results.length +
        posts.results.length +
        polls.results.length +
        stories.results.length,
    };
  } catch (error) {
    logger.error("Error in global search", error);
    return {
      users: [],
      posts: [],
      polls: [],
      stories: [],
      total: 0,
    };
  }
};
```

---

## 🔍 **Search Suggestions & Autocomplete**

### **Search Suggestions Service**

```typescript
export const getSearchSuggestions = async (
  query: string,
  limit: number = 10
): Promise<SearchSuggestion[]> => {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    // Get user suggestions (username starts with query)
    const userSuggestions = await User.find({
      username: new RegExp(`^${query}`, "i"),
    })
      .select("username displayName profileImage")
      .limit(limit)
      .lean();

    return userSuggestions.map((user) => ({
      type: "user",
      text: user.username,
      displayName: user.displayName,
      profileImage: user.profileImage,
    }));
  } catch (error) {
    logger.error("Error getting search suggestions", error);
    return [];
  }
};

// Get trending hashtags for suggestions
export const getTrendingHashtags = async (
  limit: number = 10
): Promise<string[]> => {
  try {
    const trending = await Post.aggregate([
      { $unwind: "$tags" },
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
        },
      },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 1 } },
    ]);

    return trending.map((item) => item._id);
  } catch (error) {
    logger.error("Error getting trending hashtags", error);
    return [];
  }
};
```

---

## 📊 **Search Analytics**

### **Search History Management**

```typescript
export const saveSearchHistory = async (
  userId: string,
  query: string,
  searchType: string,
  resultsCount: number,
  filters?: any
): Promise<void> => {
  try {
    // Don't save very short queries or empty results
    if (query.length < 2) return;

    // Save to user's search history
    await SearchHistory.create({
      userId,
      query: query.trim(),
      searchType,
      resultsCount,
      filters,
    });

    // Update analytics
    await updateSearchAnalytics(query.trim(), searchType, resultsCount);
  } catch (error) {
    logger.error("Error saving search history", error);
  }
};

export const getUserSearchHistory = async (
  userId: string,
  limit: number = 20
) => {
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

export const clearSearchHistory = async (userId: string) => {
  try {
    const result = await SearchHistory.deleteMany({ userId });
    return result.deletedCount || 0;
  } catch (error) {
    logger.error("Error clearing search history", error);
    return 0;
  }
};
```

### **Search Analytics Tracking**

```typescript
const updateSearchAnalytics = async (
  query: string,
  searchType: string,
  resultsCount: number
): Promise<void> => {
  try {
    const existing = await SearchAnalytics.findOne({ query, searchType });

    if (existing) {
      existing.searchCount += 1;
      existing.lastSearched = new Date();
      existing.avgResultsCount = (existing.avgResultsCount + resultsCount) / 2;
      await existing.save();
    } else {
      await SearchAnalytics.create({
        query,
        searchType,
        searchCount: 1,
        lastSearched: new Date(),
        avgResultsCount: resultsCount,
      });
    }
  } catch (error) {
    logger.error("Error updating search analytics", error);
  }
};

export const getPopularSearches = async (
  searchType?: string,
  limit: number = 10
) => {
  try {
    const query: any = {};
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

export const getTrendingSearches = async (
  searchType?: string,
  limit: number = 10
) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const query: any = {
      lastSearched: { $gte: sevenDaysAgo },
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
```

---

## 🎯 **Search Result Highlighting**

### **Text Highlighting Utility**

```typescript
export const generateHighlights = (
  results: any[],
  query: string
): Record<string, string[]> => {
  const highlights: Record<string, string[]> = {};

  if (!query || !results.length) return highlights;

  const searchTerms = query
    .toLowerCase()
    .split(" ")
    .filter((term) => term.length > 2);

  results.forEach((result, index) => {
    const itemHighlights: string[] = [];

    // Highlight in different fields based on content type
    if (result.username) {
      const usernameHighlight = highlightText(result.username, searchTerms);
      if (usernameHighlight)
        itemHighlights.push(`Username: ${usernameHighlight}`);
    }

    if (result.displayName) {
      const displayNameHighlight = highlightText(
        result.displayName,
        searchTerms
      );
      if (displayNameHighlight)
        itemHighlights.push(`Name: ${displayNameHighlight}`);
    }

    if (result.content) {
      const contentHighlight = highlightText(result.content, searchTerms, 150);
      if (contentHighlight) itemHighlights.push(`Content: ${contentHighlight}`);
    }

    if (result.title) {
      const titleHighlight = highlightText(result.title, searchTerms);
      if (titleHighlight) itemHighlights.push(`Title: ${titleHighlight}`);
    }

    if (result.question) {
      const questionHighlight = highlightText(result.question, searchTerms);
      if (questionHighlight)
        itemHighlights.push(`Question: ${questionHighlight}`);
    }

    if (itemHighlights.length > 0) {
      highlights[result._id || index] = itemHighlights;
    }
  });

  return highlights;
};

const highlightText = (
  text: string,
  searchTerms: string[],
  maxLength?: number
): string | null => {
  if (!text || !searchTerms.length) return null;

  let highlightedText = text;
  let hasMatch = false;

  searchTerms.forEach((term) => {
    const regex = new RegExp(`(${escapeRegex(term)})`, "gi");
    if (regex.test(text)) {
      hasMatch = true;
      highlightedText = highlightedText.replace(regex, "<mark>$1</mark>");
    }
  });

  if (!hasMatch) return null;

  // Truncate if needed
  if (maxLength && highlightedText.length > maxLength) {
    const firstMatch = highlightedText.indexOf("<mark>");
    const start = Math.max(0, firstMatch - 50);
    const end = Math.min(highlightedText.length, start + maxLength);

    highlightedText = "..." + highlightedText.slice(start, end) + "...";
  }

  return highlightedText;
};

const escapeRegex = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
```

---

## 🚀 **Fuzzy Search Implementation**

### **Fuzzy Search with Levenshtein Distance**

```typescript
export const fuzzySearch = async (
  query: string,
  collection: string,
  fields: string[],
  threshold: number = 2
): Promise<any[]> => {
  try {
    // First try exact text search
    const exactResults = await performTextSearch(query, collection);

    if (exactResults.length > 0) {
      return exactResults;
    }

    // If no exact matches, try fuzzy search
    const Model = getModelByCollection(collection);
    const allDocuments = await Model.find({}).limit(1000); // Limit for performance

    const fuzzyResults: Array<{ document: any; distance: number }> = [];

    allDocuments.forEach((doc) => {
      fields.forEach((field) => {
        if (doc[field]) {
          const distance = levenshteinDistance(
            query.toLowerCase(),
            doc[field].toLowerCase()
          );
          if (distance <= threshold) {
            fuzzyResults.push({ document: doc, distance });
          }
        }
      });
    });

    // Sort by distance (lower is better)
    fuzzyResults.sort((a, b) => a.distance - b.distance);

    // Remove duplicates and return documents
    const uniqueResults = new Map();
    fuzzyResults.forEach((result) => {
      const id = result.document._id.toString();
      if (
        !uniqueResults.has(id) ||
        uniqueResults.get(id).distance > result.distance
      ) {
        uniqueResults.set(id, result);
      }
    });

    return Array.from(uniqueResults.values()).map((result) => result.document);
  } catch (error) {
    logger.error("Error in fuzzy search", error);
    return [];
  }
};

const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
};
```

---

## 📱 **Frontend Integration Examples**

### **React Search Component**

```jsx
import { useState, useEffect, useMemo } from "react";
import { debounce } from "lodash";

const SearchComponent = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("global");

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery) => {
        if (searchQuery.length < 2) {
          setResults(null);
          return;
        }

        setLoading(true);
        try {
          const response = await fetch(
            `/api/search/${searchType}?q=${encodeURIComponent(
              searchQuery
            )}&limit=20`
          );
          const data = await response.json();

          if (data.success) {
            setResults(data.data);
          }
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      }, 300),
    [searchType]
  );

  // Get suggestions
  const debouncedSuggestions = useMemo(
    () =>
      debounce(async (searchQuery) => {
        if (searchQuery.length < 2) {
          setSuggestions([]);
          return;
        }

        try {
          const response = await fetch(
            `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`
          );
          const data = await response.json();

          if (data.success) {
            setSuggestions(data.data.suggestions);
          }
        } catch (error) {
          console.error("Suggestions error:", error);
        }
      }, 200),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
    debouncedSuggestions(query);
  }, [query, debouncedSearch, debouncedSuggestions]);

  return (
    <div className="search-container">
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, posts, stories..."
          className="search-input"
        />

        {/* Search Type Tabs */}
        <div className="search-tabs">
          {["global", "users", "posts", "stories", "polls"].map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`tab ${searchType === type ? "active" : ""}`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && query.length > 1 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => setQuery(suggestion.text)}>
                {suggestion.type === "user" && (
                  <>
                    <img
                      src={suggestion.profileImage}
                      alt=""
                      className="suggestion-avatar"
                    />
                    <span>
                      {suggestion.displayName} (@{suggestion.text})
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && <div className="search-loading">Searching...</div>}

      {/* Search Results */}
      {results && (
        <div className="search-results">
          {searchType === "global" ? (
            <GlobalSearchResults results={results} />
          ) : (
            <SearchResults results={results.results} type={searchType} />
          )}
        </div>
      )}
    </div>
  );
};
```

---

## 🔧 **Search Controllers**

### **Main Search Controller**

```typescript
export const searchController = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const {
      q: query,
      limit = "20",
      offset = "0",
      sortBy = "relevance",
      fuzzy = "false",
      ...filters
    } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchOptions = {
      query,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      sortBy: sortBy as "relevance" | "recent" | "popular",
      fuzzy: fuzzy === "true",
      filters,
    };

    let results;
    const { userId } = req.auth();

    // Save search history
    if (userId) {
      await saveSearchHistory(userId, query, type, 0); // Will update count after search
    }

    switch (type) {
      case "users":
        results = await searchUsers(searchOptions);
        break;
      case "posts":
        results = await searchPosts(searchOptions);
        break;
      case "stories":
        results = await searchStories(searchOptions);
        break;
      case "polls":
        results = await searchPolls(searchOptions);
        break;
      case "global":
        results = await globalSearch(query, parseInt(limit as string), userId);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid search type",
        });
    }

    return res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error(`Search error for type ${req.params.type}`, error);
    return res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
};
```

---

## 📊 **Performance Optimization**

### **Search Caching Strategy**

```typescript
import NodeCache from "node-cache";

const searchCache = new NodeCache({
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every minute
});

export const getCachedSearchResults = async (
  cacheKey: string,
  searchFunction: () => Promise<any>
) => {
  // Check cache first
  const cached = searchCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Execute search
  const results = await searchFunction();

  // Cache results
  searchCache.set(cacheKey, results);

  return results;
};

// Generate cache key
export const generateSearchCacheKey = (
  type: string,
  query: string,
  options: any
): string => {
  const optionsString = JSON.stringify(options);
  return `search:${type}:${query}:${Buffer.from(optionsString).toString(
    "base64"
  )}`;
};
```

### **Search Performance Monitoring**

```typescript
export const monitorSearchPerformance = async (
  searchType: string,
  query: string,
  executionTime: number
) => {
  await SearchPerformance.create({
    searchType,
    query,
    executionTime,
    timestamp: new Date(),
  });

  // Alert on slow searches
  if (executionTime > 1000) {
    // Over 1 second
    logger.warn(
      `Slow search detected: ${searchType} - "${query}" took ${executionTime}ms`
    );
  }
};
```

---

## 📝 **Best Practices**

### **Search Optimization**

1. **Use appropriate indexes** for all searchable fields
2. **Implement caching** for popular queries
3. **Use aggregation pipelines** for complex searches
4. **Limit result sets** to prevent performance issues
5. **Monitor search performance** and optimize slow queries

### **User Experience**

1. **Provide instant suggestions** while typing
2. **Show search history** for returning users
3. **Highlight matching terms** in results
4. **Support fuzzy search** for typo tolerance
5. **Implement infinite scroll** for large result sets

### **Analytics & Insights**

1. **Track search queries** for content insights
2. **Monitor search success rates** (queries with results)
3. **Identify trending topics** from search data
4. **Use search data** to improve content recommendations
5. **A/B test search algorithms** for better relevance

---

This comprehensive search system provides fast, accurate, and user-friendly search functionality with advanced features like fuzzy matching, analytics, and intelligent suggestions, ensuring users can quickly find the content they're looking for across the entire Quad platform.
