# Frontend Routing

This document describes the current client-side routing for the Quad frontend.

## Router entry points

- App entry: `frontend/src/main.tsx`
  - Initializes `ClerkProvider`.
  - Renders `<App />`.
- Router mount: `frontend/src/App.tsx`
  - Renders `<RouterProvider router={router} />`.
- Router definition: `frontend/src/routes/index.tsx`
  - Uses `createBrowserRouter`.
  - Lazily loads pages with `React.lazy` + `LazyRoute` wrapper.

## Route tree (current)

All routes are nested under the root layout:

- Root layout: `frontend/src/layouts/RootLayout.tsx`
  - Provides global theme initialization.
  - Joins realtime rooms after auth is ready.
  - Hosts `<Outlet />`.

### Public routes

Public routes are wrapped by `AuthLayout` (`frontend/src/layouts/AuthLayout.tsx`).

- `/` (index) -> `HomePage`
- `/login/*` -> `LoginPage` (Clerk SignIn wrapper)
- `/signup/*` -> `SignUpPage` (Clerk SignUp wrapper)

Note: `/*` is used to support Clerk’s internal nested routes.

### Protected routes

Protected routes are mounted at `/app/*` and wrapped by:

- `ProtectedRoute` (`frontend/src/components/auth/ProtectedRoute.tsx`)
- `MainLayout` (`frontend/src/layouts/MainLayout.tsx`)

Routes:

- `/app` -> redirects to `/app/feed`
- `/app/feed` -> `FeedPage`
- `/app/profile/:username` -> `ProfilePage`
- `/app/profile/:username/edit` -> `EditProfilePage`
- `/app/posts/:id` -> `PostPage`
- `/app/posts/:id/edit` -> `EditPostPage`
- `/app/create/post` -> `CreatePostPage`
- `/app/stories` -> `StoriesPage`
- `/app/stories/:id` -> `StoryPage`
- `/app/stories/:id/edit` -> `EditStoryPage`
- `/app/create/story` -> `CreateStoryPage`
- `/app/polls` -> `PollsPage`
- `/app/polls/:id/edit` -> `EditPollPage`
- `/app/create/poll` -> `CreatePollPage`
- `/app/chat` -> `ChatPage`
- `/app/notifications` -> `NotificationsPage`

### Not found

- `*` -> `NotFoundPage`

## Authorization model (route gating)

`ProtectedRoute` checks:

- Authentication status (`useAuth()` from Clerk).
- Optional permission requirements via `requiredPermissions`.

When not signed in:

- Redirects to `/login`.
- Stores the intended destination in `sessionStorage` under `redirectAfterLogin`.

## Recommended conventions

- Keep route definitions centralized in `frontend/src/routes/index.tsx`.
- Page components live under `frontend/src/pages/*`.
- Prefer lazy loading for large pages.
