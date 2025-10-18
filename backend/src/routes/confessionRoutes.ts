import { Router } from 'express';
import { getConfessions, createConfession, likeConfession, addThought } from '../controllers/confessionController';
import { upload } from '../middleware/fileUpload';

const router = Router();

/**
 * @route   GET /api/confessions
 * @desc    Get all confessions
 * @access  Public
 */
router.get('/', getConfessions);

/**
 * @route   POST /api/confessions
 * @desc    Create a new confession
 * @access  Public (anonymous)
 */
router.post('/', upload.single('media'), createConfession);

/**
 * @route   POST /api/confessions/:id/like
 * @desc    Like/unlike a confession
 * @access  Public (anonymous)
 */
router.post('/:id/like', likeConfession);

/**
 * @route   POST /api/confessions/:id/thought
 * @desc    Add thought to confession
 * @access  Public (anonymous)
 */
router.post('/:id/thought', addThought);

export default router;
