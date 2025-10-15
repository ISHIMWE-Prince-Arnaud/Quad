import express from "express";
import {
  getPosts,
  getTopPosts,
  createPost,
  reactToPost,
  addComment,
  getUserPosts,
} from "../controllers/postController.js";
import { protect } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/top", getTopPosts);
router.get("/user/:userId", getUserPosts);
router.post("/", protect, upload.single("media"), createPost);
router.post("/:id/react", protect, reactToPost);
router.post("/:id/comment", protect, addComment);

export default router;
