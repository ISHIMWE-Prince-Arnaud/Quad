import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  caption: {
    type: String,
    required: [true, "Please provide a caption"],
    maxlength: [500, "Caption cannot exceed 500 characters"],
  },
  mediaUrl: {
    type: String,
    required: [true, "Please upload an image or video"],
  },
  mediaType: {
    type: String,
    enum: ["image", "video"],
    default: "image",
  },
  theme: {
    type: String,
    default: null,
  },
  reactions: {
    laugh: { type: Number, default: 0 },
    cry: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
  },
  reactedBy: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      emoji: {
        type: String,
        enum: ["laugh", "cry", "love", "angry"],
      },
    },
  ],
  comments: [commentSchema],
  isTopPost: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
postSchema.index({ createdAt: -1 });
postSchema.index({ theme: 1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
