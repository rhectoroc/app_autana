import express from 'express';
import multer from 'multer';
import { exportBackup, restoreBackup } from '../controllers/backupController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer memory storage for backup upload (fast, up to 100MB)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    }
});

router.use(verifyToken, requireAdmin);

router.get('/export', exportBackup);
router.post('/restore', upload.single('file'), restoreBackup);

export default router;
