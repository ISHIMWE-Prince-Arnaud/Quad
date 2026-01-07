import type { Request, Response } from "express";
import { Post } from "../models/Post.model.js";
import { User } from "../models/User.model.js";
import type {
  CreatePostSchemaType,
  UpdatePostSchemaType,
} from "../schemas/post.schema.js";
import { getSocketIO } from "../config/socket.config.js";
import { emitContentDeleted, emitNewContent } from "../sockets/feed.socket.js";
import { extractMentions } from "../utils/chat.util.js";
import { createNotification, generateNotificationMessage } from "../utils/notification.util.js";

// =========================
// CREATE POST
// =========================
export const createPost = async (req: Request, res: Response) => {
  try {
    const data = req.body as CreatePostSchemaType;
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Fetch author data from database
    const author = await User.findOne({ clerkId: userId });
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please create a user profile first.",
      });
    }

    // Create post with server-side author data
    const newPost = await Post.create({
      ...data,
      userId: author.clerkId, // Required field
      author: {
        clerkId: author.clerkId,
        username: author.username,
        email: author.email,
        displayName: author.displayName,
        firstName: author.firstName,
        lastName: author.lastName,
        profileImage: author.profileImage,
      },
    });

    const newPostId = String(newPost._id);

    const io = getSocketIO();
    io.emit("newPost", newPost);
    emitNewContent(io, "post", newPostId, author.clerkId);

    // Mention notifications
    const mentions = extractMentions(newPost.text);
    if (mentions.length > 0) {
      for (const mentionedUsername of mentions) {
        const mentionedUser = await User.findOne({ username: mentionedUsername });
        if (mentionedUser && mentionedUser.clerkId !== userId) {
          await createNotification({
            userId: mentionedUser.clerkId,
            type: "mention_post",
            actorId: userId,
            contentId: newPostId,
            contentType: "Post",
            message: generateNotificationMessage("mention_post", author.username),
          });
        }
      }
    }

    return res.status(201).json({ success: true, data: newPost });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// =========================
// GET ALL POSTS
// =========================
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { limit = "20", skip = "0" } = req.query;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Post.countDocuments();

    return res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
        hasMore: Number(skip) + posts.length < total,
      },
    });
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET POST
// =========================
export const getPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({ success: true, data: post });
  } catch (error: any) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// UPDATE POST
// =========================
export const updatePost = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, message: "Post ID is required" });
    }
    const updates = req.body as UpdatePostSchemaType;
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Only author can update
    if (post.author.clerkId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Explicitly prevent author field from being updated
    const { author, ...safeUpdates } = updates as any;
    const updatedPost = await Post.findByIdAndUpdate(id, safeUpdates, {
      new: true,
    });

    if (!updatedPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    getSocketIO().emit("updatePost", updatedPost);

    // Mention notifications (best-effort)
    if (updatedPost?.text) {
      const mentions = extractMentions(updatedPost.text);
      if (mentions.length > 0) {
        for (const mentionedUsername of mentions) {
          const mentionedUser = await User.findOne({ username: mentionedUsername });
          if (mentionedUser && mentionedUser.clerkId !== userId) {
            await createNotification({
              userId: mentionedUser.clerkId,
              type: "mention_post",
              actorId: userId,
              contentId: id,
              contentType: "Post",
              message: generateNotificationMessage("mention_post", post.author.username),
            });
          }
        }
      }
    }

    return res.status(200).json({ success: true, data: updatedPost });
  } catch (error: any) {
    console.error("Error updating post:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// DELETE POST
// =========================
export const deletePost = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, message: "Post ID is required" });
    }
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Only author can delete
    if (post.author.clerkId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Post.findByIdAndDelete(id);

    const io = getSocketIO();
    io.emit("deletePost", id);
    emitContentDeleted(io, "post", id);

    return res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
