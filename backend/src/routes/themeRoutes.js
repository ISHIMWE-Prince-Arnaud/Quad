import express from 'express';
import { getCurrentTheme, createTheme, getThemes } from '../controllers/themeController.js';
import { protect, admin } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getThemes);
router.get('/current', getCurrentTheme);
router.post('/', protect, admin, createTheme);

export default router;
