import { Request, Response } from 'express';
import { getPropertiesAIContext } from '../services/aiService.js';

/**
 * Controller for AI-related operations
 */
export const getAIContext = async (req: Request, res: Response): Promise<void> => {
    try {
        const context = await getPropertiesAIContext();
        res.json({ context });
    } catch (err) {
        console.error('AI Context Controller Error:', err);
        res.status(500).json({ message: 'Error generating AI context' });
    }
};

/**
 * Webhook placeholder for Evolution API
 */
export const handleWhatsAppWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const payload = req.body;
        console.log('Evolution API Webhook Received:', JSON.stringify(payload, null, 2));
        
        // FUTURE: Here we will send the payload to DeepSeek with the properties context
        // and send the response back via Evolution API
        
        res.status(200).json({ status: 'received' });
    } catch (err) {
        console.error('WhatsApp Webhook Error:', err);
        res.status(500).json({ message: 'Error processing webhook' });
    }
};
