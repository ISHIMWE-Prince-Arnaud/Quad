import express from 'express';
import {
  getConfessions,
  createConfession,
  likeConfession,
  reportConfession,
} from '../controllers/confessionController.js';
import { confessionLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.get('/', getConfessions);
router.post('/', confessionLimiter, createConfession);
router.post('/:id/like', likeConfession);
router.post('/:id/report', reportConfession);

export default router;
