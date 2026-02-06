# Getting Started (Local Development)

This repo is a monorepo-style layout containing:

- `backend/` - Express API + Socket.IO server
- `frontend/` - React SPA (Vite)

## Prerequisites

- Node.js + npm
- MongoDB (local or Atlas)
- Clerk account (publishable key + secret key + webhook secret)
- Cloudinary account (cloud name + API key + API secret)

## 1) Install dependencies

From the repo root:

```bash
npm run install
```

This runs `npm install` in both `backend/` and `frontend/`.

## 2) Configure environment variables

### Backend

Create `backend/.env` based on `backend/.env.example` (if present) and set at least:

- `MONGODB_URI`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

The backend validates env vars via `backend/src/config/env.config.ts` and will exit on startup if invalid.

### Frontend

Create `frontend/.env` and set at least:

- `VITE_API_BASE_URL` (default used in code: `http://localhost:4000/api`)
- `VITE_CLERK_PUBLISHABLE_KEY` (required; `frontend/src/main.tsx` throws if missing)

Notes:

- The Socket.IO URL is derived from `VITE_API_BASE_URL` by removing the `/api` suffix in `frontend/src/lib/socket.ts`.
- The repo contains an `envValidation` module at `frontend/src/lib/envValidation.ts` that validates a wider set of variables; whether it is executed depends on usage in the app.

For the full list, see: [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)

## 3) Run the backend

From `backend/`:

```bash
npm run dev
```

By default the server listens on `PORT` (default: `4000`).

Useful endpoints:

- Health check: `GET /health`
- Swagger UI: `GET /api-docs`
- API base: `/api/*`

## 4) Run the frontend

From `frontend/`:

```bash
npm run dev
```

Vite will print the local dev URL in the terminal.

## 5) Typecheck / lint / test

From the repo root:

```bash
npm run typecheck
npm run build
npm run test
```

Notes:

- Root `npm run test` currently runs **frontend** tests only.
- Backend tests can be run from `backend/` with `npm test`.
