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

## Data model + invariants

Model: `backend/src/models/Post.model.ts`

- `userId` is the author's Clerk id (stored redundantly for efficient queries).
- `author` is an embedded snapshot (username, profile image, etc.). It is **not** automatically kept in sync unless snapshot propagation is implemented elsewhere.
- `media[]` is required at creation time and must remain non-empty.
- `reactionsCount` and `commentsCount` are cached counters (updated indirectly by the Reactions and Comments domains).
- Indexes exist for:
  - `createdAt` sorting
  - author queries (`userId`)
  - feed/trending sorts (`createdAt`, `reactionsCount`, `commentsCount`)

## Create post: `POST /api/posts`

### Route

- `router.post("/", requireApiAuth, validateSchema(createPostSchema), createPost)`

### Request contract (validated by `createPostSchema`)

- Body (JSON):
  - `text?`: string, max 1000
  - `media`: array (min 1)
    - `url`: valid URL
    - `type`: `"image" | "video"`
    - `aspectRatio?`: `"1:1" | "16:9" | "9:16"`
- Notes:
  - `author` is not accepted from clients (set server-side).

### Response contract

- `201`:
  - `{ success: true, data: PostDocument }`
  - The service currently returns the created Mongoose document (not a mapped DTO).

### Controller (`createPost`)

- Reads `userId` from `req.auth?.userId`.
- Casts body to `CreatePostSchemaType`.
- Calls `PostService.createPost(userId, { text?, media })`.
- Normalizes media via `PostMapper.normalizeMedia(...)`.

### Service (`PostService.createPost`)

- Loads author `User` via `User.findOne({ clerkId: userId })`.
- Validates `media` is non-empty.
- Sanitizes `text` via `sanitizePostText` (HTML stripped; tags not allowed).
- Creates a `Post` document with embedded author snapshot.

### Side effects

Realtime emits:

- `io.emit("newPost", newPost)` (legacy)
- `emitNewContent(io, "post", newPostId, author.clerkId)` → `feed:new-content`

Mentions:

- Extracts mentions from post text and creates notifications:
  - `type: "mention_post"`
  - `createNotification(...)` emits `notification:new` and `notification:unread_count`.

### Failure modes

- `401 Unauthorized`:
  - Missing `req.auth.userId`.
- `404 User not found`:
  - The authenticated Clerk user has no `User` record yet.
- `400 Validation error`:
  - `media` missing/empty or invalid `url/type/aspectRatio`.
- `400 Post must have at least one media`:
  - Enforced defensively in the service even though schema already requires `media`.

## Get all posts: `GET /api/posts`

### Controller (`getAllPosts`)

- Validates query using `getPostsQuerySchema.safeParse(req.query)`.
- Calls `PostService.getAllPosts(limit, skip)`.

### Request contract

- Query:
  - `limit`: number (coerced), min 1, max 50, default 20
  - `skip`: number (coerced), min 0, default 0

### Response contract

- `200`:
  - `{ success: true, data: PostDocument[], pagination: { total, limit, skip, hasMore } }`

### Service (`getAllPosts`)

- Queries `Post.find()` sorted by `createdAt desc` with pagination.

## Get post: `GET /api/posts/:id`

- Route validates `params.id` via `postIdSchema`.
- Service loads `Post.findById` or throws `AppError(404)`.

## Update post: `PUT /api/posts/:id`

### Controller

- Validates `id` and reads `userId`.
- Calls `PostService.updatePost(userId, id, updates)`.

### Request contract (validated by `updatePostSchema`)

- Body (JSON):
  - `text?`: string, max 1000
  - `media?`: array (min 1)
- Notes:
  - If `media` is provided, it cannot be empty.
  - If `media` is omitted, existing media remains.

### Response contract

- `200`:
  - `{ success: true, data: PostDocument }`

### Service

- Loads the post.
- Enforces author-only update (`post.author.clerkId === userId`).
- Validates media non-empty.
- Sanitizes text.
- Updates in Mongo.

### Side effects

- `io.emit("updatePost", updatedPost)` (legacy)
- Mention processing is repeated after update.

### Failure modes

- `401 Unauthorized`: missing auth.
- `403 Unauthorized`: user is not the author.
- `404 Post not found`.
- `400 Validation error`:
  - invalid body fields
  - `media` provided as `[]`.

## Delete post: `DELETE /api/posts/:id`

### Service

- Loads the post and checks author.
- Deletes from Mongo.

### Side effects

- `io.emit("deletePost", id)` (legacy)
- `emitContentDeleted(io, "post", id)` → `feed:content-deleted`

### Failure modes

- `401 Unauthorized`: missing auth.
- `403 Unauthorized`: user is not the author.
- `404 Post not found`.

## Related docs

- Realtime spec: `backend/docs/REALTIME_SPEC.md`
- Notifications: `backend/docs/domains/notifications.md`
- API reference: `backend/docs/api/posts.md`
