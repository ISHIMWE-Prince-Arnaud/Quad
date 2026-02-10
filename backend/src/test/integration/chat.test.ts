import request from "supertest";
import { describe, expect, it } from "vitest";

import { createTestApp } from "../utils/testApp.js";
import { getAuthHeaders } from "../utils/testAuth.js";

type TestApp = ReturnType<typeof createTestApp>;

const ensureUser = async (app: TestApp, userId: string) => {
  await request(app).post("/api/users").set(getAuthHeaders(userId)).send({});
};

describe("Chat API", () => {
  it("sends and lists messages", async () => {
    const app = createTestApp();
    const userId = "chat_user_1";
    await ensureUser(app, userId);

    const sendRes = await request(app)
      .post("/api/chat/messages")
      .set(getAuthHeaders(userId))
      .send({ text: "Hello" });

    expect(sendRes.status).toBe(201);

    const listRes = await request(app)
      .get("/api/chat/messages")
      .set(getAuthHeaders(userId))
      .query({ page: "1", limit: "20" });

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body?.data)).toBe(true);
    expect(listRes.body?.data?.length).toBe(1);
  });

  it("edits and deletes message author-only", async () => {
    const app = createTestApp();
    const authorId = "chat_user_2";
    const otherId = "chat_user_3";
    await ensureUser(app, authorId);
    await ensureUser(app, otherId);

    const sendRes = await request(app)
      .post("/api/chat/messages")
      .set(getAuthHeaders(authorId))
      .send({ text: "Original" });

    const messageId = sendRes.body?.data?.id as string;

    const forbiddenEdit = await request(app)
      .put(`/api/chat/messages/${messageId}`)
      .set(getAuthHeaders(otherId))
      .send({ text: "No" });

    expect(forbiddenEdit.status).toBe(403);

    const okEdit = await request(app)
      .put(`/api/chat/messages/${messageId}`)
      .set(getAuthHeaders(authorId))
      .send({ text: "Edited" });

    expect(okEdit.status).toBe(200);

    const forbiddenDelete = await request(app)
      .delete(`/api/chat/messages/${messageId}`)
      .set(getAuthHeaders(otherId));

    expect(forbiddenDelete.status).toBe(403);

    const okDelete = await request(app)
      .delete(`/api/chat/messages/${messageId}`)
      .set(getAuthHeaders(authorId));

    expect(okDelete.status).toBe(200);
  });

  it("does not support reactions", async () => {
    const app = createTestApp();
    const authorId = "chat_user_4";
    const reactorId = "chat_user_5";
    await ensureUser(app, authorId);
    await ensureUser(app, reactorId);

    const sendRes = await request(app)
      .post("/api/chat/messages")
      .set(getAuthHeaders(authorId))
      .send({ text: "Hello" });

    const messageId = sendRes.body?.data?.id as string;

    const add = await request(app)
      .post(`/api/chat/messages/${messageId}/reactions`)
      .set(getAuthHeaders(reactorId))
      .send({ emoji: "❤️" });

    expect(add.status).toBe(404);

    const remove = await request(app)
      .delete(`/api/chat/messages/${messageId}/reactions`)
      .set(getAuthHeaders(reactorId));

    expect(remove.status).toBe(404);
  });
});
