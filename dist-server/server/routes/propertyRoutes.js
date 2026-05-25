import express from 'express';
import multer from 'multer';
import path from 'path';
import { createProperty, getProperties, getPropertyById, updateProperty, deleteProperty } from '../controllers/propertyController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
const router = express.Router();
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.mp4', '.webm', '.mov'];
// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: (req, file, cb) => {
        // Strip any path traversal sequences from original name
        const cleanName = path.basename(file.originalname);
        // Use a temporary prefix, we will process and rename later
        cb(null, `temp-${Date.now()}-${cleanName}`);
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const isImage = allowedImageTypes.includes(file.mimetype);
        const isVideo = allowedVideoTypes.includes(file.mimetype);
        const ext = path.extname(file.originalname).toLowerCase();
        const isAllowedExtension = allowedExtensions.includes(ext);
        if ((isImage || isVideo) && isAllowedExtension) {
            cb(null, true);
        }
        else {
            cb(new Error(`Invalid file type or extension for ${file.originalname}. Only standard images and videos are allowed.`));
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit for video/image uploads
    }
});
const uploadFields = upload.fields([{ name: 'images', maxCount: 20 }, { name: 'video', maxCount: 1 }]);
// Custom middleware to handle Multer errors gracefully
const handleUploadFields = (req, res, next) => {
    uploadFields(req, res, (err) => {
        if (err) {
            console.error('File Upload Error:', err.message);
            res.status(400).json({ message: 'File upload error', error: err.message });
            return;
        }
        next();
    });
};
router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.post('/', verifyToken, requireAdmin, handleUploadFields, createProperty);
router.put('/:id', verifyToken, requireAdmin, handleUploadFields, updateProperty);
router.delete('/:id', verifyToken, requireAdmin, deleteProperty);
export default router;
