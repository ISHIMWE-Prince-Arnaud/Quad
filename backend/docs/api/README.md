# Backend API Documentation

Complete REST API reference for the Quad backend.

## Base URL

```
Development: http://localhost:4000/api
Production:  https://<your-domain>/api
```

## Interactive Docs (Swagger UI)

Swagger/OpenAPI UI is available in development at:
```
http://localhost:4000/api-docs
```

## Authentication

Most endpoints require a Clerk session JWT in the `Authorization` header:

```
Authorization: Bearer <clerk_jwt_token>
```

Obtain the token via the Clerk frontend SDK (`getToken()` on the active session). The backend validates it using `clerkMiddleware()` (see [`server.ts`](../../src/server.ts)).

**Public endpoints (no auth required):**
- `GET /health` and sub-routes
- `GET /api/users/check/:username`
- `GET /api/users/check-email/:email`
- `POST /api/webhooks/clerk` (verified via Svix signature instead)

---

## Endpoint Index

### Users & Authentication

| Domain      | File                         | Description                          |
|-------------|------------------------------|--------------------------------------|
| Users       | [users.md](./users.md)       | User CRUD mapped to Clerk identity   |
| Profile     | [profile.md](./profile.md)   | Public profile + user content lists  |
| Follow      | [follow.md](./follow.md)     | Follow/unfollow + lists              |

### Content Creation

| Domain    | File                         | Description                                |
|-----------|------------------------------|--------------------------------------------|
| Posts     | [posts.md](./posts.md)       | Text posts with optional media             |
| Stories   | [stories.md](./stories.md)   | Long-form stories (draft + published)      |
| Polls     | [polls.md](./polls.md)       | Interactive polls with auto-expiration     |

### Social Features

| Domain        | File                               | Description                          |
|---------------|------------------------------------|--------------------------------------|
| Comments      | [comments.md](./comments.md)       | Comments + threading + likes         |
| Reactions     | [reactions.md](./reactions.md)     | React to content                     |
| Feed          | [feed.md](./feed.md)               | Following and For You feeds          |
| Bookmarks     | [bookmarks.md](./bookmarks.md)     | Save/remove content                  |
| Notifications | [notifications.md](./notifications.md) | Notification management          |

### Communication & Media

| Domain    | File                         | Description                              |
|-----------|------------------------------|------------------------------------------|
| Chat      | [chat.md](./chat.md)         | Global real-time messaging               |
| Upload    | [upload.md](./upload.md)     | Cloudinary media upload management       |
| Webhooks  | [webhooks.md](./webhooks.md) | Clerk user lifecycle webhooks            |

---

## Standard Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

---

## Pagination

Quad uses **cursor-based pagination** for most list endpoints:

```
GET /api/notifications?limit=20&cursor=<lastItemId>
```

Some older endpoints (`/api/posts`, `/api/stories`) use **skip/offset pagination**:

```
GET /api/posts?limit=20&skip=0
```

The polls endpoint (`/api/polls`) uses **page-based pagination**:

```
GET /api/polls?page=1&limit=20
```

---

## Rate Limiting

Rate limiters are applied at the router level:

| Limiter           | Applied To                              | Default Limits        |
|-------------------|-----------------------------------------|-----------------------|
| `generalRateLimiter` | All `/api/*` routes               | Configurable via env  |
| `writeRateLimiter`   | POST/PUT/DELETE for posts, stories, polls, chat, follow, reactions, comments, bookmarks | Configurable via env |
| `uploadRateLimiter`  | `/api/upload/*` routes            | 20 req / 15 min       |
| `authRateLimiter`    | `POST /api/users` only            | 10 req / 15 min       |

In development, the general rate limiter is set to a very high limit (1,000,000 req) to avoid blocking local testing.

See [Rate Limiting](../RATE_LIMITING.md) for configuration details.

---

## HTTP Status Codes

| Code | Meaning                        |
|------|--------------------------------|
| 200  | OK                             |
| 201  | Created                        |
| 400  | Bad Request / Validation error |
| 401  | Unauthenticated                |
| 403  | Forbidden                      |
| 404  | Not Found                      |
| 409  | Conflict                       |
| 429  | Rate limit exceeded            |
| 500  | Internal Server Error          |

---

## Real-time Events Summary

Socket.IO events are emitted globally or to user rooms. See [Realtime Spec](../REALTIME_SPEC.md) for full details.

| Category     | Key Events                                                    |
|--------------|---------------------------------------------------------------|
| Feed         | `newPost`, `updatePost`, `deletePost`, `newPoll`, `pollUpdated`, `pollDeleted`, `feed:engagement-update`, `feed:content-deleted` |
| Chat         | `chat:message:new`, `chat:message:edited`, `chat:message:deleted`, `chat:typing:start`, `chat:typing:stop` |
| Notifications| `notification:new`, `notification:read`, `notification:read_all`, `notification:deleted`, `notification:clear_read`, `notification:unread_count` |
| Stories      | `newStory`, `storyUpdated`, `storyDeleted`                   |
| Social       | `commentAdded`, `commentUpdated`, `commentDeleted`, `commentLikeAdded`, `commentLikeRemoved`, `reactionAdded`, `reactionUpdated`, `reactionRemoved`, `follow:new`, `follow:removed` |
