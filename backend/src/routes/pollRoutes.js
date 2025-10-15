import express from 'express';
import {
  getPolls,
  createPoll,
  voteOnPoll,
  getPoll,
} from '../controllers/pollController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getPolls);
router.get('/:id', getPoll);
router.post('/', protect, createPoll);
router.post('/:id/vote', protect, voteOnPoll);

export default router;
