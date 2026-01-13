import request from "supertest";
import { describe, expect, it } from "vitest";

import { createTestApp } from "../utils/testApp.js";
import { getAuthHeaders } from "../utils/testAuth.js";

type TestApp = ReturnType<typeof createTestApp>;

const ensureUser = async (app: TestApp, userId: string) => {
  await request(app).post("/api/users").set(getAuthHeaders(userId)).send({});
};

describe("Bookmarks API", () => {
  it("toggles bookmark and lists bookmarks", async () => {
    const app = createTestApp();
    const userId = "bm_user_1";
    await ensureUser(app, userId);

    const postRes = await request(app)
      .post("/api/posts")
      .set(getAuthHeaders(userId))
      .send({
        text: "Bookmark me",
        media: [{ url: "https://example.com/a.jpg", type: "image" }],
      });

    const postId = postRes.body?.data?._id as string;

    const toggleOn = await request(app)
      .post("/api/bookmarks")
      .set(getAuthHeaders(userId))
      .send({ contentType: "post", contentId: postId });

    expect(toggleOn.status).toBe(201);
    expect(toggleOn.body?.bookmarked).toBe(true);

    const check = await request(app)
      .get(`/api/bookmarks/post/${postId}/check`)
      .set(getAuthHeaders(userId));

    expect(check.status).toBe(200);
    expect(check.body?.data?.bookmarked).toBe(true);

    const list = await request(app)
      .get("/api/bookmarks")
      .set(getAuthHeaders(userId))
      .query({ page: "1", limit: "20" });

    expect(list.status).toBe(200);
    expect(list.body?.data?.length).toBe(1);

    const toggleOff = await request(app)
      .post("/api/bookmarks")
      .set(getAuthHeaders(userId))
      .send({ contentType: "post", contentId: postId });

    expect(toggleOff.status).toBe(200);
    expect(toggleOff.body?.bookmarked).toBe(false);
  });
});
