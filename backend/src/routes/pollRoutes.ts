import { Router } from 'express';
import { getPolls, createPoll, votePoll } from '../controllers/pollController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/fileUpload';

const router = Router();

/**
 * @route   GET /api/polls
 * @desc    Get all polls
 * @access  Private
 */
router.get('/', authMiddleware, getPolls);

/**
 * @route   POST /api/polls
 * @desc    Create a new poll
 * @access  Private
 */
router.post('/', authMiddleware, upload.single('media'), createPoll);

/**
 * @route   POST /api/polls/:id/vote
 * @desc    Vote on a poll
 * @access  Private
 */
router.post('/:id/vote', authMiddleware, votePoll);

export default router;
