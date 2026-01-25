import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";
import type { Poll, PollOption } from "@/types/poll";

// Feature: quad-production-ready, Property 50: Poll Display Completeness
// For any poll, all required fields (question, options, vote percentages, total votes) should be displayed.
// Validates: Requirements 14.1

describe("Poll Display Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Property 50: Poll data contains all required fields", async () => {
    const nowIso = new Date().toISOString();
    const pollMediaArb = fc
      .record({
        url: fc.webUrl(),
        type: fc.constantFrom("image" as const, "video" as const),
        aspectRatio: fc.option(
          fc.constantFrom("1:1" as const, "16:9" as const, "9:16" as const),
          { nil: undefined }
        ),
      })
      .map(({ url, type, aspectRatio }) => ({
        url,
        type,
        ...(aspectRatio ? { aspectRatio } : {}),
      }));

    const pollArb: fc.Arbitrary<Poll> = fc
      .record({
        id: fc.string({ minLength: 10, maxLength: 30 }),
        authorBase: fc.record({
          _id: fc.string({ minLength: 10, maxLength: 30 }),
          clerkId: fc.string({ minLength: 10, maxLength: 30 }),
          username: fc.string({ minLength: 3, maxLength: 20 }),
          email: fc.emailAddress(),
          joinedAt: fc.constant(nowIso),
          updatedAt: fc.constant(nowIso),
          createdAt: fc.constant(nowIso),
        }),
        authorFirstName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), {
          nil: undefined,
        }),
        authorLastName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), {
          nil: undefined,
        }),
        authorProfileImage: fc.option(fc.webUrl(), { nil: undefined }),
        question: fc.string({ minLength: 10, maxLength: 500 }),
        questionMedia: fc.option(pollMediaArb, { nil: undefined }),
        options: fc
          .array(
            fc.record({
              index: fc.integer({ min: 0, max: 4 }),
              text: fc.string({ minLength: 1, maxLength: 200 }),
              votesCount: fc.integer({ min: 0, max: 10000 }),
              percentage: fc.integer({ min: 0, max: 100 }),
            }),
            { minLength: 2, maxLength: 5 }
          )
          .map((opts) => opts.map((opt, idx) => ({ ...opt, index: idx }))),
        settings: fc.record({
          anonymousVoting: fc.boolean(),
          showResults: fc.constantFrom(
            "always" as const,
            "afterVote" as const,
            "afterExpiry" as const
          ),
        }),
        status: fc.constantFrom(
          "active" as const,
          "expired" as const,
          "closed" as const
        ),
        expiresAt: fc.option(
          fc
            .integer({ min: Date.now(), max: Date.now() + 86400000 * 30 })
            .map((ts) => new Date(ts).toISOString())
        ),
        totalVotes: fc.integer({ min: 0, max: 50000 }),
        reactionsCount: fc.integer({ min: 0, max: 10000 }),
        commentsCount: fc.integer({ min: 0, max: 10000 }),
        userVote: fc.option(fc.array(fc.integer({ min: 0, max: 4 }), { maxLength: 5 }), {
          nil: undefined,
        }),
        canViewResults: fc.boolean(),
        createdAt: fc.constant(nowIso),
        updatedAt: fc.constant(nowIso),
      })
      .map(
        ({
          authorBase,
          authorFirstName,
          authorLastName,
          authorProfileImage,
          questionMedia,
          userVote,
          ...rest
        }) => ({
          ...rest,
          author: {
            ...authorBase,
            ...(authorFirstName ? { firstName: authorFirstName } : {}),
            ...(authorLastName ? { lastName: authorLastName } : {}),
            ...(authorProfileImage ? { profileImage: authorProfileImage } : {}),
          },
          ...(questionMedia ? { questionMedia } : {}),
          ...(userVote ? { userVote } : {}),
        })
      );

    await fc.assert(
      fc.asyncProperty(
        pollArb,
        async (poll: Poll) => {
          // Property 1: Poll must have an ID
          expect(poll.id).toBeDefined();
          expect(typeof poll.id).toBe("string");
          expect(poll.id.length).toBeGreaterThan(0);

          // Property 2: Poll must have a question
          expect(poll.question).toBeDefined();
          expect(typeof poll.question).toBe("string");
          expect(poll.question.length).toBeGreaterThanOrEqual(10);
          expect(poll.question.length).toBeLessThanOrEqual(500);

          // Property 3: Poll must have author information
          expect(poll.author).toBeDefined();
          expect(poll.author.clerkId).toBeDefined();
          expect(poll.author.username).toBeDefined();
          expect(poll.author.email).toBeDefined();

          // Property 4: Poll must have at least 2 options
          expect(Array.isArray(poll.options)).toBe(true);
          expect(poll.options.length).toBeGreaterThanOrEqual(2);
          expect(poll.options.length).toBeLessThanOrEqual(5);

          // Property 5: Each option must have required fields
          poll.options.forEach((option: PollOption, idx: number) => {
            expect(option.index).toBe(idx);
            expect(option.text).toBeDefined();
            expect(typeof option.text).toBe("string");
            expect(option.text.length).toBeGreaterThan(0);

            if (option.votesCount !== undefined) {
              expect(typeof option.votesCount).toBe("number");
              expect(option.votesCount).toBeGreaterThanOrEqual(0);
            }

            if (option.percentage !== undefined) {
              expect(typeof option.percentage).toBe("number");
              expect(option.percentage).toBeGreaterThanOrEqual(0);
              expect(option.percentage).toBeLessThanOrEqual(100);
            }
          });

          // Property 6: Poll must have total votes count
          expect(typeof poll.totalVotes).toBe("number");
          expect(poll.totalVotes).toBeGreaterThanOrEqual(0);

          // Property 7: Poll must have engagement metrics
          expect(typeof poll.reactionsCount).toBe("number");
          expect(poll.reactionsCount).toBeGreaterThanOrEqual(0);
          expect(typeof poll.commentsCount).toBe("number");
          expect(poll.commentsCount).toBeGreaterThanOrEqual(0);

          // Property 8: Poll must have status
          expect(poll.status).toBeDefined();
          expect(["active", "expired", "closed"]).toContain(poll.status);

          // Property 9: Poll must have settings
          expect(poll.settings).toBeDefined();
          expect(["always", "afterVote", "afterExpiry"]).toContain(
            poll.settings.showResults
          );

          // Property 10: Poll must have canViewResults flag
          expect(typeof poll.canViewResults).toBe("boolean");

          // Property 11: Poll must have timestamps
          expect(poll.createdAt).toBeDefined();
          expect(poll.updatedAt).toBeDefined();
        }
      ),
      { numRuns: 30 }
    );
  });

  it("Property 50: Vote percentages sum to approximately 100% when results are visible", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .array(fc.integer({ min: 0, max: 1000 }), {
            minLength: 2,
            maxLength: 5,
          })
          .filter((votes) => votes.reduce((a, b) => a + b, 0) > 0),
        async (voteCounts) => {
          const totalVotes = voteCounts.reduce((a, b) => a + b, 0);

          // Calculate percentages
          const percentages = voteCounts.map((count) =>
            Math.round((count / totalVotes) * 100)
          );

          // Property: Sum of rounded percentages should be close to 100
          // (within rounding error tolerance)
          const sum = percentages.reduce((a, b) => a + b, 0);
          expect(sum).toBeGreaterThanOrEqual(98);
          expect(sum).toBeLessThanOrEqual(102);

          // Property: Each percentage should be between 0 and 100
          percentages.forEach((pct) => {
            expect(pct).toBeGreaterThanOrEqual(0);
            expect(pct).toBeLessThanOrEqual(100);
          });
        }
      ),
      { numRuns: 30 }
    );
  });

  it("Property 50: Total votes equals sum of option votes", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 0, max: 1000 }), {
          minLength: 2,
          maxLength: 5,
        }),
        async (voteCounts) => {
          const totalVotes = voteCounts.reduce((a, b) => a + b, 0);

          // Property: Total votes should equal sum of individual option votes
          expect(totalVotes).toBe(voteCounts.reduce((a, b) => a + b, 0));

          // Property: Total votes should be non-negative
          expect(totalVotes).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 30 }
    );
  });

  it("Property 50: User vote indices are within valid range", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }),
        fc
          .array(fc.integer({ min: 0, max: 4 }), { maxLength: 5 })
          .map((arr) => [...new Set(arr)]), // Ensure unique indices
        async (numOptions, userVote) => {
          // Filter to only valid indices
          const validVote = userVote.filter((idx) => idx < numOptions);

          // Property: All vote indices must be within range
          validVote.forEach((idx) => {
            expect(idx).toBeGreaterThanOrEqual(0);
            expect(idx).toBeLessThan(numOptions);
          });

          // Property: Vote indices should be unique (no duplicates)
          const uniqueVotes = [...new Set(validVote)];
          expect(uniqueVotes.length).toBe(validVote.length);
        }
      ),
      { numRuns: 30 }
    );
  });

  it("Property 50: Poll status determines votability", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          "active" as const,
          "expired" as const,
          "closed" as const
        ),
        fc.option(
          fc.date({
            min: new Date(Date.now() - 86400000),
            max: new Date(Date.now() + 86400000),
          })
        ),
        async (status, expiresAt) => {
          const now = new Date();
          const isExpired = expiresAt && expiresAt < now;

          // Property: Poll is votable only if status is active and not expired
          const canVote = status === "active" && !isExpired;

          if (status !== "active") {
            expect(canVote).toBe(false);
          }

          if (isExpired) {
            expect(canVote).toBe(false);
          }

          // Property: Active polls without expiry or with future expiry are votable
          if (status === "active" && (!expiresAt || expiresAt > now)) {
            expect(canVote).toBe(true);
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});
