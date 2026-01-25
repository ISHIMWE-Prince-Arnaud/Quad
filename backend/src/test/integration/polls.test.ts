import request from "supertest";
import { describe, expect, it } from "vitest";

import { createTestApp } from "../utils/testApp.js";
import { getAuthHeaders } from "../utils/testAuth.js";
import { Poll } from "../../models/Poll.model.js";

type TestApp = ReturnType<typeof createTestApp>;

const ensureUser = async (app: TestApp, userId: string) => {
  await request(app).post("/api/users").set(getAuthHeaders(userId)).send({});
};

describe("Polls CRUD", () => {
  it("creates poll and it appears in polls list", async () => {
    const app = createTestApp();
    const userId = "poll_user_1";
    await ensureUser(app, userId);

    const createRes = await request(app)
      .post("/api/polls")
      .set(getAuthHeaders(userId))
      .send({
        question: "What is your favorite color?",
        options: [{ text: "Blue" }, { text: "Red" }],
      });

    expect(createRes.status).toBe(201);
    const pollId = createRes.body?.data?._id as string;

    const listRes = await request(app)
      .get("/api/polls?status=all&page=1&limit=20")
      .set(getAuthHeaders(userId));

    expect(listRes.status).toBe(200);
    const polls = (listRes.body?.data ?? []) as Array<{ id?: string }>;
    expect(polls.some((p) => p.id === pollId)).toBe(true);
  });

  it("votes on poll and prevents duplicate vote", async () => {
    const app = createTestApp();
    const authorId = "poll_user_2";
    const voterId = "poll_user_3";
    await ensureUser(app, authorId);
    await ensureUser(app, voterId);

    const createRes = await request(app)
      .post("/api/polls")
      .set(getAuthHeaders(authorId))
      .send({
        question: "Which day is best?",
        options: [{ text: "Sat" }, { text: "Sun" }],
      });

    const pollId = createRes.body?.data?._id as string;

    const voteRes = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .set(getAuthHeaders(voterId))
      .send({ optionIndices: [0] });

    expect(voteRes.status).toBe(200);
    expect(voteRes.body?.success).toBe(true);

    const dup = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .set(getAuthHeaders(voterId))
      .send({ optionIndices: [1] });

    expect(dup.status).toBe(400);
  });

  it("does not allow voting on closed poll", async () => {
    const app = createTestApp();
    const authorId = "poll_user_4";
    const voterId = "poll_user_5";
    await ensureUser(app, authorId);
    await ensureUser(app, voterId);

    const createRes = await request(app)
      .post("/api/polls")
      .set(getAuthHeaders(authorId))
      .send({
        question: "Close test question?",
        options: [{ text: "A" }, { text: "B" }],
      });

    const pollId = createRes.body?.data?._id as string;

    const closeRes = await request(app)
      .post(`/api/polls/${pollId}/close`)
      .set(getAuthHeaders(authorId));

    expect(closeRes.status).toBe(200);

    const voteRes = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .set(getAuthHeaders(voterId))
      .send({ optionIndices: [0] });

    expect(voteRes.status).toBe(400);
  });

  it("does not allow voting when expiresAt is in the past", async () => {
    const app = createTestApp();
    const authorId = "poll_user_6";
    const voterId = "poll_user_7";
    await ensureUser(app, authorId);
    await ensureUser(app, voterId);

    const createRes = await request(app)
      .post("/api/polls")
      .set(getAuthHeaders(authorId))
      .send({
        question: "Expiry test question?",
        options: [{ text: "A" }, { text: "B" }],
      });

    const pollId = createRes.body?.data?._id as string;

    await Poll.findByIdAndUpdate(pollId, { $set: { expiresAt: new Date(Date.now() - 1000) } });

    const voteRes = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .set(getAuthHeaders(voterId))
      .send({ optionIndices: [0] });

    expect(voteRes.status).toBe(400);
  });
});
