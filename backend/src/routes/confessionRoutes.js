import express from "express";
import {
  getConfessions,
  createConfession,
  likeConfession,
} from "../controllers/confessionController.js";
import { confessionLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get("/", getConfessions);
router.post("/", confessionLimiter, createConfession);
router.post("/:id/like", likeConfession);

export default router;
