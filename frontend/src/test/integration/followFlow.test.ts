import { describe, it, expect, beforeEach, afterEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import { api } from "@/lib/api";
import { FollowService } from "@/services/followService";

describe("Follow Flow Integration", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.reset();
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

    expect(result.success).toBe(true);
    expect(result.data?.isFollowing).toBe(true);
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
    });

    const result = await FollowService.getFollowers(userId);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
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
    });

    const result = await FollowService.getFollowing(userId);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
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

    const result = await FollowService.getStats(userId);

    expect(result.success).toBe(true);
    expect(result.data?.followersCount).toBe(150);
    expect(result.data?.followingCount).toBe(75);
  });

  it("should handle complete follow/unfollow cycle", async () => {
    const userId = "user456";

    // Check initial state (not following)
    mock.onGet(`/follow/${userId}/check`).reply(200, {
      success: true,
      data: { isFollowing: false },
    });

    let checkResult = await FollowService.checkFollowing(userId);
    expect(checkResult.data?.isFollowing).toBe(false);

    // Follow user
    mock.onPost(`/follow/${userId}`).reply(200, {
      success: true,
      message: "User followed successfully",
    });

    const followResult = await FollowService.followUser(userId);
    expect(followResult.success).toBe(true);

    // Check state after following
    mock.onGet(`/follow/${userId}/check`).reply(200, {
      success: true,
      data: { isFollowing: true },
    });

    checkResult = await FollowService.checkFollowing(userId);
    expect(checkResult.data?.isFollowing).toBe(true);

    // Unfollow user
    mock.onDelete(`/follow/${userId}`).reply(200, {
      success: true,
      message: "User unfollowed successfully",
    });

    const unfollowResult = await FollowService.unfollowUser(userId);
    expect(unfollowResult.success).toBe(true);

    // Check final state (not following)
    mock.onGet(`/follow/${userId}/check`).reply(200, {
      success: true,
      data: { isFollowing: false },
    });

    checkResult = await FollowService.checkFollowing(userId);
    expect(checkResult.data?.isFollowing).toBe(false);
  });

  it("should handle follow errors gracefully", async () => {
    const userId = "user456";

    mock.onPost(`/follow/${userId}`).reply(400, {
      success: false,
      message: "Cannot follow yourself",
    });

    const result = await FollowService.followUser(userId);

    expect(result.success).toBe(false);
    expect(result.message).toContain("Cannot follow");
  });

  it("should get mutual follows", async () => {
    const userId = "user123";

    const mockMutualFollows = [
      {
        _id: "user456",
        username: "mutual1",
        profileImage: "https://example.com/avatar1.jpg",
      },
    ];

    mock.onGet(`/follow/${userId}/mutual`).reply(200, {
      success: true,
      data: mockMutualFollows,
    });

    const result = await FollowService.getMutualFollows(userId);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });
});
