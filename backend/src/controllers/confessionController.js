import Confession from "../models/Confession.js";
import { sanitizeText } from "../utils/sanitize.js";

// @desc    Get all confessions
// @route   GET /api/confessions
// @access  Public
export const getConfessions = async (req, res) => {
  try {
    const confessions = await Confession.find()
      .sort({ createdAt: -1 })
      .select("-likedBy");

    res.json(confessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit confession
// @route   POST /api/confessions
// @access  Public (with rate limiting)
export const createConfession = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Confession text is required" });
    }

    if (text.length > 1000) {
      return res
        .status(400)
        .json({ message: "Confession cannot exceed 1000 characters" });
    }

    const confession = await Confession.create({
      text: sanitizeText(text),
    });

    // Don't send back sensitive fields
    const safeConfession = {
      _id: confession._id,
      text: confession.text,
      likes: confession.likes,
      createdAt: confession.createdAt,
    };

    res.status(201).json(safeConfession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like a confession
// @route   POST /api/confessions/:id/like
// @access  Public
export const likeConfession = async (req, res) => {
  try {
    const confession = await Confession.findById(req.params.id);

    if (!confession) {
      return res.status(404).json({ message: "Confession not found" });
    }

    // Use IP address as identifier for anonymous likes
    const identifier = req.ip || req.socket.remoteAddress;

    const hasLiked = confession.likedBy.includes(identifier);

    if (hasLiked) {
      // Unlike
      confession.likes -= 1;
      confession.likedBy = confession.likedBy.filter((id) => id !== identifier);
    } else {
      // Like
      confession.likes += 1;
      confession.likedBy.push(identifier);
    }

    await confession.save();

    res.json({
      _id: confession._id,
      likes: confession.likes,
      hasLiked: !hasLiked,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
