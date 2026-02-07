# Uploads (Internal Flow)

## Entry points

- Route: `backend/src/routes/upload.routes.ts`
- Controller: `backend/src/controllers/upload.controller.ts`
- Middleware:
  - `uploadSingle` (multer) in `backend/src/middlewares/multer.middleware.ts`
- Utilities:
  - `backend/src/utils/upload.util.ts`

## Data model + invariants

- Uploads do not have a dedicated Mongo model; the authoritative record is the returned Cloudinary `url`.
- Some upload endpoints also persist URLs onto the `User` model:
  - `profileImage`
  - `coverImage`

## Upload presets + validation

Validation rules are centralized in `getValidationRules(preset)`:

- `POST_IMAGE`: max 10MB, image mimetypes
- `POST_VIDEO`: max 1GB, video mimetypes
- `STORY_IMAGE`: max 10MB
- `STORY_VIDEO`: max 1GB
- `POLL_IMAGE`: max 10MB (polls are image-only)
- `PROFILE`: max 10MB (image-only)
- `COVER`: max 10MB (image-only)

Cloudinary upload behavior:

- Images use `upload_stream`
- Videos use `upload_chunked_stream` with `chunk_size: 10_000_000`
- Upload results include:
  - `url`, `publicId`, `format`, `width`, `height`, `size`, `resourceType`
  - `thumbnail?` for videos

## General flow (all upload endpoints)

- `requireApiAuth` ensures authenticated.
- `uploadSingle` parses `multipart/form-data` and attaches `req.file`.
- Controller:
  - validates `req.file`
  - validates file type + size based on preset
  - uploads to Cloudinary
  - returns `data` with `url` and metadata

Failure modes (common):

- `401 Unauthorized`: missing auth.
- `400 No file uploaded`
- `400 Invalid file type` / `400 File too large`
- `500 Failed to upload ...` (Cloudinary or unexpected errors)

## Post/story/poll media uploads

- Accept images and/or videos depending on endpoint.
- Validates `aspectRatio` where provided.

Endpoint specifics:

- `POST /api/upload/post`
  - `aspectRatio` default `1:1`
  - allows images and videos
- `POST /api/upload/story`
  - `aspectRatio` default `9:16`
  - allows images and videos
- `POST /api/upload/poll`
  - `aspectRatio` default `1:1`
  - rejects `video/*` explicitly (image-only)

## Profile/cover uploads

- Image only.
- After upload:
  - persists URL to Mongo User document.
  - profile image also attempts to sync avatar to Clerk.

Persistence side effects:

- `POST /api/upload/profile`
  - Best-effort `User.findOneAndUpdate({ clerkId }, { profileImage: result.url })`
  - Best-effort Clerk `updateUser({ imageUrl })`
- `POST /api/upload/cover`
  - Best-effort `User.findOneAndUpdate({ clerkId }, { coverImage: result.url })`

## Delete upload

- Accepts `{ url }`.
- Derives `publicId` and `resourceType`.
- Calls Cloudinary deletion helper.

Delete behavior:

- If deletion returns `success: true`, endpoint returns `200`.
- If URL is invalid or deletion fails, endpoint returns `400`.

## Related docs

- Upload pipeline deep dive: `backend/docs/UPLOADS_PIPELINE.md`
