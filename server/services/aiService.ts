import axios from 'axios';
import dotenv from 'dotenv';
import { pool } from '../config/db.js';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

interface TranslationResult {
    title_en: string;
    description_en: string;
}

/**
 * Translates property details to English using DeepSeek AI
 */
export const translateProperty = async (title: string, description: string): Promise<TranslationResult> => {
    if (!DEEPSEEK_API_KEY) {
        console.warn('AI Service: DEEPSEEK_API_KEY not found. Skipping auto-translation.');
        return { title_en: title, description_en: description };
    }

    try {
        const prompt = `
            You are a professional real estate translator for Autana Group, a luxury real estate agency in the Caribbean.
            Translate the following property title and description from Spanish to high-end, luxury-focused English.
            Maintain a sophisticated and exclusive tone.
            
            Return ONLY a valid JSON object with the keys "title_en" and "description_en".
            
            TITLE: ${title}
            DESCRIPTION: ${description}
        `;

        const response = await axios.post(DEEPSEEK_URL, {
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: 'You are a luxury real estate marketing expert. You output only JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const result = JSON.parse(response.data.choices[0].message.content);
        return {
            title_en: result.title_en || title,
            description_en: result.description_en || description
        };
    } catch (error) {
        console.error('AI Service Translation Error:', error);
        return { title_en: title, description_en: description };
    }
};

/**
 * Generates a full context of all available properties for the WhatsApp AI Agent
 */
export const getPropertiesAIContext = async (): Promise<string> => {
    try {
        const result = await pool.query(`
            SELECT p.title, p.location, p.price, p.type, p.bedrooms, p.bathrooms, p.area_sqm, p.description, p.features
            FROM properties p
            WHERE p.status = 'available'
            ORDER BY p.created_at DESC
        `);

        if (result.rows.length === 0) return "Currently, there are no available properties in the catalog.";

        let context = "INVENTARIO DE PROPIEDADES AUTANA GROUP:\n\n";
        
        result.rows.forEach((p, i) => {
            context += `PROPIEDAD ${i + 1}:\n`;
            context += `- Título: ${p.title}\n`;
            context += `- Ubicación: ${p.location}\n`;
            context += `- Precio: $${p.price}\n`;
            context += `- Tipo: ${p.type}\n`;
            context += `- Habitaciones: ${p.bedrooms}\n`;
            context += `- Baños: ${p.bathrooms}\n`;
            context += `- Área: ${p.area_sqm} m²\n`;
            context += `- Descripción: ${p.description}\n`;
            context += `- Características: ${JSON.parse(p.features || '[]').join(', ')}\n`;
            context += `------------------------\n`;
        });

        return context;
    } catch (error) {
        console.error('AI Context Generation Error:', error);
        return "Error loading property catalog.";
    }
};
