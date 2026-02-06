# Uploads Pipeline (Cloudinary)

This document describes how file uploads currently work in the backend.

## API routes

Routes are defined in:

- `backend/src/routes/upload.routes.ts`

Mounted under `/api/upload` in `backend/src/routes/index.ts`.

Endpoints:

- `POST /api/upload/post`
- `POST /api/upload/story`
- `POST /api/upload/poll`
- `POST /api/upload/profile`
- `POST /api/upload/cover`
- `DELETE /api/upload` (delete by URL)

## Middleware

- Auth: `requireApiAuth` (`backend/src/middlewares/auth.middleware.ts`)
- Upload parsing: `uploadSingle` (`backend/src/middlewares/multer.middleware.ts`)
- Rate limiting: applied at router mount via `uploadRateLimiter` (`backend/src/routes/index.ts`)

## Controller

- `backend/src/controllers/upload.controller.ts`

Common behavior:

1. Check `req.file` exists
2. Read file metadata:
   - `buffer`, `mimetype`, `size`
3. Determine preset (image/video, domain-specific)
4. Get validation rules via `getValidationRules(preset)`
5. Validate:
   - file type (`validateFileType`)
   - file size (`validateFileSize`)
6. Upload to Cloudinary:
   - `uploadToCloudinary(buffer, preset)`
7. Return JSON response with:
   - `success`
   - `message`
   - `data` including Cloudinary result + `aspectRatio`

Utilities used:

- `backend/src/utils/upload.util.ts`

## Presets / constraints

Constraints are domain-specific:

- Post: image or video
- Story: image or video
- Poll: image only
- Profile: image only
- Cover: image only

Aspect ratio is validated on inputs:

- Allowed: `1:1`, `16:9`, `9:16`

## Persistence side effects

### Profile image

After upload, the backend attempts to:

- Update the current user’s `User` document (`profileImage` field)
- Update Clerk user profile image via `clerkClient.users.updateUser(...)`

### Cover image

After upload, the backend attempts to:

- Update the current user’s `User` document (`coverImage` field)

## Deleting uploads

- `DELETE /api/upload`
  - Body: `{ url: string }`

Behavior:

- Extracts Cloudinary `publicId` from the URL.
- Detects `resourceType` from the URL (`/video/` => video, else image).
- Calls `deleteFromCloudinary(publicId, resourceType)`.

## Notes

- Chat media uploads are explicitly disabled (`uploadChatMedia` returns HTTP 410) in the controller.

## Related docs

- Shared env vars: `docs/ENVIRONMENT_VARIABLES.md`
- Backend deployment: `backend/docs/deployment/README.md`
