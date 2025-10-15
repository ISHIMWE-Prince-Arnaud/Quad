import express from 'express';
import {
  register,
  login,
  getMe,
  registerValidation,
  loginValidation,
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.get('/me', protect, getMe);

export default router;
