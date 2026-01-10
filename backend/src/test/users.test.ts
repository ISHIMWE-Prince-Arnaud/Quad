import request from "supertest";
import { describe, expect, it } from "vitest";

import { createTestApp } from "./utils/testApp.js";
import { getAuthHeaders } from "./utils/testAuth.js";

describe("Users API", () => {
  it("POST /api/users returns 401 when unauthenticated", async () => {
    const app = createTestApp();

    const res = await request(app).post("/api/users").send({});

    expect(res.status).toBe(401);
    expect(res.body?.success).toBe(false);
  });

  it("POST /api/users creates a user based on Clerk userId", async () => {
    const app = createTestApp();
    const userId = "test_user_1";

    const res = await request(app)
      .post("/api/users")
      .set(getAuthHeaders(userId))
      .send({});

    expect(res.status).toBe(201);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.clerkId).toBe(userId);
    expect(res.body?.data?.username).toBe(`user_${userId}`);
    expect(res.body?.data?.email).toBe(`${userId}@example.com`);
  });

  it("GET /api/users/:clerkId returns user only for the same authenticated user", async () => {
    const app = createTestApp();
    const userId = "test_user_1";

    await request(app).post("/api/users").set(getAuthHeaders(userId)).send({});

    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set(getAuthHeaders(userId));

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.clerkId).toBe(userId);
  });

  it("GET /api/users/:clerkId returns 403 when requesting another user's data", async () => {
    const app = createTestApp();

    const res = await request(app)
      .get("/api/users/someone_else")
      .set(getAuthHeaders("test_user_1"));

    expect(res.status).toBe(403);
    expect(res.body?.success).toBe(false);
  });

  it("PUT /api/users/:clerkId updates user profile for the same authenticated user", async () => {
    const app = createTestApp();
    const userId = "test_user_1";

    await request(app).post("/api/users").set(getAuthHeaders(userId)).send({});

    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set(getAuthHeaders(userId))
      .send({ username: "newname" });

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.username).toBe("newname");
  });
});
