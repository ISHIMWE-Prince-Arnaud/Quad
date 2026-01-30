import { describe, expect, it } from "vitest";

import { canViewResults, canVoteOnPoll } from "../utils/poll.util.js";
import type { IPollDocument } from "../models/Poll.model.js";

const makePoll = (overrides?: Partial<Record<string, unknown>>) => {
  const base: Record<string, unknown> = {
    status: "active",
    expiresAt: undefined,
  };
  return { ...base, ...(overrides ?? {}) } as unknown as IPollDocument;
};

describe("poll.util", () => {
  describe("canVoteOnPoll", () => {
    it("returns true for active poll with no expiry", () => {
      const poll = makePoll({ status: "active", expiresAt: undefined });
      expect(canVoteOnPoll(poll)).toBe(true);
    });

    it("returns false for non-active poll", () => {
      const poll = makePoll({ status: "expired" });
      expect(canVoteOnPoll(poll)).toBe(false);
    });

    it("returns false when expiresAt is in the past", () => {
      const poll = makePoll({
        status: "active",
        expiresAt: new Date(Date.now() - 1000),
      });
      expect(canVoteOnPoll(poll)).toBe(false);
    });

    it("returns true when expiresAt is in the future", () => {
      const poll = makePoll({
        status: "active",
        expiresAt: new Date(Date.now() + 60 * 1000),
      });
      expect(canVoteOnPoll(poll)).toBe(true);
    });
  });

  describe("canViewResults", () => {
    it("returns false when user has not voted", () => {
      const poll = makePoll({ status: "active" });
      expect(canViewResults(poll, false)).toBe(false);
    });

    it("returns true when user has voted", () => {
      const poll = makePoll({ status: "active" });
      expect(canViewResults(poll, true)).toBe(true);
    });

    it("returns false for expired poll if user has not voted (after-voting only)", () => {
      const poll = makePoll({
        status: "expired",
        expiresAt: new Date(Date.now() - 1000),
      });
      expect(canViewResults(poll, false)).toBe(false);
    });
  });
});
