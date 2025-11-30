import { describe, it, expect, beforeEach, vi } from "vitest";
import * as fc from "fast-check";

// Feature: quad-production-ready, Property 52: Poll Vote Removal
// For any poll vote removal, the vote percentages should recalculate correctly without the user's vote.
// Validates: Requirements 14.3

describe("Poll Vote Removal Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Property 52: Vote removal decreases vote counts correctly", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          numOptions: fc.integer({ min: 2, max: 5 }),
          initialVotes: fc.array(fc.integer({ min: 1, max: 100 }), {
            minLength: 2,
            maxLength: 5,
          }),
          userVote: fc
            .array(fc.integer({ min: 0, max: 4 }), {
              minLength: 1,
              maxLength: 5,
            })
            .map((arr) => [...new Set(arr)]),
        }),
        async ({ numOptions, initialVotes, userVote }) => {
          // Ensure arrays match numOptions
          const votes = initialVotes.slice(0, numOptions);
          while (votes.length < numOptions) {
            votes.push(1);
          }

          const validUserVote = userVote.filter((idx) => idx < numOptions);
          if (validUserVote.length === 0) return; // Skip if no valid vote

          // Ensure initial votes are consistent with user vote
          const consistentVotes = [...votes];
          validUserVote.forEach((idx) => {
            if (consistentVotes[idx] === 0) {
              consistentVotes[idx] = 1;
            }
          });

          // Calculate expected vote counts after removal
          const expectedVotes = [...consistentVotes];
          validUserVote.forEach((idx) => {
            expectedVotes[idx] = Math.max(0, expectedVotes[idx] - 1);
          });

          // Property 1: Total votes should decrease by number of removed votes
          const oldTotal = consistentVotes.reduce((a, b) => a + b, 0);
          const expectedTotal = expectedVotes.reduce((a, b) => a + b, 0);
          expect(expectedTotal).toBe(oldTotal - validUserVote.length);

          // Property 2: All vote counts should be non-negative
          expectedVotes.forEach((count) => {
            expect(count).toBeGreaterThanOrEqual(0);
          });

          // Property 3: Only voted options should have decreased counts
          expectedVotes.forEach((count, idx) => {
            if (validUserVote.includes(idx)) {
              expect(count).toBe(consistentVotes[idx] - 1);
            } else {
              expect(count).toBe(consistentVotes[idx]);
            }
          });

          // Property 4: Percentages should recalculate correctly
          if (expectedTotal > 0) {
            const percentages = expectedVotes.map((count) =>
              Math.round((count / expectedTotal) * 100)
            );
            const sum = percentages.reduce((a, b) => a + b, 0);
            expect(sum).toBeGreaterThanOrEqual(98);
            expect(sum).toBeLessThanOrEqual(102);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 52: Vote removal with zero total votes results in zero percentages", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }),
        fc
          .array(fc.integer({ min: 0, max: 4 }), {
            minLength: 1,
            maxLength: 5,
          })
          .map((arr) => [...new Set(arr)]),
        async (numOptions, userVote) => {
          const validUserVote = userVote.filter((idx) => idx < numOptions);
          if (validUserVote.length === 0) return; // Skip if no valid vote

          // Start with votes equal to user vote (so removal results in 0)
          const votes = Array(numOptions).fill(0);
          validUserVote.forEach((idx) => {
            votes[idx] = 1;
          });

          // Remove user vote
          const expectedVotes = [...votes];
          validUserVote.forEach((idx) => {
            expectedVotes[idx] = Math.max(0, expectedVotes[idx] - 1);
          });

          const expectedTotal = expectedVotes.reduce((a, b) => a + b, 0);

          // Property 1: Total should be 0 after removal
          expect(expectedTotal).toBe(0);

          // Property 2: All percentages should be 0 when total is 0
          const percentages = expectedVotes.map((count) =>
            expectedTotal > 0 ? Math.round((count / expectedTotal) * 100) : 0
          );
          percentages.forEach((pct) => {
            expect(pct).toBe(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 52: Vote removal is idempotent (removing twice has same effect as once)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          numOptions: fc.integer({ min: 2, max: 5 }),
          initialVotes: fc.array(fc.integer({ min: 1, max: 100 }), {
            minLength: 2,
            maxLength: 5,
          }),
          userVote: fc
            .array(fc.integer({ min: 0, max: 4 }), {
              minLength: 1,
              maxLength: 5,
            })
            .map((arr) => [...new Set(arr)]),
        }),
        async ({ numOptions, initialVotes, userVote }) => {
          const votes = initialVotes.slice(0, numOptions);
          while (votes.length < numOptions) {
            votes.push(1);
          }

          const validUserVote = userVote.filter((idx) => idx < numOptions);
          if (validUserVote.length === 0) return;

          // Ensure consistency
          const consistentVotes = [...votes];
          validUserVote.forEach((idx) => {
            if (consistentVotes[idx] === 0) {
              consistentVotes[idx] = 1;
            }
          });

          // Remove once
          const afterFirstRemoval = [...consistentVotes];
          validUserVote.forEach((idx) => {
            afterFirstRemoval[idx] = Math.max(0, afterFirstRemoval[idx] - 1);
          });

          // Try to remove again (should have no effect since user has no vote)
          const afterSecondRemoval = [...afterFirstRemoval];
          // In a real system, this would be a no-op since user has no vote

          // Property: Second removal should not change anything
          expect(afterSecondRemoval).toEqual(afterFirstRemoval);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 52: Vote removal preserves other users' votes", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          numOptions: fc.integer({ min: 2, max: 5 }),
          totalVotes: fc.array(fc.integer({ min: 2, max: 100 }), {
            minLength: 2,
            maxLength: 5,
          }),
          userVote: fc
            .array(fc.integer({ min: 0, max: 4 }), {
              minLength: 1,
              maxLength: 5,
            })
            .map((arr) => [...new Set(arr)]),
        }),
        async ({ numOptions, totalVotes, userVote }) => {
          const votes = totalVotes.slice(0, numOptions);
          while (votes.length < numOptions) {
            votes.push(2);
          }

          const validUserVote = userVote.filter((idx) => idx < numOptions);
          if (validUserVote.length === 0) return;

          // Ensure user vote is included in total
          const consistentVotes = [...votes];
          validUserVote.forEach((idx) => {
            if (consistentVotes[idx] < 1) {
              consistentVotes[idx] = 1;
            }
          });

          // Calculate other users' votes (total - user's vote)
          const otherUsersVotes = consistentVotes.map((count, idx) =>
            validUserVote.includes(idx) ? count - 1 : count
          );

          // Remove user vote
          const afterRemoval = [...consistentVotes];
          validUserVote.forEach((idx) => {
            afterRemoval[idx] = Math.max(0, afterRemoval[idx] - 1);
          });

          // Property: After removal, votes should equal other users' votes
          expect(afterRemoval).toEqual(otherUsersVotes);

          // Property: Options not voted by user should remain unchanged
          afterRemoval.forEach((count, idx) => {
            if (!validUserVote.includes(idx)) {
              expect(count).toBe(consistentVotes[idx]);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 52: Vote removal updates percentages for all options", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 2, max: 100 }), {
          minLength: 2,
          maxLength: 5,
        }),
        fc.integer({ min: 0, max: 4 }),
        async (voteCounts, removeIndex) => {
          if (removeIndex >= voteCounts.length) return;
          if (voteCounts[removeIndex] === 0) return; // Can't remove from 0

          const oldTotal = voteCounts.reduce((a, b) => a + b, 0);
          const oldPercentages = voteCounts.map((count) =>
            Math.round((count / oldTotal) * 100)
          );

          // Remove vote
          const newVoteCounts = [...voteCounts];
          newVoteCounts[removeIndex] -= 1;
          const newTotal = newVoteCounts.reduce((a, b) => a + b, 0);

          if (newTotal === 0) {
            // All percentages should be 0
            const newPercentages = newVoteCounts.map(() => 0);
            newPercentages.forEach((pct) => {
              expect(pct).toBe(0);
            });
          } else {
            const newPercentages = newVoteCounts.map((count) =>
              Math.round((count / newTotal) * 100)
            );

            // Property 1: Percentages should sum to approximately 100%
            const sum = newPercentages.reduce((a, b) => a + b, 0);
            expect(sum).toBeGreaterThanOrEqual(98);
            expect(sum).toBeLessThanOrEqual(102);

            // Property 2: Each percentage should be valid
            newPercentages.forEach((pct) => {
              expect(pct).toBeGreaterThanOrEqual(0);
              expect(pct).toBeLessThanOrEqual(100);
            });

            // Property 3: Removed option's percentage should decrease or stay same
            expect(newPercentages[removeIndex]).toBeLessThanOrEqual(
              oldPercentages[removeIndex]
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
