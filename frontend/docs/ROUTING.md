# Frontend Routing

This document describes the client-side routing for the Quad frontend.

## Router Setup

- **Entry Point:** `frontend/src/main.tsx`
  - Initializes the `ClerkProvider` for authentication.
  - Renders the root `<App />`.
- **Router Provider:** `frontend/src/App.tsx`
  - Renders `<RouterProvider router={router} />`.
- **Route Definitions:** `frontend/src/routes/index.tsx`
  - Uses React Router v7 `createBrowserRouter`.
  - All pages are lazily loaded (`React.lazy`) and wrapped in a `<LazyRoute>` component for suspense fallbacks and error boundaries.

---

## Route Tree

All routes descend from the **Root Layout** (`frontend/src/layouts/RootLayout.tsx`), which handles global theme initialization and connects to the global Socket.IO feed and notification rooms once the user is authenticated.

The route tree is split into two primary blocks: **Public Auth Routes** and **Protected Main Routes**.

### 1. Public Auth Routes

These routes are wrapped in `<AuthLayout />` and `<AuthSplitLayout />`.

- `/login/*` ➔ `LoginPage` (Clerk `<SignIn />` component)
- `/signup/*` ➔ `SignUpPage` (Clerk `<SignUp />` component)
- `/login/sso-callback` ➔ `SsoCallbackPage`
- `/signup/sso-callback` ➔ `SsoCallbackPage`

> Note: The `/*` catch-all on login/signup is required by Clerk to handle its internal nested routing (e.g., `/login/factor-one`).

### 2. Protected Main Routes

Protected routes sit at the root path (`""`) and are wrapped by:
1. `<ProtectedRoute>`: Ensures the user is authenticated via Clerk `useAuth()`. Unauthenticated users are redirected to `/login`.
2. `<MainLayout>`: Provides the app shell (Navbar, Sidebar, RightPanel) and manages Framer Motion page transitions on route changes.

**Core Routes:**
- `/` (Index) ➔ `FeedPage`
- `/feed` ➔ Redirects to `/`
- `/profile/:username` ➔ `ProfilePage`
- `/profile/:username/edit` ➔ `EditProfilePage`
- `/posts/:id` ➔ `PostPage`
- `/posts/:id/edit` ➔ `EditPostPage`
- `/stories` ➔ `StoriesPage`
- `/stories/:id` ➔ `StoryPage`
- `/create/story` ➔ `CreateStoryPage`
- `/stories/:id/edit` ➔ `EditStoryPage`
- `/polls` ➔ `PollsPage`
- `/create/poll` ➔ `CreatePollPage`
- `/polls/:id/edit` ➔ `EditPollPage`
- `/chat` ➔ `ChatPage`
- `/chat/:id` ➔ Redirects to `/chat` (chat handles history linearly)
- `/notifications` ➔ `NotificationsPage`
- `*` (Catch-all inside Protected) ➔ `NotFoundPage`

### 3. Legacy Redirects

- `/app/*` ➔ Redirects to `/` to support legacy bookmarks from the older `/app` routing structure.

### 4. Global Fallback

- `*` (Catch-all at Root) ➔ `NotFoundPage` for unparalleled public paths.

---

## Authorization & Protection

The `<ProtectedRoute>` component (`frontend/src/components/auth/ProtectedRoute.tsx`):
- Checks authentication status via Clerk's `useAuth()`.
- Renders a global `<LoadingSpinner />` while Clerk validates the session.
- Redirects unauthenticated users to `/login`.
- Preserves the intended destination URL using `sessionStorage` (`redirectAfterLogin`) so the user returns to their requested page after authenticating.

---

## Code Splitting conventions

- Centralize router definitions in `src/routes/index.tsx`.
- All top-level pages (`src/pages/*`) must be exported as `default export` and lazily imported.
- Custom skeleton components (e.g., `LoginSkeleton`) should be passed to the `fallback` prop of `LazyRoute` to prevent jarring flashes during chunk loading.
