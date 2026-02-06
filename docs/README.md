# Quad Documentation

This is the documentation hub for the Quad monorepo.

- **Backend**: `backend/` (Express + TypeScript + MongoDB + Socket.IO + Clerk)
- **Frontend**: `frontend/` (React + TypeScript + Vite + Tailwind + DaisyUI + shadcn/ui + Clerk)

## Start here

- **Getting Started (Local Development)**: [GETTING_STARTED.md](./GETTING_STARTED.md)
- **Environment Variables**: [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
- **Scripts (Monorepo)**: [SCRIPTS.md](./SCRIPTS.md)
- **Testing Guide**: [TESTING.md](./TESTING.md)
- **Deployment (Full Stack)**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Deployment Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## Architecture & Codebase Map

- **System Architecture (High level)**: [ARCHITECTURE.md](./ARCHITECTURE.md)

## App-specific documentation

- **Frontend docs index**: ../frontend/docs/README.md
- **Backend docs index**: ../backend/docs/README.md

## Quality, Security, Performance

- **Known Issues**: [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)
- **Manual Testing Checklist**: [MANUAL_TESTING_CHECKLIST.md](./MANUAL_TESTING_CHECKLIST.md)
- **Accessibility Audit**: [ACCESSIBILITY_AUDIT.md](./ACCESSIBILITY_AUDIT.md)
- **Performance Audit**: [PERFORMANCE_AUDIT.md](./PERFORMANCE_AUDIT.md)
- **Security Audit**: [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)
- **Production Readiness Summary**: [PRODUCTION_READINESS_SUMMARY.md](./PRODUCTION_READINESS_SUMMARY.md)
- **Final Review Report**: [FINAL_REVIEW_REPORT.md](./FINAL_REVIEW_REPORT.md)

## Repo scripts

At the repo root (`package.json`):

- `npm run install` installs backend + frontend dependencies
- `npm run typecheck` runs TypeScript checks for both apps
- `npm run build` builds backend then frontend
- `npm run test` runs frontend tests

For package-specific scripts:

- Frontend: see `frontend/package.json`
- Backend: see `backend/package.json`
