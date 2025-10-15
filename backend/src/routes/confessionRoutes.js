import express from "express";
import {
  getConfessions,
  createConfession,
  likeConfession,
  addComment,
} from "../controllers/confessionController.js";

const router = express.Router();

router.get("/", getConfessions);
router.post("/", createConfession);
router.post("/:id/like", likeConfession);
router.post("/:id/comment", addComment);

export default router;
