import express from 'express';
import { getStorageStats } from '../controllers/explorerController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only admins should access storage explorer
router.get('/stats', verifyToken, getStorageStats);

export default router;
