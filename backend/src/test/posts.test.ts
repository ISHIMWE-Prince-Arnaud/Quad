import request from "supertest";
import { describe, expect, it } from "vitest";

import { createTestApp } from "./utils/testApp.js";
import { getAuthHeaders } from "./utils/testAuth.js";

type TestApp = ReturnType<typeof createTestApp>;

const ensureUserProfile = async (app: TestApp, userId: string) => {
  await request(app).post("/api/users").set(getAuthHeaders(userId)).send({});
};

describe("Posts API", () => {
  it("POST /api/posts returns 401 when unauthenticated", async () => {
    const app = createTestApp();

    const res = await request(app)
      .post("/api/posts")
      .send({
        text: "Hello",
        media: [{ url: "https://example.com/a.jpg", type: "image" }],
      });

    expect(res.status).toBe(401);
    expect(res.body?.success).toBe(false);
  });

  it("POST /api/posts returns 404 when user profile is missing", async () => {
    const app = createTestApp();

    const res = await request(app)
      .post("/api/posts")
      .set(getAuthHeaders("missing_profile_user"))
      .send({
        text: "Hello",
        media: [{ url: "https://example.com/a.jpg", type: "image" }],
      });

    expect(res.status).toBe(404);
    expect(res.body?.success).toBe(false);
  });

  it("POST /api/posts creates a post and GET /api/posts/:id returns it", async () => {
    const app = createTestApp();
    const userId = "test_user_1";

    await ensureUserProfile(app, userId);

    const createRes = await request(app)
      .post("/api/posts")
      .set(getAuthHeaders(userId))
      .send({
        text: "Hello world",
        media: [{ url: "https://example.com/a.jpg", type: "image" }],
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body?.success).toBe(true);

    const postId = createRes.body?.data?._id;
    expect(typeof postId).toBe("string");

    const getRes = await request(app)
      .get(`/api/posts/${postId}`)
      .set(getAuthHeaders(userId));

    expect(getRes.status).toBe(200);
    expect(getRes.body?.success).toBe(true);
    expect(getRes.body?.data?._id).toBe(postId);
    expect(getRes.body?.data?.text).toBe("Hello world");
  });

  it("PUT /api/posts/:id returns 403 for non-author", async () => {
    const app = createTestApp();
    const authorId = "author_user";
    const otherId = "other_user";

    await ensureUserProfile(app, authorId);
    await ensureUserProfile(app, otherId);

    const createRes = await request(app)
      .post("/api/posts")
      .set(getAuthHeaders(authorId))
      .send({
        text: "Original",
        media: [{ url: "https://example.com/a.jpg", type: "image" }],
      });

    const postId = createRes.body?.data?._id as string;

    const updateRes = await request(app)
      .put(`/api/posts/${postId}`)
      .set(getAuthHeaders(otherId))
      .send({ text: "Hacked" });

    expect(updateRes.status).toBe(403);
    expect(updateRes.body?.success).toBe(false);
  });
});
