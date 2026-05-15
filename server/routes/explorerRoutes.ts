import express from 'express';
import { getStorageStats } from '../controllers/explorerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Only admins should access storage explorer
router.get('/stats', authenticateToken, getStorageStats);

export default router;
