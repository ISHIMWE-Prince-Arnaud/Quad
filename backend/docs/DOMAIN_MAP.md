# Backend Domain Map (Routes → Controllers → Services → Models)

This document maps backend domains to their main implementation files.

> This is a high-level map to help you navigate the code. For full endpoint details, see `backend/docs/api/README.md`.

## Common structure

- **Routes**: `backend/src/routes/*.routes.ts`
- **Controllers**: `backend/src/controllers/*.controller.ts`
- **Services**: `backend/src/services/*.service.ts`
- **Models**: `backend/src/models/*.model.ts`
- **Schemas (Zod)**: `backend/src/schemas/*.schema.ts`

## Domains

### Users

- Route: `src/routes/user.routes.ts`
- Controller: `src/controllers/user.controller.ts`
- Model: `src/models/User.model.ts`
- Schema: `src/schemas/user.schema.ts`

### Profile

- Route: `src/routes/profile.routes.ts`
- Controller: `src/controllers/profile.controller.ts`
- Service: `src/services/profile.service.ts`
- Model: `src/models/User.model.ts` (and other content models via queries)
- Schema: `src/schemas/profile.schema.ts`

### Posts

- Route: `src/routes/post.routes.ts`
- Controller: `src/controllers/post.controller.ts`
- Service: `src/services/post.service.ts`
- Model: `src/models/Post.model.ts`
- Schema: `src/schemas/post.schema.ts`

### Stories

- Route: `src/routes/story.routes.ts`
- Controller: `src/controllers/story.controller.ts`
- Service: `src/services/story.service.ts`
- Model: `src/models/Story.model.ts`
- Schema: `src/schemas/story.schema.ts`

### Polls

- Route: `src/routes/poll.routes.ts`
- Controller: `src/controllers/poll.controller.ts`
- Service: `src/services/poll.service.ts`
- Models:
  - `src/models/Poll.model.ts`
  - `src/models/PollVote.model.ts`
- Schema: `src/schemas/poll.schema.ts`

### Feed

- Route: `src/routes/feed.routes.ts`
- Controller: `src/controllers/feed.controller.ts`
- Service: `src/services/feed.service.ts` (and `src/services/feed/*`)
- Types: `src/types/feed.types.ts`
- Schema: `src/schemas/feed.schema.ts`

### Follow

- Route: `src/routes/follow.routes.ts`
- Controller: `src/controllers/follow.controller.ts`
- Service: `src/services/follow.service.ts`
- Model: `src/models/Follow.model.ts`
- Schema: `src/schemas/follow.schema.ts`

### Notifications

- Route: `src/routes/notification.routes.ts`
- Controller: `src/controllers/notification.controller.ts`
- Service: `src/services/notification.service.ts`
- Model: `src/models/Notification.model.ts`
- Schema: `src/schemas/notification.schema.ts`

### Reactions

- Route: `src/routes/reaction.routes.ts`
- Controller: `src/controllers/reaction.controller.ts`
- Service: `src/services/reaction.service.ts`
- Model: `src/models/Reaction.model.ts`
- Schema: `src/schemas/reaction.schema.ts`

### Comments

- Route: `src/routes/comment.routes.ts`
- Controller: `src/controllers/comment.controller.ts`
- Service: `src/services/comment.service.ts`
- Models:
  - `src/models/Comment.model.ts`
  - `src/models/CommentLike.model.ts`
- Schema: `src/schemas/comment.schema.ts`

### Bookmarks

- Route: `src/routes/bookmark.routes.ts`
- Controller: `src/controllers/bookmark.controller.ts`
- Model: `src/models/Bookmark.model.ts`
- Schema: `src/schemas/bookmark.schema.ts`

### Chat

- Route: `src/routes/chat.routes.ts`
- Controller: `src/controllers/chat.controller.ts`
- Service: `src/services/chat.service.ts`
- Model: `src/models/ChatMessage.model.ts`
- Schema: `src/schemas/chat.schema.ts`

### Upload

- Route: `src/routes/upload.routes.ts`
- Controller: `src/controllers/upload.controller.ts`
- Middleware:
  - `src/middlewares/multer.middleware.ts`

### Health

- Route: `src/routes/health.routes.ts`
- Controller: `src/controllers/health.controller.ts`

### Webhooks

- Route: `src/routes/webhook.routes.ts`

## Cross-cutting utilities

- Validation helper: `src/utils/validation.util.ts`
- Async handler wrapper: `src/utils/asyncHandler.util.ts`
- Domain errors: `src/utils/appError.util.ts`
- Logging: `src/utils/logger.util.ts`
- Error tracking: `src/utils/errorTracking.util.ts`
