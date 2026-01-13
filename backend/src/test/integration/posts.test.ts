import request from "supertest";
import { describe, expect, it } from "vitest";

import { createTestApp } from "../utils/testApp.js";
import { getAuthHeaders } from "../utils/testAuth.js";

type TestApp = ReturnType<typeof createTestApp>;

const ensureUser = async (app: TestApp, userId: string) => {
  await request(app).post("/api/users").set(getAuthHeaders(userId)).send({});
};

describe("Posts CRUD", () => {
  it("creates post with media", async () => {
    const app = createTestApp();
    const userId = "post_user_1";
    await ensureUser(app, userId);

    const res = await request(app)
      .post("/api/posts")
      .set(getAuthHeaders(userId))
      .send({
        text: "Hello world",
        media: [{ url: "https://example.com/a.jpg", type: "image" }],
      });

    expect(res.status).toBe(201);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.media?.length).toBe(1);
  });

  it("updates post only for author", async () => {
    const app = createTestApp();
    const authorId = "post_user_2";
    const otherId = "post_user_3";
    await ensureUser(app, authorId);
    await ensureUser(app, otherId);

    const createRes = await request(app)
      .post("/api/posts")
      .set(getAuthHeaders(authorId))
      .send({
        text: "Original",
        media: [{ url: "https://example.com/a.jpg", type: "image" }],
      });

    const postId = createRes.body?.data?._id as string;

    const forbidden = await request(app)
      .put(`/api/posts/${postId}`)
      .set(getAuthHeaders(otherId))
      .send({ text: "Hacked" });

    expect(forbidden.status).toBe(403);

    const ok = await request(app)
      .put(`/api/posts/${postId}`)
      .set(getAuthHeaders(authorId))
      .send({ text: "Updated" });

    expect(ok.status).toBe(200);
    expect(ok.body?.data?.text).toBe("Updated");
  });

  it("deletes post only for author", async () => {
    const app = createTestApp();
    const authorId = "post_user_4";
    const otherId = "post_user_5";
    await ensureUser(app, authorId);
    await ensureUser(app, otherId);

    const createRes = await request(app)
      .post("/api/posts")
      .set(getAuthHeaders(authorId))
      .send({
        text: "To delete",
        media: [{ url: "https://example.com/a.jpg", type: "image" }],
      });

    const postId = createRes.body?.data?._id as string;

    const forbidden = await request(app)
      .delete(`/api/posts/${postId}`)
      .set(getAuthHeaders(otherId));

    expect(forbidden.status).toBe(403);

    const ok = await request(app)
      .delete(`/api/posts/${postId}`)
      .set(getAuthHeaders(authorId));

    expect(ok.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/posts/${postId}`)
      .set(getAuthHeaders(authorId));

    expect(getRes.status).toBe(404);
  });
});
