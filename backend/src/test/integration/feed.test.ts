import request from "supertest";
import { describe, expect, it } from "vitest";

import { createTestApp } from "../utils/testApp.js";
import { getAuthHeaders } from "../utils/testAuth.js";

type TestApp = ReturnType<typeof createTestApp>;

const ensureUser = async (app: TestApp, userId: string) => {
  await request(app).post("/api/users").set(getAuthHeaders(userId)).send({});
};

describe("Feed API", () => {
  it("following feed is empty when user follows nobody", async () => {
    const app = createTestApp();
    const userId = "feed_user_1";
    await ensureUser(app, userId);

    const res = await request(app)
      .get("/api/feed/following")
      .set(getAuthHeaders(userId))
      .query({ tab: "home", limit: "10", sort: "newest" });

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(res.body?.data?.items?.length).toBe(0);
  });

  it("following feed returns content from followed users", async () => {
    const app = createTestApp();
    const viewerId = "feed_user_2";
    const authorId = "feed_user_3";
    await ensureUser(app, viewerId);
    await ensureUser(app, authorId);

    await request(app)
      .post("/api/posts")
      .set(getAuthHeaders(authorId))
      .send({
        text: "From author",
        media: [{ url: "https://example.com/a.jpg", type: "image" }],
      });

    await request(app)
      .post(`/api/follow/${authorId}`)
      .set(getAuthHeaders(viewerId));

    const res = await request(app)
      .get("/api/feed/following")
      .set(getAuthHeaders(viewerId))
      .query({ tab: "posts", limit: "10", sort: "newest" });

    expect(res.status).toBe(200);
    expect(res.body?.data?.items?.length).toBe(1);
  });

  it("for you feed returns mixed content", async () => {
    const app = createTestApp();
    const userId = "feed_user_4";
    await ensureUser(app, userId);

    await request(app)
      .post("/api/posts")
      .set(getAuthHeaders(userId))
      .send({
        text: "P1",
        media: [{ url: "https://example.com/a.jpg", type: "image" }],
      });

    await request(app)
      .post("/api/polls")
      .set(getAuthHeaders(userId))
      .send({
        question: "Is this a poll question?",
        options: [{ text: "Yes" }, { text: "No" }],
      });

    await request(app)
      .post("/api/stories")
      .set(getAuthHeaders(userId))
      .send({ title: "S", content: "<p>Hello</p>", status: "published" });

    const res = await request(app)
      .get("/api/feed/foryou")
      .set(getAuthHeaders(userId))
      .query({ tab: "home", limit: "10", sort: "newest" });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.data?.items)).toBe(true);
    expect(res.body?.data?.items?.length).toBeGreaterThan(0);
  });

  it("feed pagination works with cursor", async () => {
    const app = createTestApp();
    const userId = "feed_user_5";
    await ensureUser(app, userId);

    await request(app)
      .post("/api/posts")
      .set(getAuthHeaders(userId))
      .send({
        text: "P1",
        media: [{ url: "https://example.com/a1.jpg", type: "image" }],
      });

    await request(app)
      .post("/api/posts")
      .set(getAuthHeaders(userId))
      .send({
        text: "P2",
        media: [{ url: "https://example.com/a2.jpg", type: "image" }],
      });

    const first = await request(app)
      .get("/api/feed/foryou")
      .set(getAuthHeaders(userId))
      .query({ tab: "posts", limit: "1", sort: "newest" });

    expect(first.status).toBe(200);
    const cursor = first.body?.data?.pagination?.nextCursor as string | undefined;
    expect(typeof cursor).toBe("string");

    const second = await request(app)
      .get("/api/feed/foryou")
      .set(getAuthHeaders(userId))
      .query({ tab: "posts", limit: "2", sort: "newest", cursor });

    expect(second.status).toBe(200);
    expect(second.body?.data?.items?.length).toBeGreaterThan(0);
  });

  it("new content count returns count", async () => {
    const app = createTestApp();
    const userId = "feed_user_6";
    await ensureUser(app, userId);

    await request(app)
      .post("/api/posts")
      .set(getAuthHeaders(userId))
      .send({
        text: "P1",
        media: [{ url: "https://example.com/a.jpg", type: "image" }],
      });

    const res = await request(app)
      .get("/api/feed/new-count")
      .set(getAuthHeaders(userId))
      .query({ feedType: "foryou", tab: "posts", since: "000000000000000000000000" });

    expect(res.status).toBe(200);
    expect(typeof res.body?.data?.count).toBe("number");
  });
});
