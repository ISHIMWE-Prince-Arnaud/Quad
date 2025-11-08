import type { Request, Response } from "express";
import { User } from "../models/User.model.js";
import type { CreateUserSchemaType } from "../schemas/user.schema.js";

// =========================
// CREATE USER
// =========================
export const createUser = async (req: Request, res: Response) => {
  try {
    const data = req.body as CreateUserSchemaType;

    // Check if user already exists (by email or Clerk ID)
    const existingUser = await User.findOne({ $or: [{ id: data.id }, { email: data.email }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const newUser = await User.create(data);
    return res.status(201).json({ success: true, data: newUser });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// =========================
// GET USER
// =========================
export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ id });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// UPDATE USER
// =========================
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findOneAndUpdate({ id }, updates, { new: true });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// DELETE USER
// =========================
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findOneAndDelete({ id });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
