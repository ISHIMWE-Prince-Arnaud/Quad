import express from 'express';
import { getLeaderboard, getUserProfile } from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/user/:id', getUserProfile);

export default router;