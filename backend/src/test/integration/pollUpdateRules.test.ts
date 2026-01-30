import request from "supertest";
import { describe, expect, it } from "vitest";

import { createTestApp } from "../utils/testApp.js";
import { getAuthHeaders } from "../utils/testAuth.js";
import { Poll } from "../../models/Poll.model.js";

type TestApp = ReturnType<typeof createTestApp>;

const ensureUser = async (app: TestApp, userId: string) => {
  await request(app).post("/api/users").set(getAuthHeaders(userId)).send({});
};

describe("Poll update rules", () => {
  it("rejects update from non-author", async () => {
    const app = createTestApp();
    const authorId = "pur_user_1";
    const otherId = "pur_user_2";
    await ensureUser(app, authorId);
    await ensureUser(app, otherId);

    const createRes = await request(app)
      .post("/api/polls")
      .set(getAuthHeaders(authorId))
      .send({
        question: "Non-author update test question?",
        options: [{ text: "A" }, { text: "B" }],
      });

    expect(createRes.status).toBe(201);
    const pollId = createRes.body?.data?._id as string;

    const updateRes = await request(app)
      .put(`/api/polls/${pollId}`)
      .set(getAuthHeaders(otherId))
      .send({ question: "Updated by non-author" });

    expect(updateRes.status).toBe(403);
  });

  it("vote once then try update => 400", async () => {
    const app = createTestApp();
    const authorId = "pur_user_3";
    const voterId = "pur_user_4";
    await ensureUser(app, authorId);
    await ensureUser(app, voterId);

    const createRes = await request(app)
      .post("/api/polls")
      .set(getAuthHeaders(authorId))
      .send({
        question: "Vote then update test question?",
        options: [{ text: "A" }, { text: "B" }],
      });

    expect(createRes.status).toBe(201);
    const pollId = createRes.body?.data?._id as string;

    const voteRes = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .set(getAuthHeaders(voterId))
      .send({ optionIndices: [0] });

    expect(voteRes.status).toBe(200);

    const updateRes = await request(app)
      .put(`/api/polls/${pollId}`)
      .set(getAuthHeaders(authorId))
      .send({ question: "Try update after vote" });

    expect(updateRes.status).toBe(400);
    expect(String(updateRes.body?.message || "")).toMatch(
      /votes have been cast/i,
    );
  });

  it("does not allow updating restricted fields after expiry", async () => {
    const app = createTestApp();
    const authorId = "pur_user_5";
    await ensureUser(app, authorId);

    const createRes = await request(app)
      .post("/api/polls")
      .set(getAuthHeaders(authorId))
      .send({
        question: "Expiry restrict update question?",
        options: [{ text: "A" }, { text: "B" }],
      });

    expect(createRes.status).toBe(201);
    const pollId = createRes.body?.data?._id as string;

    await Poll.findByIdAndUpdate(pollId, { $set: { status: "expired" } });

    const updateRes = await request(app)
      .put(`/api/polls/${pollId}`)
      .set(getAuthHeaders(authorId))
      .send({
        question: "Try update after expiry",
      });

    expect(updateRes.status).toBe(400);
    expect(String(updateRes.body?.message || "")).toMatch(/expired/i);
  });
});
