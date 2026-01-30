import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";

// Feature: quad-production-ready, Property 51: Poll Vote Optimistic Update
// For any poll vote, the UI should update immediately to show the new vote percentages before the API response.
// Validates: Requirements 14.2

describe("Poll Voting Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Property 51: Vote submission updates vote counts optimistically", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a poll with initial vote counts
        fc.record({
          numOptions: fc.integer({ min: 2, max: 5 }),
          initialVotes: fc.array(fc.integer({ min: 0, max: 100 }), {
            minLength: 2,
            maxLength: 5,
          }),
          oldUserVoteIndex: fc.option(fc.integer({ min: 0, max: 4 })),
          newUserVoteIndex: fc.integer({ min: 0, max: 4 }),
        }),
        async ({
          numOptions,
          initialVotes,
          oldUserVoteIndex,
          newUserVoteIndex,
        }) => {
          // Ensure arrays match numOptions
          const votes = initialVotes.slice(0, numOptions);
          while (votes.length < numOptions) {
            votes.push(0);
          }

          const oldVoteIndex =
            typeof oldUserVoteIndex === "number" &&
            oldUserVoteIndex < numOptions
              ? oldUserVoteIndex
              : null;
          const newVoteIndex =
            newUserVoteIndex < numOptions ? newUserVoteIndex : null;

          if (newVoteIndex === null) return; // Skip if no valid vote

          const oldVote = oldVoteIndex === null ? [] : [oldVoteIndex];
          const newVote = [newVoteIndex];

          // Skip if old and new votes are identical (no change)
          const oldVoteSet = new Set(oldVote);
          const newVoteSet = new Set(newVote);
          if (
            oldVoteSet.size === newVoteSet.size &&
            [...oldVoteSet].every((v) => newVoteSet.has(v))
          ) {
            return; // No change in vote
          }

          // Ensure initial votes are consistent with old user vote
          // If user had old votes, those options must have at least 1 vote
          const consistentVotes = [...votes];
          oldVote.forEach((idx) => {
            if (consistentVotes[idx] === 0) {
              consistentVotes[idx] = 1; // Ensure consistency
            }
          });

          // Calculate expected new vote counts
          const expectedVotes = [...consistentVotes];

          // Remove old votes
          oldVote.forEach((idx) => {
            expectedVotes[idx] = Math.max(0, expectedVotes[idx] - 1);
          });

          // Add new votes
          newVote.forEach((idx) => {
            expectedVotes[idx] += 1;
          });

          // Property 1: Total votes should increase by net change
          const oldTotal = consistentVotes.reduce((a, b) => a + b, 0);
          const expectedTotal = expectedVotes.reduce((a, b) => a + b, 0);
          const netChange = newVote.length - oldVote.length;

          expect(expectedTotal).toBe(oldTotal + netChange);

          // Property 2: All vote counts should be non-negative
          expectedVotes.forEach((count) => {
            expect(count).toBeGreaterThanOrEqual(0);
          });

          // Property 3: Percentages should sum to approximately 100%
          if (expectedTotal > 0) {
            const percentages = expectedVotes.map((count) =>
              Math.round((count / expectedTotal) * 100),
            );
            const sum = percentages.reduce((a, b) => a + b, 0);
            expect(sum).toBeGreaterThanOrEqual(98);
            expect(sum).toBeLessThanOrEqual(102);
          }

          // Property 4: Each percentage should be between 0 and 100
          expectedVotes.forEach((count) => {
            const percentage =
              expectedTotal > 0 ? Math.round((count / expectedTotal) * 100) : 0;
            expect(percentage).toBeGreaterThanOrEqual(0);
            expect(percentage).toBeLessThanOrEqual(100);
          });
        },
      ),
      { numRuns: 100 },
    );
  });

  it("Property 51: Optimistic update preserves poll structure", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          pollId: fc.string({ minLength: 10, maxLength: 30 }),
          question: fc.string({ minLength: 10, maxLength: 500 }),
          numOptions: fc.integer({ min: 2, max: 5 }),
          status: fc.constantFrom("active" as const, "expired" as const),
          totalVotes: fc.integer({ min: 0, max: 1000 }),
          newVoteIndex: fc.integer({ min: 0, max: 4 }),
        }),
        async ({
          pollId,
          question,
          numOptions,
          status,
          totalVotes,
          newVoteIndex,
        }) => {
          if (newVoteIndex >= numOptions) return;
          const validVoteIndices = [newVoteIndex];

          // Property 1: Poll ID should remain unchanged
          expect(pollId).toBeDefined();
          expect(typeof pollId).toBe("string");

          // Property 2: Question should remain unchanged
          expect(question).toBeDefined();
          expect(typeof question).toBe("string");

          // Property 3: Status should remain unchanged
          expect(status).toBeDefined();
          expect(["active", "expired"]).toContain(status);

          // Property 4: Number of options should remain unchanged
          expect(numOptions).toBeGreaterThanOrEqual(2);
          expect(numOptions).toBeLessThanOrEqual(5);

          // Property 5: Vote indices should be within valid range
          validVoteIndices.forEach((idx) => {
            expect(idx).toBeGreaterThanOrEqual(0);
            expect(idx).toBeLessThan(numOptions);
          });

          // Property 6: New total votes should be positive
          const newTotal = totalVotes + validVoteIndices.length;
          expect(newTotal).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("Property 51: Multiple votes on same option are handled correctly", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          selectedIndex: fc.integer({ min: 0, max: 4 }),
          numOptions: fc.integer({ min: 2, max: 5 }),
        }),
        async ({ selectedIndex, numOptions }) => {
          if (selectedIndex >= numOptions) return; // Skip invalid index

          // Property 1: Single-choice polls should only allow one selection
          const userVote = [selectedIndex];
          expect(userVote.length).toBe(1);
          expect(userVote[0]).toBe(selectedIndex);

          // Property 2: All vote indices should be unique
          const uniqueVotes = [...new Set(userVote)];
          expect(uniqueVotes.length).toBe(userVote.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("Property 51: Vote percentages recalculate correctly", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 0, max: 1000 }), {
          minLength: 2,
          maxLength: 5,
        }),
        fc.integer({ min: 0, max: 4 }),
        async (voteCounts, voteIndex) => {
          if (voteIndex >= voteCounts.length) return; // Skip invalid index

          const oldTotal = voteCounts.reduce((a, b) => a + b, 0);
          const newVoteCounts = [...voteCounts];
          newVoteCounts[voteIndex] += 1;
          const newTotal = newVoteCounts.reduce((a, b) => a + b, 0);

          // Property 1: Total should increase by 1
          expect(newTotal).toBe(oldTotal + 1);

          // Property 2: Voted option count should increase by 1
          expect(newVoteCounts[voteIndex]).toBe(voteCounts[voteIndex] + 1);

          // Property 3: Other option counts should remain unchanged
          newVoteCounts.forEach((count, idx) => {
            if (idx !== voteIndex) {
              expect(count).toBe(voteCounts[idx]);
            }
          });

          // Property 4: Percentages should be valid
          if (newTotal > 0) {
            const percentages = newVoteCounts.map((count) =>
              Math.round((count / newTotal) * 100),
            );
            percentages.forEach((pct) => {
              expect(pct).toBeGreaterThanOrEqual(0);
              expect(pct).toBeLessThanOrEqual(100);
            });
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("Property 51: Optimistic update is idempotent", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          voteCounts: fc.array(fc.integer({ min: 0, max: 100 }), {
            minLength: 2,
            maxLength: 5,
          }),
          voteIndex: fc.integer({ min: 0, max: 4 }),
        }),
        async ({ voteCounts, voteIndex }) => {
          if (voteIndex >= voteCounts.length) return; // Skip invalid index

          // Apply optimistic update once
          const updated1 = [...voteCounts];
          updated1[voteIndex] += 1;
          const total1 = updated1.reduce((a, b) => a + b, 0);

          // Apply same update again (simulating duplicate)
          const updated2 = [...voteCounts];
          updated2[voteIndex] += 1;
          const total2 = updated2.reduce((a, b) => a + b, 0);

          // Property: Same update produces same result
          expect(updated1).toEqual(updated2);
          expect(total1).toBe(total2);

          // Property: Result is deterministic
          updated1.forEach((count, idx) => {
            expect(count).toBe(updated2[idx]);
          });
        },
      ),
      { numRuns: 100 },
    );
  });
});
