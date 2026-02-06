# Troubleshooting (Quad)

This guide covers common issues when running the Quad monorepo locally or in production.

## 1) Environment variables

### Symptom: Frontend fails immediately with "Missing Publishable Key"

- **Cause**: `frontend/src/main.tsx` requires `VITE_CLERK_PUBLISHABLE_KEY`.
- **Fix**:
  - Ensure `frontend/.env` contains:
    - `VITE_CLERK_PUBLISHABLE_KEY=pk_...`
  - Restart the Vite dev server.

### Symptom: Backend exits on startup complaining about invalid env

- **Cause**: backend env validation in `backend/src/config/env.config.ts` fails.
- **Fix**:
  - Ensure `backend/.env` is present.
  - Ensure required variables are set (MongoDB, Clerk, Cloudinary).
  - Re-run `npm run dev` in `backend/`.

See: [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)

## 2) CORS problems

### Symptom: Browser shows CORS errors on API requests

- **Cause**: Backend CORS configuration rejects the frontend origin.
- **Fix**:
  - Check backend CORS config (`backend/src/config/cors.config.ts`).
  - In production, set `FRONTEND_URL` correctly (include protocol, no trailing slash).
  - Confirm the frontend is calling the correct API base URL (`VITE_API_BASE_URL`).

## 3) API base URL / Socket URL mismatch

### Symptom: REST works but realtime (Socket.IO) doesn’t connect

- **Cause**: Socket URL is derived from `VITE_API_BASE_URL` in `frontend/src/lib/socket.ts` by stripping `/api`.
- **Fix**:
  - If your API base URL is `http://localhost:4000/api`, socket connects to `http://localhost:4000`.
  - Ensure the backend server is reachable at that origin.
  - Verify there is no proxy interfering with WebSocket upgrades.

### Symptom: Socket connects but you don’t receive events

- **Cause**: The client must join rooms.
- **Fix**:
  - Ensure you are logged in.
  - `frontend/src/layouts/RootLayout.tsx` joins rooms using:
    - `socket.emit("feed:join", userId)`
    - `socket.emit("notification:join", userId)`
  - Confirm the backend socket handlers are running (registered in `backend/src/server.ts`).

## 4) Auth issues (Clerk)

### Symptom: You can sign in on Clerk UI but API calls are unauthorized

- **Cause**: Backend uses `clerkMiddleware()`; API calls must include valid session/auth.
- **Fix**:
  - Confirm Clerk keys match the same Clerk application on frontend and backend.
  - Confirm the frontend is attaching auth headers/cookies via Axios interceptors (`frontend/src/lib/api/interceptors/*`).
  - Check backend logs for auth failures.

## 5) MongoDB issues

### Symptom: Backend can’t connect to MongoDB

- **Fix**:
  - Verify `MONGODB_URI`.
  - Verify network access (Atlas IP allowlist) if using Atlas.
  - Ensure MongoDB is running if local.

## 6) Upload/Cloudinary issues

### Symptom: Upload endpoints return errors or timeouts

- **Fix**:
  - Verify Cloudinary credentials in backend env.
  - Verify file size/type.
  - Check backend logs.

## 7) Build issues

### Symptom: `npm run build` fails

- **Fix**:
  - Run `npm run typecheck` first to get clearer TS errors.
  - Ensure Node.js version is compatible with dependencies.

See also:

- Shared docs hub: [README.md](./README.md)
- Getting started: [GETTING_STARTED.md](./GETTING_STARTED.md)
