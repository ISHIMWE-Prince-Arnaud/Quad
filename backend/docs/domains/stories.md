# Stories (Internal Flow)

## Entry points

- Route: `backend/src/routes/story.routes.ts`
- Controller: `backend/src/controllers/story.controller.ts`
- Service: `backend/src/services/story.service.ts`
- Model: `backend/src/models/Story.model.ts`
- Schema: `backend/src/schemas/story.schema.ts`

## Create story: `POST /api/stories`

Service:

- Loads author `User`.
- Sanitizes and validates HTML content.
- Computes read time + excerpt.
- Creates `Story` with `status` defaulting to `draft`.

Side effects:

- Only when `status=published`:
  - emits legacy `newStory`
  - processes mentions in HTML content and creates `mention_story` notifications.

## List stories: `GET /api/stories`

- Only returns `status=published`.
- Sorted by `publishedAt` then `createdAt`.

## Get story: `GET /api/stories/:id`

- If story is draft, only author may view.

## Update story: `PUT /api/stories/:id`

- Author-only.
- Sanitizes content if provided.

Publish transitions:

- If transitioning draft → published:
  - emits `newStory`
  - processes mentions and notifies
- If already published and still published:
  - emits `storyUpdated`

## Delete story: `DELETE /api/stories/:id`

- Author-only.
- If published:
  - emits `storyDeleted`

## My stories: `GET /api/stories/me`

- Lists drafts/published for current user.
- Optional `status` filter.

## Related docs

- Notifications: `backend/docs/domains/notifications.md`
- Realtime spec: `backend/docs/REALTIME_SPEC.md`
