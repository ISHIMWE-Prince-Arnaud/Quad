import { describe, it, expect, beforeEach, afterEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import { api, invalidateCache } from "@/lib/api";
import { FollowService } from "@/services/followService";

describe("Follow Flow Integration", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
    invalidateCache(); // Clear cache before each test
  });

  afterEach(() => {
    mock.reset();
    invalidateCache(); // Clear cache after each test
  });

  it("should follow a user", async () => {
    const userId = "user456";

    mock.onPost(`/follow/${userId}`).reply(200, {
      success: true,
      message: "User followed successfully",
    });

    const result = await FollowService.followUser(userId);

    expect(result.success).toBe(true);
  });

  it("should unfollow a user", async () => {
    const userId = "user456";

    mock.onDelete(`/follow/${userId}`).reply(200, {
      success: true,
      message: "User unfollowed successfully",
    });

    const result = await FollowService.unfollowUser(userId);

    expect(result.success).toBe(true);
  });

  it("should check if following a user", async () => {
    const userId = "user456";

    mock.onGet(`/follow/${userId}/check`).reply(200, {
      success: true,
      data: { isFollowing: true },
    });

    const result = await FollowService.checkFollowing(userId);

    expect(result.isFollowing).toBe(true);
  });

  it("should get followers list", async () => {
    const userId = "user123";

    const mockFollowers = [
      {
        _id: "user456",
        username: "follower1",
        profileImage: "https://example.com/avatar1.jpg",
      },
      {
        _id: "user789",
        username: "follower2",
        profileImage: "https://example.com/avatar2.jpg",
      },
    ];

    mock.onGet(`/follow/${userId}/followers`).reply(200, {
      success: true,
      data: mockFollowers,
      pagination: {
        hasMore: false,
        total: 2,
      },
    });

    const result = await FollowService.getFollowers(userId);

    expect(result.followers).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it("should get following list", async () => {
    const userId = "user123";

    const mockFollowing = [
      {
        _id: "user456",
        username: "following1",
        profileImage: "https://example.com/avatar1.jpg",
      },
    ];

    mock.onGet(`/follow/${userId}/following`).reply(200, {
      success: true,
      data: mockFollowing,
      pagination: {
        hasMore: false,
        total: 1,
      },
    });

    const result = await FollowService.getFollowing(userId);

    expect(result.following).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("should get follow stats", async () => {
    const userId = "user123";

    const mockStats = {
      followersCount: 150,
      followingCount: 75,
    };

    mock.onGet(`/follow/${userId}/stats`).reply(200, {
      success: true,
      data: mockStats,
    });

    const result = await FollowService.getFollowStats(userId);

    expect(result.followersCount).toBe(150);
    expect(result.followingCount).toBe(75);
  });

  it("should handle complete follow/unfollow cycle", async () => {
    const userId = "user456";

    // Check initial state (not following)
    mock.onGet(`/follow/${userId}/check`).reply(200, {
      success: true,
      data: { isFollowing: false },
    });

    let checkResult = await FollowService.checkFollowing(userId);
    expect(checkResult.isFollowing).toBe(false);

    // Clear cache and reset mock for next call
    invalidateCache();
    mock.reset();

    // Follow user
    mock.onPost(`/follow/${userId}`).reply(200, {
      success: true,
      message: "User followed successfully",
    });

    const followResult = await FollowService.followUser(userId);
    expect(followResult.success).toBe(true);

    // Clear cache and reset mock for next call
    invalidateCache();
    mock.reset();

    // Check state after following
    mock.onGet(`/follow/${userId}/check`).reply(200, {
      success: true,
      data: { isFollowing: true },
    });

    checkResult = await FollowService.checkFollowing(userId);
    expect(checkResult.isFollowing).toBe(true);

    // Clear cache and reset mock for next call
    invalidateCache();
    mock.reset();

    // Unfollow user
    mock.onDelete(`/follow/${userId}`).reply(200, {
      success: true,
      message: "User unfollowed successfully",
    });

    const unfollowResult = await FollowService.unfollowUser(userId);
    expect(unfollowResult.success).toBe(true);

    // Clear cache and reset mock for next call
    invalidateCache();
    mock.reset();

    // Check final state (not following)
    mock.onGet(`/follow/${userId}/check`).reply(200, {
      success: true,
      data: { isFollowing: false },
    });

    checkResult = await FollowService.checkFollowing(userId);
    expect(checkResult.isFollowing).toBe(false);
  });

  it("should handle follow errors gracefully", async () => {
    const userId = "user456";

    mock.onPost(`/follow/${userId}`).reply(400, {
      success: false,
      message: "Cannot follow yourself",
    });

    try {
      await FollowService.followUser(userId);
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("Cannot follow");
    }
  });
});
