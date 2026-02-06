# Frontend Authentication

This document describes how authentication works in the Quad frontend.

## Auth provider

- Provider: Clerk
- Package: `@clerk/clerk-react`

Initialization:

- `frontend/src/main.tsx` wraps the app with:
  - `<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>`

If `VITE_CLERK_PUBLISHABLE_KEY` is missing, the app throws immediately.

## Sign in / sign up pages

- `frontend/src/pages/auth/LoginPage.tsx`
- `frontend/src/pages/auth/SignUpPage.tsx`

These pages render Clerk UI components (`<SignIn />` / `<SignUp />`) and pass appearance configuration.

Routes (see `frontend/src/routes/index.tsx`):

- `/login/*`
- `/signup/*`

## Route protection

- `frontend/src/components/auth/ProtectedRoute.tsx`

Behavior:

- While Clerk is initializing (`!isLoaded`) the route shows a loading UI.
- If not signed in, it:
  - stores the intended destination (`redirectAfterLogin`) in `sessionStorage`
  - redirects to `/login`
- If `requiredPermissions` is passed, it checks permissions from Clerk metadata.

## Local auth state

The app keeps a domain-level auth snapshot in Zustand:

- Store: `frontend/src/stores/authStore.ts`
- Key fields:
  - `user`
  - `isLoading`
  - `error`

### Clerk -> store sync

- Hook: `frontend/src/hooks/useAuthSync.tsx`
- Called from: `frontend/src/layouts/RootLayout.tsx`

High-level flow:

- Wait until Clerk `useUser()` is loaded.
- If signed out:
  - clears auth audit data
  - resets Zustand auth store state
- If signed in:
  - fetches an auth token via `useTokenManager()` (see `frontend/src/lib/tokens`)
  - attempts to eagerly fetch the backend profile via `ProfileService.getProfileById(clerkUser.id)`
  - calls `syncWithClerk(clerkUser)`
  - merges backend profile fields into the auth store when available

This enables UI components to use a consistent `user` object even when the backend user record contains additional fields.

## Logging/auditing

- Protected route events are logged via `logAuthEvent` (`frontend/src/lib/authAudit`).

## Related docs

- Shared env vars: `docs/ENVIRONMENT_VARIABLES.md`
- Shared troubleshooting: `docs/TROUBLESHOOTING.md`
