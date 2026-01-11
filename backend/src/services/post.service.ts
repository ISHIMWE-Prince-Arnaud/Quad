import { Post } from "../models/Post.model.js";
import { User } from "../models/User.model.js";
import { getSocketIO } from "../config/socket.config.js";
import { emitContentDeleted, emitNewContent } from "../sockets/feed.socket.js";
import { extractMentions } from "../utils/chat.util.js";
import { createNotification, generateNotificationMessage } from "../utils/notification.util.js";
import { findUserByUsernameOrAlias } from "../utils/userLookup.util.js";
import { sanitizePostText } from "../utils/content.util.js";
import { AppError } from "../utils/appError.util.js";

export interface CreatePostInput {
  text?: string;
  media?: Array<{ url: string; type: "image" | "video"; aspectRatio?: "1:1" | "16:9" | "9:16" }>;
}

export interface UpdatePostInput {
  text?: string;
  media?: Array<{ url: string; type: "image" | "video"; aspectRatio?: "1:1" | "16:9" | "9:16" }>;
}

export class PostService {
  static async createPost(userId: string, data: CreatePostInput) {
    const author = await User.findOne({ clerkId: userId });
    if (!author) {
      throw new AppError(
        "User not found. Please create a user profile first.",
        404
      );
    }

    const sanitizedText = data.text ? sanitizePostText(data.text) : undefined;

    const newPost = await Post.create({
      ...data,
      ...(sanitizedText !== undefined ? { text: sanitizedText } : {}),
      userId: author.clerkId,
      author: {
        clerkId: author.clerkId,
        username: author.username,
        email: author.email,
        ...(author.displayName !== undefined ? { displayName: author.displayName } : {}),
        ...(author.firstName !== undefined ? { firstName: author.firstName } : {}),
        ...(author.lastName !== undefined ? { lastName: author.lastName } : {}),
        ...(author.profileImage !== undefined
          ? { profileImage: author.profileImage }
          : {}),
      },
    });

    const newPostId = String(newPost._id);

    const io = getSocketIO();
    io.emit("newPost", newPost);
    emitNewContent(io, "post", newPostId, author.clerkId);

    if (newPost?.text) {
      await this.processMentions(newPost.text, userId, newPostId, author.username);
    }

    return newPost;
  }

  static async getAllPosts(limit = "20", skip = "0") {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Post.countDocuments();

    return {
      posts,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
        hasMore: Number(skip) + posts.length < total,
      },
    };
  }

  static async getPost(id: string) {
    const post = await Post.findById(id);
    if (!post) {
      throw new AppError("Post not found", 404);
    }
    return post;
  }

  static async updatePost(userId: string, id: string, updates: UpdatePostInput) {
    const post = await Post.findById(id);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    if (post.author.clerkId !== userId) {
      throw new AppError("Unauthorized", 403);
    }

    const { author: _author, ...safeUpdates } = updates as any;

    const sanitizedUpdates = {
      ...safeUpdates,
      ...(typeof safeUpdates.text === "string"
        ? { text: sanitizePostText(safeUpdates.text) }
        : {}),
    };

    const updatedPost = await Post.findByIdAndUpdate(id, sanitizedUpdates, {
      new: true,
    });

    if (!updatedPost) {
      throw new AppError("Post not found", 404);
    }

    getSocketIO().emit("updatePost", updatedPost);

    if (updatedPost?.text) {
      await this.processMentions(updatedPost.text, userId, id, post.author.username);
    }

    return updatedPost;
  }

  static async deletePost(userId: string, id: string) {
    const post = await Post.findById(id);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    if (post.author.clerkId !== userId) {
      throw new AppError("Unauthorized", 403);
    }

    await Post.findByIdAndDelete(id);

    const io = getSocketIO();
    io.emit("deletePost", id);
    emitContentDeleted(io, "post", id);
  }

  private static async processMentions(
    text: string,
    actorId: string,
    postId: string,
    actorUsername: string
  ) {
    const mentions = extractMentions(text);
    if (mentions.length === 0) return;

    for (const mentionedUsername of mentions) {
      const mentionedUser = await findUserByUsernameOrAlias(mentionedUsername);
      if (mentionedUser && mentionedUser.clerkId !== actorId) {
        await createNotification({
          userId: mentionedUser.clerkId,
          type: "mention_post",
          actorId,
          contentId: postId,
          contentType: "Post",
          message: generateNotificationMessage("mention_post", actorUsername),
        });
      }
    }
  }
}
