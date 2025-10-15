import mongoose from "mongoose";

const fakeProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    fakeProfile: {
      type: fakeProfileSchema,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const confessionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Confession text is required"],
    maxlength: [1000, "Confession cannot exceed 1000 characters"],
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [
    {
      type: String, // Store IP or session ID for anonymous likes
    },
  ],
  comments: {
    type: [commentSchema],
    default: [],
  },
  fakeProfile: {
    type: fakeProfileSchema,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Confession = mongoose.model("Confession", confessionSchema);

export default Confession;
