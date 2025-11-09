import type { Request, Response } from "express";
import { Post } from "../models/Post.model.js";
import type { CreatePostSchemaType, UpdatePostSchemaType } from "../schemas/post.schema.js";

// =========================
// CREATE POST
// =========================
export const createPost = async (req: Request, res: Response) => {
  try {
    const data = req.body as CreatePostSchemaType;

    const newPost = await Post.create(data);
    return res.status(201).json({ success: true, data: newPost });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
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
      return res.status(404).json({ success: false, message: "Post not found" });
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
    const { id } = req.params;
    const updates = req.body as UpdatePostSchemaType;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Only author can update
    if (post.author.clerkId !== req.auth.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updates, { new: true });
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
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Only author can delete
    if (post.author.clerkId !== req.auth.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Post.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
