import express from 'express';
import { getStorageStats, deleteFile, deleteFolder } from '../controllers/explorerController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only admins should access storage explorer
router.get('/stats', verifyToken, requireAdmin, getStorageStats);
router.post('/delete-file', verifyToken, requireAdmin, deleteFile);
router.post('/delete-folder', verifyToken, requireAdmin, deleteFolder);

export default router;

