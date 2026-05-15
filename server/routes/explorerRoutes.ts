import { getStorageStats, deleteFile, deleteFolder } from '../controllers/explorerController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only admins should access storage explorer
router.get('/stats', verifyToken, getStorageStats);
router.post('/delete-file', verifyToken, deleteFile);
router.post('/delete-folder', verifyToken, deleteFolder);

export default router;
