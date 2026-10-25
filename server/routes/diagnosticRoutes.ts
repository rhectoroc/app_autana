import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const testUploadDir = path.join(process.cwd(), 'uploads', 'test_diagnostic');
if (!fs.existsSync(testUploadDir)) {
    fs.mkdirSync(testUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, testUploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `test-${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 1024 } // 1GB
});

router.use(verifyToken, requireAdmin);

/**
 * Diagnostic status check
 */
router.get('/ping', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        uploadsDir: testUploadDir,
        exists: fs.existsSync(testUploadDir)
    });
});

/**
 * Diagnostic upload test route with progress logging
 */
router.post('/upload', (req, res) => {
    console.log('[Diagnostic] Incoming upload test request...');
    const startTime = Date.now();

    upload.single('file')(req, res, (err) => {
        const duration = Date.now() - startTime;
        if (err) {
            console.error('[Diagnostic] Upload error:', err);
            res.status(400).json({
                success: false,
                error: err.message,
                code: err.code,
                durationMs: duration
            });
            return;
        }

        if (!req.file) {
            console.warn('[Diagnostic] No file received in body');
            res.status(400).json({ success: false, message: 'No file received' });
            return;
        }

        const sizeMb = (req.file.size / (1024 * 1024)).toFixed(2);
        console.log(`[Diagnostic] Successfully received ${req.file.originalname} (${sizeMb} MB) in ${duration}ms`);

        // Clean up test file immediately
        try {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        } catch (cleanupErr) {
            console.error('[Diagnostic] Cleanup error:', cleanupErr);
        }

        res.json({
            success: true,
            filename: req.file.originalname,
            sizeBytes: req.file.size,
            sizeMb: `${sizeMb} MB`,
            durationMs: duration,
            speedMbps: ((req.file.size * 8) / (duration / 1000) / (1024 * 1024)).toFixed(2)
        });
    });
});

export default router;
