import mongoose from "mongoose";

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Confession = mongoose.model("Confession", confessionSchema);

export default Confession;
