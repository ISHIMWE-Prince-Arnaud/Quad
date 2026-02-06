# Frontend API Client

This document explains how the frontend talks to the backend REST API.

## Overview

The frontend uses Axios with a centralized configuration:

- Axios instance: `frontend/src/lib/api/apiInstance.ts`
- Endpoints map: `frontend/src/lib/api/endpoints.ts`
- Public re-export: `frontend/src/lib/api.ts`

## Base URL

The Axios `baseURL` is:

- `import.meta.env.VITE_API_BASE_URL`, or
- fallback: `http://localhost:4000/api`

This is configured in `frontend/src/lib/api/apiInstance.ts`.

## Interceptors

Interceptors are attached through:

- `attachInterceptors(api)` in `frontend/src/lib/api/apiInstance.ts`

Interceptors typically handle:

- Adding auth headers/tokens
- Normalizing errors
- Request/response logging

See `frontend/src/lib/api/interceptors/*` for details.

## Endpoints catalog

All REST calls should go through the `endpoints` object:

- `users.*`
- `profiles.*`
- `posts.*`
- `stories.*`
- `polls.*`
- `feed.*`
- `follow.*`
- `reactions.*`
- `comments.*`
- `bookmarks.*`
- `chat.*`
- `notifications.*`
- `upload.*`

This avoids scattering raw URL strings throughout the app.

## Services layer

Domain services wrap `endpoints` and return application-shaped responses.

Location: `frontend/src/services/*`

Examples:

- `FeedService` -> feed endpoints
- `ProfileService` -> profile endpoints
- `UploadService` -> upload endpoints

## Error handling

- Many services use a shared error normalization strategy (see `frontend/src/lib/errorHandling`).
- UI feedback is often displayed via `react-hot-toast`.

## Related docs

- Shared environment variables: `docs/ENVIRONMENT_VARIABLES.md`
- Backend API reference: `backend/docs/api/README.md`
