import { Router } from 'express';
import { getUserProfile, updateProfilePicture } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/fileUpload';

const router = Router();

/**
 * @route   GET /api/users/:username
 * @desc    Get user profile by username
 * @access  Private
 */
router.get('/:username', authMiddleware, getUserProfile);

/**
 * @route   PUT /api/users/me/profile-picture
 * @desc    Update profile picture
 * @access  Private
 */
router.put('/me/profile-picture', authMiddleware, upload.single('profilePicture'), updateProfilePicture);

export default router;
