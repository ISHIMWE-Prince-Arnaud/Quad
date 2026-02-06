# Uploads (Internal Flow)

## Entry points

- Route: `backend/src/routes/upload.routes.ts`
- Controller: `backend/src/controllers/upload.controller.ts`
- Middleware:
  - `uploadSingle` (multer) in `backend/src/middlewares/multer.middleware.ts`
- Utilities:
  - `backend/src/utils/upload.util.ts`

## General flow (all upload endpoints)

- `requireApiAuth` ensures authenticated.
- `uploadSingle` parses `multipart/form-data` and attaches `req.file`.
- Controller:
  - validates `req.file`
  - validates file type + size based on preset
  - uploads to Cloudinary
  - returns `data` with `url` and metadata

## Post/story/poll media uploads

- Accept images and/or videos depending on endpoint.
- Validates `aspectRatio` where provided.

## Profile/cover uploads

- Image only.
- After upload:
  - persists URL to Mongo User document.
  - profile image also attempts to sync avatar to Clerk.

## Delete upload

- Accepts `{ url }`.
- Derives `publicId` and `resourceType`.
- Calls Cloudinary deletion helper.

## Related docs

- Upload pipeline deep dive: `backend/docs/UPLOADS_PIPELINE.md`
