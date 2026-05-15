import express from 'express';
import multer from 'multer';
import path from 'path';
import { createProperty, getProperties, getPropertyById, updateProperty, deleteProperty } from '../controllers/propertyController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer storage config
// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'uploads'));
    },
    filename: (req, file, cb) => {
        // Use a temporary prefix, we will process and rename later
        cb(null, `temp-${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

const uploadFields = upload.fields([{ name: 'images', maxCount: 20 }, { name: 'video', maxCount: 1 }]);

router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.post('/', verifyToken, uploadFields, createProperty);
router.put('/:id', verifyToken, uploadFields, updateProperty);
router.delete('/:id', verifyToken, deleteProperty);

export default router;
