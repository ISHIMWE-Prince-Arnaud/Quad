# Frontend API Client

This document explains how the frontend communicates with the backend REST API.

## Overview

The frontend API layer is built on Axios with a centralized configuration and endpoint mapping pattern:

- **Axios Instance:** `frontend/src/lib/api/apiInstance.ts`
- **Endpoints Map:** `frontend/src/lib/api/endpoints.ts`
- **Public Facade:** `frontend/src/lib/api.ts` (re-exports `api` and `endpoints`)

## Base URL

The Axios `baseURL` is resolved automatically:

1. `import.meta.env.VITE_API_BASE_URL` (if provided)
2. Fallback to `http://localhost:4000/api` for local development.

This is configured inside `frontend/src/lib/api/apiInstance.ts`.

## Interceptors

Axios interceptors are attached within `frontend/src/lib/api/apiInstance.ts`.
They handle:
- **Authentication:** Injecting Clerk JWT tokens into the `Authorization` header.
- **Error Normalization:** Processing raw HTTP errors into a predictable format.
- **Logging:** Request/response logging for easier debugging.

## Endpoints Catalog

To prevent scattering raw URLs throughout the codebase, all REST calls are routed through the `endpoints` object mapped in `frontend/src/lib/api/endpoints.ts`:

- `users.*` (create, update, delete)
- `profiles.*` (get by username/id, get authored content)
- `posts.*` (CRUD)
- `stories.*` (CRUD, get mine)
- `polls.*` (CRUD, vote)
- `feed.*` (get general, following, foryou)
- `follow.*` (follow, unfollow, follower lists, stats)
- `reactions.*` (toggle, get by content, user reactions)
- `comments.*` (CRUD, likes, by content)
- `bookmarks.*` (toggle, list, check)
- `chat.*` (send, get history, edit, delete)
- `notifications.*` (get all, mark read, unread count)
- `upload.*` (images/videos for post, story, poll, profile, canvas via `FormData`)

## Services Layer

Domain services act as an abstraction layer between components/stores and raw API endpoints. They format requests, execute `endpoints.*`, and normalize responses.

Location: `frontend/src/services/*`

Examples:
- `PostService` -> Calls `endpoints.posts.*`
- `ProfileService` -> Calls `endpoints.profiles.*`
- `UploadService` -> Calls `endpoints.upload.*`

Components and Zustand stores should **always** call Service classes rather than importing the `api` or `endpoints` client directly.

## Error Handling

- Errors thrown by services follow a normalized footprint handled by `frontend/src/lib/errorHandling`.
- User-facing error messaging and feedback are often displayed using standard toast notifications (`react-hot-toast` or similar UI libraries).
