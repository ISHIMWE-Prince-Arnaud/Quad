import express from "express";
import {
  getConfessions,
  createConfession,
  likeConfession,
} from "../controllers/confessionController.js";

const router = express.Router();

router.get("/", getConfessions);
router.post("/", createConfession);
router.post("/:id/like", likeConfession);

export default router;
