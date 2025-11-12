# Search API Documentation

Advanced search system with filters, pagination, history, and analytics.

## 🔍 Core Search Endpoints

### Global Search
**GET** `/api/search/global`

Search across all content types (users, posts, polls, stories).

**Query Parameters:**
- `q` (required): Search query string
- `limit` (optional): Results per content type (default: 5, max: 20)
- `sortBy` (optional): `relevance` | `newest` | `oldest` | `popular` (default: relevance)
- `fuzzy` (optional): Enable typo tolerance (default: false)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "query": "react",
    "results": {
      "users": [...],
      "posts": [...],
      "polls": [...],
      "stories": [...]
    },
    "counts": {
      "users": 5,
      "posts": 12,
      "polls": 3,
      "stories": 8,
      "total": 28
    }
  }
}
```

### User Search
**GET** `/api/search/users`

Search for users by username, display name, or bio.

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Number of results (default: 20, max: 50)
- `offset` (optional): Results to skip (default: 0)
- `sortBy` (optional): `relevance` | `newest` | `oldest` | `popular`
- `fuzzy` (optional): Enable fuzzy search
- `dateFrom` (optional): Filter users created after date (ISO string)
- `dateTo` (optional): Filter users created before date (ISO string)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "query": "john",
    "results": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "username": "johndoe",
        "displayName": "John Doe",
        "profileImage": "https://avatar.iran.liara.run/public/42",
        "bio": "Software developer",
        "followersCount": 150,
        "followingCount": 89,
        "createdAt": "2023-12-01T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "totalPages": 5,
      "hasMore": true,
      "total": 87,
      "count": 20
    },
    "highlights": {
      "user123": ["johndoe profile", "Software developer"]
    }
  }
}
```

### Post Search
**GET** `/api/search/posts`

Search posts by content.

**Query Parameters:**
- `q` (required): Search query
- `limit`, `offset`, `sortBy`, `fuzzy`: Same as user search
- `author` (optional): Filter by author ID
- `dateFrom`, `dateTo`: Filter by post creation date

### Poll Search
**GET** `/api/search/polls`

Search polls by question and options.

**Query Parameters:**
- Same as post search
- Additional filtering for active/closed polls

### Story Search
**GET** `/api/search/stories`

Search stories by title, content, and tags.

**Query Parameters:**
- Same as post search
- Additional filtering by tags and publication status

## 📝 Search Suggestions
**GET** `/api/search/suggestions`

Get autocomplete suggestions for search queries.

**Query Parameters:**
- `q` (required): Partial query string
- `limit` (optional): Number of suggestions (default: 10, max: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "text": "javascript",
        "type": "content",
        "count": 45,
        "meta": {
          "contentType": "posts"
        }
      },
      {
        "text": "johndoe",
        "type": "user",
        "count": 1,
        "meta": {
          "profileImage": "https://avatar.iran.liara.run/public/42"
        }
      }
    ],
    "count": 2
  }
}
```

## 📚 Search History Endpoints

### Get Search History
**GET** `/api/search/history`

Get user's search history.

**Query Parameters:**
- `limit` (optional): Number of entries (default: 20, max: 100)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "query": "javascript tutorial",
        "searchType": "posts",
        "resultsCount": 45,
        "filters": {
          "sortBy": "newest",
          "fuzzy": false
        },
        "createdAt": "2023-12-01T10:30:00Z"
      }
    ],
    "count": 15
  }
}
```

### Delete Search History Item
**DELETE** `/api/search/history/:id`

Delete specific search from history.

### Clear All Search History
**DELETE** `/api/search/history`

Clear user's entire search history.

## 📊 Search Analytics Endpoints

### Popular Searches
**GET** `/api/search/analytics/popular`

Get most popular search queries.

**Query Parameters:**
- `searchType` (optional): Filter by content type
- `limit` (optional): Number of results (default: 10, max: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "popularSearches": [
      {
        "query": "javascript",
        "searchType": "posts",
        "searchCount": 156,
        "avgResultsCount": 23.4,
        "lastSearched": "2023-12-01T15:30:00Z"
      }
    ],
    "count": 10
  }
}
```

### Trending Searches
**GET** `/api/search/analytics/trending`

Get trending searches (last 7 days).

**Query Parameters:**
- Same as popular searches

## 🔧 Search Features

### Advanced Filtering
- **Date Ranges**: Filter content by creation/publication dates
- **Author Filtering**: Search content by specific users
- **Content Type**: Filter by posts, polls, stories, or all
- **Status Filtering**: Active polls, published stories only

### Fuzzy Search
- **Typo Tolerance**: Handles common spelling mistakes
- **Pattern Matching**: Uses regex for flexible matching
- **Configurable**: Enable/disable via `fuzzy=true` parameter

### Search Highlighting
- **Matched Terms**: Highlights found text in results
- **Context Awareness**: Shows relevant surrounding text
- **Multiple Matches**: Handles multiple occurrences

### Search History
- **Auto-Save**: Searches automatically saved
- **Deduplication**: Prevents duplicate recent searches
- **TTL Cleanup**: Auto-deletes after 90 days
- **Privacy**: User-specific history

### Search Analytics
- **Popular Queries**: Most searched terms overall
- **Trending Queries**: Popular in last 7 days
- **Performance Metrics**: Average results count
- **Usage Statistics**: Search frequency tracking

## ❌ Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Query parameter 'q' is required"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

## 💡 Usage Examples

### Basic search
```bash
curl -X GET "http://localhost:4000/api/search/posts?q=javascript&limit=10" \
  -H "Authorization: Bearer <jwt_token>"
```

### Advanced search with filters
```bash
curl -X GET "http://localhost:4000/api/search/posts?q=react&limit=20&sortBy=newest&fuzzy=true&dateFrom=2023-01-01" \
  -H "Authorization: Bearer <jwt_token>"
```

### Get search suggestions
```bash
curl -X GET "http://localhost:4000/api/search/suggestions?q=ja&limit=5" \
  -H "Authorization: Bearer <jwt_token>"
```
