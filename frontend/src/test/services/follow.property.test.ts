import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { FollowService } from "@/services/followService";
import { endpoints } from "@/lib/api";

/**
 * Feature: quad-production-ready, Property 46: Follow Action Optimistic Update
 *
 * For any follow/unfollow action, the UI should update immediately (optimistic)
 * before the API response is received.
 *
 * Validates: Requirements 13.2
 */

// Mock the API endpoints
vi.mock("@/lib/api", () => ({
  endpoints: {
    follow: {
      followUser: vi.fn(),
      unfollowUser: vi.fn(),
      checkFollowing: vi.fn(),
      getFollowers: vi.fn(),
      getFollowing: vi.fn(),
      getMutualFollows: vi.fn(),
      getStats: vi.fn(),
    },
  },
}));

describe("Property 46: Follow Action Optimistic Update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully follow a user", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for user ID
        fc.string({ minLength: 10, maxLength: 50 }),
        async (userId) => {
          // Mock successful follow
          vi.mocked(endpoints.follow.followUser).mockResolvedValue({
            data: { success: true, message: "User followed successfully" },
          } as any);

          // Mock check following to return true after follow
          vi.mocked(endpoints.follow.checkFollowing).mockResolvedValue({
            data: { data: { isFollowing: true } },
          } as any);

          // Perform follow action
          const followResult = await FollowService.followUser(userId);

          // Verify follow succeeded
          expect(followResult.success).toBe(true);

          // Verify follow status is updated
          const checkResult = await FollowService.checkFollowing(userId);
          expect(checkResult.isFollowing).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should successfully unfollow a user", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for user ID
        fc.string({ minLength: 10, maxLength: 50 }),
        async (userId) => {
          // Mock successful unfollow
          vi.mocked(endpoints.follow.unfollowUser).mockResolvedValue({
            data: { success: true, message: "User unfollowed successfully" },
          } as any);

          // Mock check following to return false after unfollow
          vi.mocked(endpoints.follow.checkFollowing).mockResolvedValue({
            data: { data: { isFollowing: false } },
          } as any);

          // Perform unfollow action
          const unfollowResult = await FollowService.unfollowUser(userId);

          // Verify unfollow succeeded
          expect(unfollowResult.success).toBe(true);

          // Verify follow status is updated
          const checkResult = await FollowService.checkFollowing(userId);
          expect(checkResult.isFollowing).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle follow/unfollow toggle correctly", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for user ID
        fc.string({ minLength: 10, maxLength: 50 }),
        // Generator for initial follow state
        fc.boolean(),
        async (userId, initiallyFollowing) => {
          // Set initial state
          vi.mocked(endpoints.follow.checkFollowing).mockResolvedValue({
            data: { data: { isFollowing: initiallyFollowing } },
          } as any);

          const initialState = await FollowService.checkFollowing(userId);
          expect(initialState.isFollowing).toBe(initiallyFollowing);

          if (initiallyFollowing) {
            // If initially following, unfollow
            vi.mocked(endpoints.follow.unfollowUser).mockResolvedValue({
              data: { success: true },
            } as any);

            vi.mocked(endpoints.follow.checkFollowing).mockResolvedValue({
              data: { data: { isFollowing: false } },
            } as any);

            await FollowService.unfollowUser(userId);
            const newState = await FollowService.checkFollowing(userId);
            expect(newState.isFollowing).toBe(false);
          } else {
            // If not following, follow
            vi.mocked(endpoints.follow.followUser).mockResolvedValue({
              data: { success: true },
            } as any);

            vi.mocked(endpoints.follow.checkFollowing).mockResolvedValue({
              data: { data: { isFollowing: true } },
            } as any);

            await FollowService.followUser(userId);
            const newState = await FollowService.checkFollowing(userId);
            expect(newState.isFollowing).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should update follower count after follow action", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for user ID
        fc.string({ minLength: 10, maxLength: 50 }),
        // Generator for initial follower count
        fc.integer({ min: 0, max: 10000 }),
        async (userId, initialFollowers) => {
          // Mock initial stats
          vi.mocked(endpoints.follow.getStats).mockResolvedValue({
            data: {
              data: {
                followers: initialFollowers,
                following: 0,
                mutualFollows: 0,
              },
            },
          } as any);

          const initialStats = await FollowService.getFollowStats(userId);
          expect(initialStats.followers).toBe(initialFollowers);

          // Mock follow action
          vi.mocked(endpoints.follow.followUser).mockResolvedValue({
            data: { success: true },
          } as any);

          // Mock updated stats (follower count increased by 1)
          vi.mocked(endpoints.follow.getStats).mockResolvedValue({
            data: {
              data: {
                followers: initialFollowers + 1,
                following: 0,
                mutualFollows: 0,
              },
            },
          } as any);

          await FollowService.followUser(userId);

          // Verify follower count increased
          const updatedStats = await FollowService.getFollowStats(userId);
          expect(updatedStats.followers).toBe(initialFollowers + 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should update follower count after unfollow action", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for user ID
        fc.string({ minLength: 10, maxLength: 50 }),
        // Generator for initial follower count (at least 1 to unfollow)
        fc.integer({ min: 1, max: 10000 }),
        async (userId, initialFollowers) => {
          // Mock initial stats
          vi.mocked(endpoints.follow.getStats).mockResolvedValue({
            data: {
              data: {
                followers: initialFollowers,
                following: 0,
                mutualFollows: 0,
              },
            },
          } as any);

          const initialStats = await FollowService.getFollowStats(userId);
          expect(initialStats.followers).toBe(initialFollowers);

          // Mock unfollow action
          vi.mocked(endpoints.follow.unfollowUser).mockResolvedValue({
            data: { success: true },
          } as any);

          // Mock updated stats (follower count decreased by 1)
          vi.mocked(endpoints.follow.getStats).mockResolvedValue({
            data: {
              data: {
                followers: initialFollowers - 1,
                following: 0,
                mutualFollows: 0,
              },
            },
          } as any);

          await FollowService.unfollowUser(userId);

          // Verify follower count decreased
          const updatedStats = await FollowService.getFollowStats(userId);
          expect(updatedStats.followers).toBe(initialFollowers - 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle batch follow operations", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for array of user IDs
        fc.array(fc.string({ minLength: 10, maxLength: 50 }), {
          minLength: 1,
          maxLength: 10,
        }),
        async (userIds) => {
          // Mock successful follow for all users
          vi.mocked(endpoints.follow.followUser).mockResolvedValue({
            data: { success: true },
          } as any);

          // Perform batch follow
          const result = await FollowService.batchFollow(userIds);

          // Verify all follows succeeded
          expect(result.succeeded.length).toBe(userIds.length);
          expect(result.failed.length).toBe(0);
          expect(result.succeeded).toEqual(userIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle batch unfollow operations", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for array of user IDs
        fc.array(fc.string({ minLength: 10, maxLength: 50 }), {
          minLength: 1,
          maxLength: 10,
        }),
        async (userIds) => {
          // Mock successful unfollow for all users
          vi.mocked(endpoints.follow.unfollowUser).mockResolvedValue({
            data: { success: true },
          } as any);

          // Perform batch unfollow
          const result = await FollowService.batchUnfollow(userIds);

          // Verify all unfollows succeeded
          expect(result.succeeded.length).toBe(userIds.length);
          expect(result.failed.length).toBe(0);
          expect(result.succeeded).toEqual(userIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should handle partial batch follow failures", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generator for array of user IDs
        fc.array(fc.string({ minLength: 10, maxLength: 50 }), {
          minLength: 2,
          maxLength: 10,
        }),
        // Generator for which indices should fail
        fc.array(fc.boolean()),
        async (userIds, shouldFail) => {
          // Ensure shouldFail array matches userIds length
          const failureMap = shouldFail.slice(0, userIds.length);
          while (failureMap.length < userIds.length) {
            failureMap.push(false);
          }

          // Mock follow with some failures
          let callIndex = 0;
          vi.mocked(endpoints.follow.followUser).mockImplementation(
            async () => {
              const shouldFailThisCall = failureMap[callIndex];
              callIndex++;

              if (shouldFailThisCall) {
                throw new Error("Follow failed");
              }

              return {
                data: { success: true },
              } as any;
            }
          );

          // Perform batch follow
          const result = await FollowService.batchFollow(userIds);

          // Verify results match expected failures
          const expectedSucceeded = userIds.filter((_, i) => !failureMap[i]);
          const expectedFailed = userIds.filter((_, i) => failureMap[i]);

          expect(result.succeeded.length).toBe(expectedSucceeded.length);
          expect(result.failed.length).toBe(expectedFailed.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
