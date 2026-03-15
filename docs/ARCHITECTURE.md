# Architecture Overview

This document describes the **current** Quad implementation at a high level:

- Monorepo layout
- Runtime components (frontend SPA, backend API + Socket.IO)
- Data flow and integration points (Clerk auth, MongoDB, Cloudinary)

## Repository layout

- `frontend/` - React + Vite SPA
- `backend/` - Express API + Socket.IO server
- `docs/` - Documentation hub for the whole repo
- `backend/docs/` - Backend-focused deep-dive documentation

## Runtime architecture

### Frontend (SPA)

- Built with React + TypeScript + Vite
- Client-side routing via React Router (`frontend/src/routes/index.tsx`)
- Authentication via Clerk (`@clerk/clerk-react`)
- REST API access via Axios (`frontend/src/lib/api/apiInstance.ts` + `frontend/src/lib/api/endpoints.ts`)
- Realtime updates via Socket.IO client (`frontend/src/lib/socket.ts`)

Key entry points:

- `frontend/src/main.tsx` - renders the app and initializes `ClerkProvider`
- `frontend/src/App.tsx` - mounts `RouterProvider`
- `frontend/src/routes/index.tsx` - route tree (public + protected)

### Backend (API + Realtime)

- Express server with TypeScript
- REST API under `/api/*`
- Swagger docs under `/api-docs`
- Health check under `/health`
- Socket.IO server bound to the same HTTP server

Key entry points:

- `backend/src/server.ts` - Express + Socket.IO initialization
- `backend/src/routes/index.ts` - mounts domain routers
- `backend/src/sockets/*` - socket domain handlers

## Cross-cutting concerns

### Authentication

- Clerk is used on:
  - Frontend: Clerk UI components and session
  - Backend: `clerkMiddleware()` applied in `backend/src/server.ts`

### Persistence

- MongoDB via Mongoose (see `backend/src/config/db.config.ts` and `backend/src/models/*`)

### Media uploads

- Upload endpoints exist under `POST /api/upload/*` and use Cloudinary
- Frontend uses `endpoints.upload.*` (multipart/form-data)

### Realtime

- Frontend uses `getSocket()` and joins rooms in `frontend/src/layouts/RootLayout.tsx`
- Backend registers socket handlers in `backend/src/server.ts`:
  - `setupChatSocket(io)`
  - `setupNotificationSocket(io)`
  - `setupFeedSocket(io)`

## Frontend route map (current)

Public Auth:

- `/login/*` - Clerk Sign In page wrapper
- `/signup/*` - Clerk Sign Up page wrapper
- `/login/sso-callback` - SSO callback handler
- `/signup/sso-callback` - SSO callback handler

Protected (requires auth, handled at root `""`):

- `/` - Feed / Home
- `/profile/:username`
- `/profile/:username/edit`
- `/posts/:id`
- `/posts/:id/edit`
- `/stories`
- `/stories/:id`
- `/stories/:id/edit`
- `/create/story`
- `/polls`
- `/polls/:id/edit`
- `/create/poll`
- `/chat` (global chat timeline)
- `/notifications`

*(Note: Legacy `/app/*` routes automatically redirect to `/`)*

## Backend API domains (router-level)

Mounted under `/api` in `backend/src/routes/index.ts`:

- `/users`
- `/posts`
- `/stories`
- `/polls`
- `/chat`
- `/profile`
- `/follow`
- `/notifications`
- `/feed`
- `/reactions`
- `/comments`
- `/bookmarks`
- `/upload`

See the backend API documentation for details: `backend/docs/api/README.md`.
