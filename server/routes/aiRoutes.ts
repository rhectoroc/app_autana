import express from 'express';
import { getAIContext, handleWhatsAppWebhook } from '../controllers/aiController.js';

const router = express.Router();

// Public/Internal endpoint for the AI Agent to get catalog context
router.get('/context', getAIContext);

// Webhook endpoint for Evolution API
router.post('/webhook/whatsapp', handleWhatsAppWebhook);

export default router;
