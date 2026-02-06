# Posts (Internal Flow)

## Entry points

- Route: `backend/src/routes/post.routes.ts`
- Controller: `backend/src/controllers/post.controller.ts`
- Service: `backend/src/services/post.service.ts`
- Model: `backend/src/models/Post.model.ts`
- Schema: `backend/src/schemas/post.schema.ts`

## Middleware chain

At mount time:

- `/api/posts` is mounted with `writeRateLimiter` in `backend/src/routes/index.ts`.

At route time:

- `requireApiAuth` ensures `req.auth?.userId` is present.
- `validateSchema(...)` validates `body`, `params`, or `query` depending on route.

## Create post: `POST /api/posts`

### Route

- `router.post("/", requireApiAuth, validateSchema(createPostSchema), createPost)`

### Controller (`createPost`)

- Reads `userId` from `req.auth?.userId`.
- Casts body to `CreatePostSchemaType`.
- Calls `PostService.createPost(userId, { text?, media })`.
- Normalizes media via `PostMapper.normalizeMedia(...)`.

### Service (`PostService.createPost`)

- Loads author `User` via `User.findOne({ clerkId: userId })`.
- Validates `media` is non-empty.
- Sanitizes `text` via `sanitizePostText`.
- Creates a `Post` document with embedded author snapshot.

### Side effects

Realtime emits:

- `io.emit("newPost", newPost)` (legacy)
- `emitNewContent(io, "post", newPostId, author.clerkId)` → `feed:new-content`

Mentions:

- Extracts mentions from post text and creates notifications:
  - `type: "mention_post"`
  - `createNotification(...)` emits `notification:new` and `notification:unread_count`.

## Get all posts: `GET /api/posts`

### Controller (`getAllPosts`)

- Validates query using `getPostsQuerySchema.safeParse(req.query)`.
- Calls `PostService.getAllPosts(limit, skip)`.

### Service (`getAllPosts`)

- Queries `Post.find()` sorted by `createdAt desc` with pagination.

## Get post: `GET /api/posts/:id`

- Controller validates id exists.
- Service loads `Post.findById` or throws `AppError(404)`.

## Update post: `PUT /api/posts/:id`

### Controller

- Validates `id` and reads `userId`.
- Calls `PostService.updatePost(userId, id, updates)`.

### Service

- Loads the post.
- Enforces author-only update (`post.author.clerkId === userId`).
- Validates media non-empty.
- Sanitizes text.
- Updates in Mongo.

### Side effects

- `io.emit("updatePost", updatedPost)` (legacy)
- Mention processing is repeated after update.

## Delete post: `DELETE /api/posts/:id`

### Service

- Loads the post and checks author.
- Deletes from Mongo.

### Side effects

- `io.emit("deletePost", id)` (legacy)
- `emitContentDeleted(io, "post", id)` → `feed:content-deleted`

## Related docs

- Realtime spec: `backend/docs/REALTIME_SPEC.md`
- Notifications: `backend/docs/domains/notifications.md`
- API reference: `backend/docs/api/posts.md`
