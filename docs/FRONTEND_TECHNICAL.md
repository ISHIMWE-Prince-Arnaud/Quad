# Quad Frontend Technical Documentation

This document describes the **frontend architecture** of Quad, focusing on:

- Component/page structure
- API integration between frontend services and backend routes
- State management with Zustand
- Testing strategies
- Deployment procedures

> This file covers the **frontend** only. Backend-specific details live in `backend/docs/` (for example `backend/docs/api/README.md`, `backend/docs/search/README.md`, etc.).

---

## 1. Component & Page Structure

The frontend is a React + TypeScript SPA using React Router, Tailwind CSS, and Zustand.

### 1.1 Layouts

- **`RootLayout`** (`src/layouts/RootLayout.tsx`)

  - Top-level shell; synchronizes auth with Clerk and backend.
  - Initializes theme and connects to the Socket.IO client (feed & notifications rooms).
  - Hosts public and protected route trees via `Outlet`.

- **`AuthLayout`** (`src/layouts/AuthLayout.tsx`)

  - Wrapper for public auth routes (`/`, `/login`, `/signup`).
  - Typically displays marketing/landing UI around the auth forms.

- **`MainLayout`** (`src/layouts/MainLayout.tsx`)
  - Shell for all `/app/*` routes.
  - Renders:
    - `Navbar` (top bar with search, theme switcher, notifications bell, etc.)
    - `Sidebar` (main navigation)
    - `RightPanel` (suggested users, trends, etc.)
  - Wraps route content (`Outlet`) in Framer Motion’s `AnimatePresence` + `motion.div` for page transitions.

### 1.2 Core Pages (by feature)

- **Feed**

  - `src/pages/app/FeedPage.tsx`
  - Shows the main content feed, using `PostCard` for each item.
  - Uses skeleton loaders (`FeedSkeleton`) while content loads.

- **Profile**

  - `src/pages/app/ProfilePage.tsx`
  - Displays user profile header, stats, timeline of posts/stories/polls.
  - Uses `ProfileService` for profile + content and `ProfileSkeleton` for loading.

- **Chat**

  - `src/pages/ChatPage.tsx`
  - Real-time messaging UI, integrated with Socket.IO and chat services.
  - Routes: `/app/chat` and `/app/chat/:conversationId`.

- **Stories**

  - `src/pages/StoriesPage.tsx` – list of stories.
  - `src/pages/StoryPage.tsx` – single story view.
  - `src/pages/CreateStoryPage.tsx` – story creation.
  - Uses `StoryService` and cards with Framer Motion hover/tap effects.

- **Polls**

  - `src/pages/PollsPage.tsx` – list of polls.
  - `src/pages/PollPage.tsx` – single poll detail & voting.
  - `src/pages/CreatePollPage.tsx` – poll creation.
  - Uses `PollService` and skeletons while loading.

- **Notifications**

  - `src/pages/NotificationsPage.tsx`
  - Paginated list of notifications with read/unread state, actions, and click-through to related content.
  - Uses `NotificationService` for REST calls and `notificationStore` for unread count.

- **Search**

  - `src/pages/app/SearchPage.tsx`
  - Full search experience: tabs (users/posts/stories/polls), filters, history, and trending searches.
  - Uses `SearchService` and search analytics endpoints.

- **Create Hub**

  - `src/pages/app/CreatePage.tsx`
  - Entry point to create posts/stories/polls.

- **Settings**

  - `src/pages/SettingsPage.tsx`
  - User account and preference settings.

- **Analytics**
  - `src/pages/app/AnalyticsPage.tsx`
  - Client-driven personal analytics for posts/stories/polls and search trends.

### 1.3 Shared Components

- **Layout components**

  - `Navbar` – search bar, theme selector, notifications bell with unread badge.
  - `Sidebar` – primary navigation (Feed, Search, Notifications, Messages, Stories, Polls, Analytics, Settings, Profile).
  - `RightPanel` – suggestions, trends, and contextual widgets.

- **Content components**

  - `PostCard` – core feed card; handles media, reactions, comments, and small motion interactions.
  - Story & poll cards – simplified cards (in Stories/Polls pages) with hover/tap animations.

- **UI utilities**
  - `src/components/ui/loading.tsx` – `LoadingSpinner`, `FeedSkeleton`, `ProfileSkeleton`, `SkeletonPost`, etc.
  - `src/components/theme/ThemeSelector.tsx` – theme toggles (simple and advanced variants).

---

## 2. API Integration Guide

### 2.1 API client

- **`src/lib/api.ts`**
  - Exposes a strongly-typed `endpoints` object wrapping HTTP calls to the backend.
  - Handles base URL, auth headers, and error normalization.
  - All services consume `endpoints.*` instead of calling `fetch`/`axios` directly.

### 2.2 Frontend Services → Backend Domains

Each service encapsulates a backend domain. Detailed route definitions live in **`backend/docs/api/`** and related docs.

- **`ProfileService`** – `src/services/profileService.ts`

  - Profile details by username/ID.
  - User posts, stories, and polls (for profile timelines and analytics).
  - Maps to profile-related controllers/routes in the backend (see `backend/docs/api/` and `backend/docs/search/README.md` for content/search behavior).

- **`SearchService`** – `src/services/searchService.ts`

  - User search, global content search, popular and trending searches, search history.
  - Uses backend search analytics endpoints documented in `backend/docs/search/README.md`.

- **`StoryService`** – `src/services/storyService.ts`

  - CRUD operations for stories and story listing.
  - Backed by the stories/routes described under the content API domain.

