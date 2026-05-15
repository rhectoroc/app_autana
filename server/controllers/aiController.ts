import { Request, Response } from 'express';
import axios from 'axios';
import { getPropertiesAIContext, chatWithAI } from '../services/aiService.js';

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
 * Chat with the AI Agent
 */
export const chatWithAgent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { message, history } = req.body;
        if (!message) {
            res.status(400).json({ message: 'Message is required' });
            return;
        }

        const response = await chatWithAI(message, history || []);
        res.json({ response });
    } catch (err) {
        console.error('AI Chat Controller Error:', err);
        res.status(500).json({ message: 'Error communicating with AI' });
    }
};

/**
 * Webhook for Evolution API - Processes incoming WhatsApp messages
 */
export const handleWhatsAppWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const payload = req.body;
        
        // Evolution API structure usually has data.message.conversation or similar
        const incomingMessage = payload.data?.message?.conversation || payload.data?.message?.extendedTextMessage?.text;
        const remoteJid = payload.data?.key?.remoteJid;

        if (!incomingMessage || !remoteJid) {
            res.status(200).json({ status: 'ignored' });
            return;
        }

        console.log(`WhatsApp Message from ${remoteJid}: ${incomingMessage}`);

        // 1. Get AI Response in JSON format
        const aiResponseRaw = await chatWithAI(incomingMessage, []);
        const aiResponse = JSON.parse(aiResponseRaw);

        // 2. Send the Text Message first
        if (aiResponse.text) {
            await sendWhatsAppText(remoteJid, aiResponse.text);
        }

        // 3. Send each Image as an actual Media Message
        if (aiResponse.media && aiResponse.media.length > 0) {
            for (const imageUrl of aiResponse.media) {
                await sendWhatsAppMedia(remoteJid, imageUrl, 'image');
            }
        }
        
        res.status(200).json({ status: 'processed' });
    } catch (err) {
        console.error('WhatsApp Webhook Error:', err);
        res.status(500).json({ message: 'Error processing WhatsApp message' });
    }
};

/**
 * Helper to send text via Evolution API
 */
async function sendWhatsAppText(jid: string, text: string) {
    const instance = process.env.EVOLUTION_INSTANCE;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const baseUrl = process.env.EVOLUTION_URL;

    if (!instance || !apiKey || !baseUrl) return;

    await axios.post(`${baseUrl}/message/sendText/${instance}`, {
        number: jid,
        text: text
    }, { headers: { 'apikey': apiKey } });
}

/**
 * Helper to send media (Images/Videos) via Evolution API
 */
async function sendWhatsAppMedia(jid: string, url: string, type: 'image' | 'video') {
    const instance = process.env.EVOLUTION_INSTANCE;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const baseUrl = process.env.EVOLUTION_URL;

    if (!instance || !apiKey || !baseUrl) return;

    await axios.post(`${baseUrl}/message/sendMedia/${instance}`, {
        number: jid,
        media: url,
        mediatype: type,
        caption: "Autana Group Luxury Property"
    }, { headers: { 'apikey': apiKey } });
}
