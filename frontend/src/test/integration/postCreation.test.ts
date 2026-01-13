import { describe, it, expect, beforeEach, afterEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import { api } from "@/lib/api";
import { PostService } from "@/services/postService";

describe("Post Creation Integration", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.reset();
  });

  it("should create a post with media only", async () => {
    const postData = {
      media: [
        {
          url: "https://example.com/image.jpg",
          type: "image" as const,
        },
      ],
    };

    const mockResponse = {
      success: true,
      data: {
        _id: "post123",
        userId: "user123",
        text: undefined,
        media: postData.media,
        reactionsCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    mock.onPost("/posts").reply(200, mockResponse);

    const result = await PostService.createPost(postData);

    expect(result.success).toBe(true);
    expect(result.data.media).toHaveLength(1);
    expect(result.data?._id).toBe("post123");
  });

  it("should create a post with text and media", async () => {
    const postData = {
      text: "Post with image",
      media: [
        {
          url: "https://example.com/image.jpg",
          type: "image" as const,
        },
      ],
    };

    const mockResponse = {
      success: true,
      data: {
        _id: "post456",
        userId: "user123",
        text: postData.text,
        media: postData.media,
        reactionsCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    mock.onPost("/posts").reply(200, mockResponse);

    const result = await PostService.createPost(postData);

    expect(result.success).toBe(true);
    expect(result.data.media).toHaveLength(1);
    expect(result.data.media[0].type).toBe("image");
  });

  it("should handle post creation errors", async () => {
    const postData = {
      text: "",
      media: [],
    };

    mock.onPost("/posts").reply(400, {
      success: false,
      message: "At least one media is required",
    });

    try {
      await PostService.createPost(postData);
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain("required");
    }
  });

  it("should retrieve created post", async () => {
    const postId = "post123";

    const mockPost = {
      success: true,
      data: {
        _id: postId,
        userId: "user123",
        text: "Test post",
        media: [
          {
            url: "https://example.com/image.jpg",
            type: "image" as const,
          },
        ],
        reactionsCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    mock.onGet(`/posts/${postId}`).reply(200, mockPost);

    const result = await PostService.getPostById(postId);

    expect(result.success).toBe(true);
    expect(result.data?._id).toBe(postId);
  });

  it("should update a post", async () => {
    const postId = "post123";
    const updateData = {
      text: "Updated post text",
    };

    const mockResponse = {
      success: true,
      data: {
        _id: postId,
        userId: "user123",
        text: updateData.text,
        media: [
          {
            url: "https://example.com/image.jpg",
            type: "image" as const,
          },
        ],
        reactionsCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    mock.onPut(`/posts/${postId}`).reply(200, mockResponse);

    const result = await PostService.updatePost(postId, updateData);

    expect(result.success).toBe(true);
    expect(result.data?.text).toBe(updateData.text);
  });

  it("should delete a post", async () => {
    const postId = "post123";

    mock.onDelete(`/posts/${postId}`).reply(200, {
      success: true,
      message: "Post deleted successfully",
    });

    const result = await PostService.deletePost(postId);

    expect(result.success).toBe(true);
  });

  it("should handle complete post lifecycle", async () => {
    // Create
    const createData = {
      text: "New post",
      media: [
        {
          url: "https://example.com/image.jpg",
          type: "image" as const,
        },
      ],
    };
    const postId = "post123";

    mock.onPost("/posts").reply(200, {
      success: true,
      data: {
        _id: postId,
        userId: "user123",
        text: createData.text,
        media: createData.media,
        reactionsCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    const createResult = await PostService.createPost(createData);
    expect(createResult.success).toBe(true);

    // Read
    mock.onGet(`/posts/${postId}`).reply(200, {
      success: true,
      data: createResult.data,
    });

    const readResult = await PostService.getPostById(postId);
    expect(readResult.success).toBe(true);

    // Update
    const updateData = { text: "Updated post" };
    mock.onPut(`/posts/${postId}`).reply(200, {
      success: true,
      data: {
        ...createResult.data,
        text: updateData.text,
      },
    });

    const updateResult = await PostService.updatePost(postId, updateData);
    expect(updateResult.success).toBe(true);
    expect(updateResult.data?.text).toBe(updateData.text);

    // Delete
    mock.onDelete(`/posts/${postId}`).reply(200, {
      success: true,
      message: "Post deleted successfully",
    });

    const deleteResult = await PostService.deletePost(postId);
    expect(deleteResult.success).toBe(true);
  });
});