- **`PollService`** – `src/services/pollService.ts`

  - CRUD and voting for polls.
  - Backed by poll-related routes (poll creation, options, vote submission).

- **`NotificationService`** – `src/services/notificationService.ts`

  - List notifications with pagination + unread filter.
  - Mark single/all as read.
  - Delete single/clear all read notifications.
  - Fetch unread count.
  - Corresponds to notification routes documented in `backend/docs/realtime/README.md` and API docs.

- **`FollowService`** – `src/services/followService.ts`

  - Follow/unfollow and follower/following lists.
  - Integrates with profile/follow controllers documented in backend API docs.

- **`Chat` / messaging services** – e.g. `src/services/chatService.ts`
  - Conversations and messages are coordinated via:
    - REST endpoints for history.
    - Socket.IO events for live updates (see `backend/docs/realtime/README.md`).

> When adding new endpoints, extend `endpoints` in `lib/api.ts`, then wrap them in a dedicated service class. Keep components free of raw URL strings.

---

## 3. State Management (Zustand)

Zustand slices live under `src/stores/`. Each slice:

- Exposes a typed store hook (`useXStore`).
- Manages one domain (auth, theme, notifications, etc.).
- Encapsulates async actions calling services.

### 3.1 Auth Store

- **File:** `src/stores/authStore.ts`
- **Shape:**
  - `user: User | null`
  - `isLoading: boolean`
  - `error: string | null`
  - Actions: `setUser`, `setLoading`, `setError`, `syncWithClerk`, `logout`, `clearError`.
- **Persistence:**
  - Uses `persist` middleware to store `user` in `localStorage` (`quad-auth-storage`).

### 3.2 Theme Store

- **File:** `src/stores/themeStore.ts`
- **Responsibility:**
  - Stores current theme: `'light' | 'dark' | 'system'`.
  - Persists preference in local storage.
  - Respects `prefers-color-scheme` for the `system` option.
  - Updates the root document class (e.g. `.dark`) and CSS variables.

### 3.3 Notification Store

- **File:** `src/stores/notificationStore.ts`
- **State:**
  - `unreadCount: number`
- **Actions:**
  - `fetchUnreadCount()` – sync from REST.
  - `increment()`, `decrement()`, `setUnreadCount(count)` – local updates.
- Used by `Navbar` (badge) and `RootLayout` (socket listener handling `notification:new`).

### 3.4 Other Domain Stores

Additional domain stores (feed, chat, etc.) follow the same pattern:

- Keep business logic + async side-effects in the store.
- Make components as declarative as possible (subscribe to a slice, trigger actions on events).
- Use `persist` only when necessary.

> Pattern: **Service → Store → Component**. Services talk to the backend, stores orchestrate and cache, components render.

---

## 4. Testing Strategies

The recommended testing strategy focuses on:

### 4.1 UI / Component Tests

- Use **React Testing Library** (or similar) for:
  - Rendering pages like `FeedPage`, `ProfilePage`, `NotificationsPage` with mocked stores/services.
  - Verifying key flows: creating a post, reacting, opening notifications, navigating via sidebar.
  - Accessibility checks (roles, labels, `aria-current` on active nav items).
- Mock Zustand stores with their hook APIs and supply fake state/actions.

### 4.2 Service & API Contract Tests

- Unit test service classes (ProfileService, SearchService, NotificationService, etc.).
- Mock the underlying HTTP client or `endpoints` object.
- Validate:
  - Correct HTTP method and parameters (query/body/path).
  - Correct handling of success + error responses.
  - Transformations into `ContentItem`, pagination metadata, etc.
- Use backend docs (`backend/docs/api/README.md`, `backend/docs/search/README.md`, etc.) as the source of truth for contract expectations.

### 4.3 Integration / E2E

- Optional but recommended:
  - Use Cypress/Playwright to drive the running app:
    - Sign up / login flow.
    - Posting content and seeing it appear in feed/profile.
    - Real-time notifications and chat behavior.
    - Search and analytics views.

---

## 5. Deployment Procedures

> Exact commands depend on the scripts defined in `frontend/package.json`. This section describes the general flow.

### 5.1 Environments

- **Local dev:**

  - Backend: see `backend/docs/development/README.md` for running the API + sockets.
  - Frontend: run the dev server (e.g. `npm run dev` or equivalent as defined in `package.json`).

- **Staging/Production:**
  - Use environment variables for API base URL, Clerk keys, and any 3rd-party services.
  - Ensure frontend env files (`.env`, `.env.production`, or framework-specific) are configured and **not** committed with secrets.

### 5.2 Build

- From `frontend/`:
  - Install deps: `npm install` or `pnpm install`.
  - Build: run the configured build script (typically `npm run build`).
  - Output will be placed in the framework’s default build directory (e.g. `dist/` for Vite/CRA-like setups).

### 5.3 Deployment Targets

- The built frontend can be deployed to any static hosting/CDN or a platform like Netlify/Vercel.
- Make sure:
  - The router is configured for SPA-style 404 handling (serving `index.html` for unknown paths).
  - Environment variables required at build time are set in the deployment platform.

---

## 6. Adding New Features Safely

1. **Add/extend backend API** and document it in `backend/docs/api/`.
2. Update `lib/api.ts` with new `endpoints` entries.
3. Wrap them in a dedicated service (e.g. `NewFeatureService`).
4. Add or extend a Zustand store slice for feature state.
5. Build UI in pages/components, consuming store + services.
6. Add/update tests for services and components.
7. Update this doc and any related user docs if behavior is user-visible.
