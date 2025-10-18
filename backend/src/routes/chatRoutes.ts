import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/chatController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/fileUpload';

const router = Router();

/**
 * @route   GET /api/chat/messages
 * @desc    Get chat messages
 * @access  Private
 */
router.get('/messages', authMiddleware, getMessages);

/**
 * @route   POST /api/chat/messages
 * @desc    Send a chat message
 * @access  Private
 */
router.post('/messages', authMiddleware, upload.single('media'), sendMessage);

export default router;
