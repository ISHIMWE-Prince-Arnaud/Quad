# Scripts Reference (Monorepo)

This document describes the scripts available in the Quad repo.

## Root scripts (`package.json`)

Run these from the repo root.

- **`npm run install`**
  - Installs dependencies for both `backend/` and `frontend/`.
- **`npm run typecheck`**
  - Runs TypeScript checks for both apps.
- **`npm run build`**
  - Builds backend then frontend.
- **`npm run test`**
  - Runs frontend tests.

## Frontend scripts (`frontend/package.json`)

Run these from the `frontend/` directory.

- **`npm run dev`** - Start Vite dev server.
- **`npm run build`** - TypeScript build + Vite production build.
- **`npm run build:production`** - Production-mode Vite build.
- **`npm run build:analyze`** - Production build + bundle visualizer.
- **`npm run lint`** - ESLint.
- **`npm run typecheck`** - TS build check + lint.
- **`npm run test`** - Vitest run.
- **`npm run test:watch`** - Vitest watch mode.
- **`npm run test:ui`** - Vitest UI.

## Backend scripts (`backend/package.json`)

Run these from the `backend/` directory.

- **`npm run dev`** - Start dev server (`tsx src/server.ts`).
- **`npm run dev:tunnel`** - Start dev with tunnel script.
- **`npm run dev:simple`** - Run server + ngrok concurrently.
- **`npm run build`** - TypeScript compile to `dist/`.
- **`npm run start`** - Run compiled server.
- **`npm run typecheck`** - TS noEmit typecheck.
- **`npm run lint`** / **`npm run lint:fix`** - ESLint.
- **`npm run test`** - Vitest.

## Recommended common workflows

- **Local dev**
  - Start backend (`backend/npm run dev`)
  - Start frontend (`frontend/npm run dev`)

- **CI-like check**
  - `npm run typecheck`
  - `npm run build`

- **Frontend test run**
  - `npm --prefix frontend run test`

- **Backend test run**
  - `npm --prefix backend run test:run`
