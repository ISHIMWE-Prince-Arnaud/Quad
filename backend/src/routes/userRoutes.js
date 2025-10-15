import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user-avatars",
    format: async (req, file) => "png",
    public_id: (req, file) => `user-${req.user._id}-${Date.now()}`,
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload only images."), false);
    }
  },
});

// Update user avatar
router.post("/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    const user = req.user;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image file" });
    }

    // Update user's avatar URL
    user.avatar = req.file.path;
    await user.save();

    res.json({
      message: "Avatar updated successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ message: "Error updating avatar" });
  }
});

// Get user stats
router.get("/:id/stats", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "totalPosts totalReactions badges"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({ message: "Error getting user stats" });
  }
});

export default router;
