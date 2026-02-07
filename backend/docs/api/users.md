# Users API Documentation

User CRUD mapped to Clerk identity.

## 4dd Endpoints

### Create user
**POST** `/api/users`

Creates an application `User` for the authenticated Clerk user.

### Get user
**GET** `/api/users/:clerkId`

Fetches a user by Clerk ID.

### Update user
**PUT** `/api/users/:clerkId`

Updates a user (intended for the same authenticated user).

### Delete user
**DELETE** `/api/users/:clerkId`

Deletes a user (intended for the same authenticated user).

## 510 Authentication

All endpoints require `Authorization: Bearer <jwt_token>`.

## 4cb Validation

Validation is enforced by Zod schemas in `backend/src/schemas/user.schema.ts`.

## 6a8 Common failure modes

- **400** invalid params/body
- **401** missing/invalid auth
- **403** attempting to access another user's record (enforced in controller/service)
- **404** user not found
