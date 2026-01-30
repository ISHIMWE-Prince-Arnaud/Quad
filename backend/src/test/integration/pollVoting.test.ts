import request from "supertest";
import { describe, expect, it } from "vitest";

import { createTestApp } from "../utils/testApp.js";
import { getAuthHeaders } from "../utils/testAuth.js";
import { Poll } from "../../models/Poll.model.js";

type TestApp = ReturnType<typeof createTestApp>;

const ensureUser = async (app: TestApp, userId: string) => {
  await request(app).post("/api/users").set(getAuthHeaders(userId)).send({});
};

describe("Poll Voting", () => {
  it("allows single vote", async () => {
    const app = createTestApp();
    const authorId = "pv_user_1";
    const voterId = "pv_user_2";
    await ensureUser(app, authorId);
    await ensureUser(app, voterId);

    const createRes = await request(app)
      .post("/api/polls")
      .set(getAuthHeaders(authorId))
      .send({
        question: "Single vote question?",
        options: [{ text: "A" }, { text: "B" }],
      });

    const pollId = createRes.body?.data?._id as string;

    const voteRes = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .set(getAuthHeaders(voterId))
      .send({ optionIndices: [0] });

    expect(voteRes.status).toBe(200);
    expect(voteRes.body?.data?.userVote?.length).toBe(1);
  });

  it("rejects multiple selections", async () => {
    const app = createTestApp();
    const authorId = "pv_user_3";
    const voterId = "pv_user_4";
    await ensureUser(app, authorId);
    await ensureUser(app, voterId);

    const createRes = await request(app)
      .post("/api/polls")
      .set(getAuthHeaders(authorId))
      .send({
        question: "Multiple selection question?",
        options: [{ text: "A" }, { text: "B" }, { text: "C" }],
        settings: { anonymousVoting: true },
      });

    const pollId = createRes.body?.data?._id as string;

    const voteRes = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .set(getAuthHeaders(voterId))
      .send({ optionIndices: [0, 2] });

    expect(voteRes.status).toBe(400);
  });

  it("prevents voting on expired poll", async () => {
    const app = createTestApp();
    const authorId = "pv_user_5";
    const voterId = "pv_user_6";
    await ensureUser(app, authorId);
    await ensureUser(app, voterId);

    const createRes = await request(app)
      .post("/api/polls")
      .set(getAuthHeaders(authorId))
      .send({
        question: "Expired vote question?",
        options: [{ text: "A" }, { text: "B" }],
      });

    const pollId = createRes.body?.data?._id as string;

    await Poll.findByIdAndUpdate(pollId, {
      $set: { expiresAt: new Date(Date.now() - 1000) },
    });

    const voteRes = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .set(getAuthHeaders(voterId))
      .send({ optionIndices: [0] });

    expect(voteRes.status).toBe(400);
  });

  it("prevents voting on expired poll (status flag)", async () => {
    const app = createTestApp();
    const authorId = "pv_user_7";
    const voterId = "pv_user_8";
    await ensureUser(app, authorId);
    await ensureUser(app, voterId);

    const createRes = await request(app)
      .post("/api/polls")
      .set(getAuthHeaders(authorId))
      .send({
        question: "Expired status vote question?",
        options: [{ text: "A" }, { text: "B" }],
      });

    const pollId = createRes.body?.data?._id as string;

    await Poll.findByIdAndUpdate(pollId, { $set: { status: "expired" } });

    const voteRes = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .set(getAuthHeaders(voterId))
      .send({ optionIndices: [0] });

    expect(voteRes.status).toBe(400);
  });
});
