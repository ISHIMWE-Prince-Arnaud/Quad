# API Documentation

Complete REST API documentation for Quad social media platform.

## 🌐 Base URL

```
Development: http://localhost:4000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

All endpoints (except webhooks) require Clerk authentication via JWT token in the Authorization header:

```bash
Authorization: Bearer <jwt_token>
```

## 📝 API Endpoints

### Users & Authentication

- **[Users](./users.md)** - User CRUD (Clerk identity)
- **[Profile](./profile.md)** - Public profile + user content
- **[Follow](./follow.md)** - Following/followers management

### Content Creation

- **[Posts](./posts.md)** - Text posts with media
- **[Stories](./stories.md)** - Long-form content
- **[Polls](./polls.md)** - Interactive polls with voting

### Social Features

- **[Comments](./comments.md)** - Comment on content
- **[Reactions](./reactions.md)** - Like/react to content
- **[Feed](./feed.md)** - Following and For You feeds
- **[Bookmarks](./bookmarks.md)** - Save/unsave content
- **[Notifications](./notifications.md)** - Notifications

### Communication

- **[Chat](./chat.md)** - Real-time messaging

### Media & Utilities

- **[Upload](./upload.md)** - File upload management
- **[Webhooks](./webhooks.md)** - Clerk webhook handlers

## 📋 Standard Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 🔍 Common Query Parameters

### Pagination

```bash
?limit=20&offset=0
```

### Sorting

```bash
?sortBy=newest|oldest|popular|relevance
```

### Filtering

```bash
?dateFrom=2023-01-01&dateTo=2023-12-31
```

## 📊 HTTP Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid auth)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Internal Server Error

## 🚀 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Standard endpoints**: 100 requests per 15 minutes
- **Upload endpoints**: 20 requests per 15 minutes

## 📱 Real-time Events

Socket.IO events for real-time features:

### Chat Events

- `chat:message:new` - New message received
- `chat:message:edited` - Message edited
- `chat:message:deleted` - Message deleted
- `chat:typing:start` - User started typing
- `chat:typing:stop` - User stopped typing

### Notification Events

- `notification:new` - New notification
- `notification:read` - Notification marked as read

### Feed Events

- `feed:new-content` - New content (post/poll) created
- `feed:engagement-update` - Engagement counters changed
- `feed:content-deleted` - Post/poll deleted

## 🔧 Development Tools

### Testing with cURL

```bash
curl -X GET "http://localhost:4000/api/posts" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json"
```

### Testing with Postman

Import the Postman collection from `/docs/postman/` for easy API testing.

## 📚 Additional Resources

- [Authentication Setup](../auth/README.md)
- [Database Schema](../database/README.md)
- [Real-time Implementation](../realtime/README.md)
