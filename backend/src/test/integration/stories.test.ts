import request from "supertest";
import { describe, expect, it } from "vitest";

import { createTestApp } from "../utils/testApp.js";
import { getAuthHeaders } from "../utils/testAuth.js";

type TestApp = ReturnType<typeof createTestApp>;

const ensureUser = async (app: TestApp, userId: string) => {
  await request(app).post("/api/users").set(getAuthHeaders(userId)).send({});
};

describe("Stories CRUD", () => {
  it("creates draft and lists it via /me", async () => {
    const app = createTestApp();
    const userId = "story_user_1";
    await ensureUser(app, userId);

    const createRes = await request(app)
      .post("/api/stories")
      .set(getAuthHeaders(userId))
      .send({ title: "Draft", content: "<p>Hello</p>", status: "draft" });

    expect(createRes.status).toBe(201);
    expect(createRes.body?.data?.status).toBe("draft");

    const mine = await request(app)
      .get("/api/stories/me")
      .set(getAuthHeaders(userId));

    expect(mine.status).toBe(200);
    expect(Array.isArray(mine.body?.data)).toBe(true);
    expect(mine.body?.data?.length).toBe(1);
  });

  it("creates published story and appears in /api/stories", async () => {
    const app = createTestApp();
    const userId = "story_user_2";
    await ensureUser(app, userId);

    const createRes = await request(app)
      .post("/api/stories")
      .set(getAuthHeaders(userId))
      .send({ title: "Pub", content: "<p>Hello</p>", status: "published" });

    expect(createRes.status).toBe(201);

    const listRes = await request(app)
      .get("/api/stories")
      .set(getAuthHeaders(userId));

    expect(listRes.status).toBe(200);
    expect(listRes.body?.data?.length).toBe(1);
  });

  it("updates and deletes story author-only", async () => {
    const app = createTestApp();
    const authorId = "story_user_3";
    const otherId = "story_user_4";
    await ensureUser(app, authorId);
    await ensureUser(app, otherId);

    const createRes = await request(app)
      .post("/api/stories")
      .set(getAuthHeaders(authorId))
      .send({ title: "T", content: "<p>Hello</p>", status: "published" });

    const storyId = createRes.body?.data?._id as string;

    const forbiddenUpdate = await request(app)
      .put(`/api/stories/${storyId}`)
      .set(getAuthHeaders(otherId))
      .send({ title: "No" });

    expect(forbiddenUpdate.status).toBe(403);

    const okUpdate = await request(app)
      .put(`/api/stories/${storyId}`)
      .set(getAuthHeaders(authorId))
      .send({ title: "Updated" });

    expect(okUpdate.status).toBe(200);

    const forbiddenDelete = await request(app)
      .delete(`/api/stories/${storyId}`)
      .set(getAuthHeaders(otherId));

    expect(forbiddenDelete.status).toBe(403);

    const okDelete = await request(app)
      .delete(`/api/stories/${storyId}`)
      .set(getAuthHeaders(authorId));

    expect(okDelete.status).toBe(200);
  });

  it("increments views for non-author", async () => {
    const app = createTestApp();
    const authorId = "story_user_5";
    const viewerId = "story_user_6";
    await ensureUser(app, authorId);
    await ensureUser(app, viewerId);

    const createRes = await request(app)
      .post("/api/stories")
      .set(getAuthHeaders(authorId))
      .send({ title: "View", content: "<p>Hello</p>", status: "published" });

    const storyId = createRes.body?.data?._id as string;

    const first = await request(app)
      .get(`/api/stories/${storyId}`)
      .set(getAuthHeaders(viewerId));

    expect(first.status).toBe(200);

    const second = await request(app)
      .get(`/api/stories/${storyId}`)
      .set(getAuthHeaders(viewerId));

    expect(second.status).toBe(200);
    expect((second.body?.data?.viewsCount ?? 0) >= 1).toBe(true);
  });
});
