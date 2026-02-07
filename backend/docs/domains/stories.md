# Stories (Internal Flow)

## Entry points

- Route: `backend/src/routes/story.routes.ts`
- Controller: `backend/src/controllers/story.controller.ts`
- Service: `backend/src/services/story.service.ts`
- Model: `backend/src/models/Story.model.ts`
- Schema: `backend/src/schemas/story.schema.ts`

## Data model + invariants

Model: `backend/src/models/Story.model.ts`

- `userId` is the author's Clerk id.
- `author` is an embedded snapshot.
- `status`: `draft | published`.
- Cached counters:
  - `reactionsCount`
  - `commentsCount`
- `publishedAt`:
  - auto-set by a `pre("save")` hook when first published
  - cleared if reverted to draft

Content safety:

- Story content is stored as HTML and is sanitized via `sanitizeHtmlContent`.
- Server rejects stories whose sanitized content is empty via `validateHtmlContent`.

## Create story: `POST /api/stories`

Service:

- Loads author `User`.
- Sanitizes and validates HTML content.
- Computes read time + excerpt.
- Creates `Story` with `status` defaulting to `draft`.

Request contract (validated by `createStorySchema`):

- Body:
  - `title`: 1-200 chars
  - `content`: non-empty string (HTML)
  - `coverImage?`: URL
  - `status?`: `draft | published` (default draft)
  - `tags?`: string[], max 10 (normalized to lowercase)

Response contract:

- `201`:
  - `{ success: true, message: "Draft saved" | "Story published", data: StoryDocument }`

Side effects:

- Only when `status=published`:
  - emits legacy `newStory`
  - processes mentions in HTML content and creates `mention_story` notifications.

Failure modes:

- `401 Unauthorized`: missing auth.
- `404 User not found`.
- `400 Invalid or empty HTML content`.

## List stories: `GET /api/stories`

- Only returns `status=published`.
- Sorted by `publishedAt` then `createdAt`.

Request contract (validated by `getStoriesQuerySchema`):

- Query:
  - `limit`: string -> number, default 20, must be 1-100
  - `skip`: string -> number, default 0

Response contract:

- `200`:
  - `{ success: true, data: StoryDocument[], pagination }`

## Get story: `GET /api/stories/:id`

- If story is draft, only author may view.

Failure modes:

- `401 Unauthorized`: missing auth.
- `404 Story not found`.
- `403 You don't have permission to view this draft`.

## Update story: `PUT /api/stories/:id`

- Author-only.
- Sanitizes content if provided.

Publish transitions:

- If transitioning draft → published:
  - emits `newStory`
  - processes mentions and notifies
- If already published and still published:
  - emits `storyUpdated`

Request contract (validated by `updateStorySchema`):

- Body:
  - `title?`
  - `content?`
  - `coverImage?`: URL | null
  - `status?`: `draft | published`
  - `tags?`: string[], max 10

Failure modes:

- `401 Unauthorized`: missing auth.
- `403 Only the author can update this story`.
- `404 Story not found`.
- `400 Invalid or empty HTML content`.

## Delete story: `DELETE /api/stories/:id`

- Author-only.
- If published:
  - emits `storyDeleted`

Failure modes:

- `401 Unauthorized`: missing auth.
- `403 Only the author can delete this story`.
- `404 Story not found`.

## My stories: `GET /api/stories/me`

- Lists drafts/published for current user.
- Optional `status` filter.

Notes:

- This endpoint is implemented in the controller by parsing query manually and delegating to `StoryService.getMyStories(...)`.

## Related docs

- Notifications: `backend/docs/domains/notifications.md`
- Realtime spec: `backend/docs/REALTIME_SPEC.md`
