import { Router } from 'express';
import { getPosts, createPost, likePost, addComment, getComments } from '../controllers/postController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/fileUpload';

const router = Router();

/**
 * @route   GET /api/posts
 * @desc    Get all posts
 * @access  Private
 */
router.get('/', authMiddleware, getPosts);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/', authMiddleware, upload.single('media'), createPost);

/**
 * @route   POST /api/posts/:id/like
 * @desc    Like/unlike a post
 * @access  Private
 */
router.post('/:id/like', authMiddleware, likePost);

/**
 * @route   POST /api/posts/:id/comment
 * @desc    Add comment to post
 * @access  Private
 */
router.post('/:id/comment', authMiddleware, addComment);

/**
 * @route   GET /api/posts/:id/comments
 * @desc    Get comments for a post
 * @access  Private
 */
router.get('/:id/comments', authMiddleware, getComments);

export default router;
