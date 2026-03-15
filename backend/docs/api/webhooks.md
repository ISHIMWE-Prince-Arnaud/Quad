# Webhooks API

Clerk webhooks are handled at a dedicated route **before** JSON body parsing, enabling raw body verification using the Svix library.

## Endpoint

**POST** `/api/webhooks/clerk`

Handles Clerk lifecycle events. This endpoint:
- Uses `express.raw({ type: "application/json" })` for raw body (required by Svix signature verification).
- Verifies the `svix-id`, `svix-timestamp`, and `svix-signature` headers using `CLERK_WEBHOOK_SECRET`.
- Does **not** require user auth (`requireApiAuth` is NOT applied).

---

## Handled Events

### `user.created`

Creates a new `User` document in MongoDB when a user signs up via Clerk.

Fields populated from Clerk:
- `clerkId` — Clerk user ID
- `username` — from Clerk or derived from email
- `email` — first email address
- `displayName` — firstName + lastName
- `profileImage` — Clerk avatar URL or random fallback

---

### `user.updated`

Updates the corresponding `User` document and propagates changes to **embedded user snapshots** across all content (posts, stories, polls, chat messages, etc.) using `propagateUserSnapshotUpdates()`.

- Runs inside a MongoDB transaction when supported; falls back to sequential non-transactional updates on standalone MongoDB instances (e.g., local dev).
- Checks for username conflicts before applying the change.

---

### `user.deleted`

Performs a **hard cascade delete** of all user data:
- User document
- All posts, stories, polls authored by this user
- All poll votes, reactions, and chat messages
- All notifications (both received and triggered by this user)

Operations run in parallel via `Promise.all`.

---

## Error Responses

| Status | Meaning                                                    |
|--------|------------------------------------------------------------|
| 400    | Svix signature verification failed (invalid webhook call)  |
| 500    | Missing `CLERK_WEBHOOK_SECRET` or internal processing error |

---

## Setup

1. In the Clerk Dashboard, set your webhook endpoint to: `https://<your-domain>/api/webhooks/clerk`
2. Subscribe to: `user.created`, `user.updated`, `user.deleted`
3. Copy the **Signing Secret** and set it as `CLERK_WEBHOOK_SECRET` in your backend `.env`.

> See [Auth & Webhooks](../WEBHOOKS_AND_AUTH.md) for full integration details.
