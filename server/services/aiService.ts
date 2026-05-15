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
            SELECT p.id, p.title, p.location, p.price, p.type, p.bedrooms, p.bathrooms, p.area_sqm, p.description, p.features,
                   COALESCE(json_agg(i.image_url) FILTER (WHERE i.id IS NOT NULL), '[]') as images
            FROM properties p
            LEFT JOIN images i ON p.id = i.property_id
            WHERE p.status = 'available'
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `);

        if (result.rows.length === 0) return "Currently, there are no available properties in the catalog.";

        let context = "INVENTARIO DE PROPIEDADES AUTANA GROUP:\n\n";
        const baseUrl = (process.env.VITE_API_URL || '').replace(/\/api$/, '');
        
        result.rows.forEach((p, i) => {
            const imageUrls = (p.images || []).map((url: string) => `${baseUrl}${url}`);
            
            context += `PROPIEDAD ${i + 1} (ID: ${p.id}):\n`;
            context += `- Título: ${p.title}\n`;
            context += `- Ubicación: ${p.location}\n`;
            context += `- Precio: $${p.price}\n`;
            context += `- Tipo: ${p.type}\n`;
            context += `- Habitaciones: ${p.bedrooms}\n`;
            context += `- Baños: ${p.bathrooms}\n`;
            context += `- Área: ${p.area_sqm} m²\n`;
            context += `- Descripción: ${p.description}\n`;
            context += `- Características: ${JSON.parse(p.features || '[]').join(', ')}\n`;
            context += `- IMÁGENES DISPONIBLES: ${imageUrls.join(', ')}\n`;
            context += `------------------------\n`;
        });

        return context;
    } catch (error) {
        console.error('AI Context Generation Error:', error);
        return "Error loading property catalog.";
    }
};

/**
 * Sends a message to the AI agent with full context
 */
export const chatWithAI = async (message: string, history: any[] = []): Promise<string> => {
    if (!DEEPSEEK_API_KEY) return "AI Service: DEEPSEEK_API_KEY not configured.";

    try {
        const context = await getPropertiesAIContext();
        const systemPrompt = `
            Eres el Concierge de Autana Group, un Agente Inmobiliario de Lujo y Gestor de Propiedades en Bávaro y Punta Cana. 
            Tu objetivo es ayudar a clientes de alto perfil a encontrar propiedades y ofrecer servicios de gestión integral.
            
            VALORES Y PROMESA DE MARCA:
            - "Convierte tu propiedad en una inversión sin preocupaciones".
            - Autana se encarga de TODO para que el propietario maximice sus ingresos sin estrés.
            
            SERVICIOS QUE OFRECES (Debes mencionarlos si el cliente es propietario):
            1. Gestión Integral de Alquileres: Tanto de larga duración como alquileres vacacionales (short-term).
            2. Gestión de Inquilinos: Selección rigurosa, contratos y atención profesional.
            3. Mantenimiento y Limpieza: Garantizamos que la propiedad esté siempre en perfectas condiciones.
            4. Atención Personalizada: Un equipo siempre disponible para propietarios y huéspedes.
            
            IDENTIDAD Y REGLAS DE RESPUESTA:
            - Eres sofisticado, servicial, profesional y confiable.
            - Usa un tono de lujo caribeño, exclusivo y acogedor.
            - Responde siempre en el idioma del cliente.
            - No inventes propiedades que no estén en el catálogo.
            - Si el cliente está interesado en una propiedad, DEBES enviarle los enlaces de las imágenes del catálogo.
            - Si el cliente es propietario, invítalo a dejar su propiedad en manos de expertos para rentabilizarla.
            
            CONTEXTO DEL CATÁLOGO ACTUAL:
            ${context}
        `;

        const response = await axios.post(DEEPSEEK_URL, {
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: systemPrompt + "\n\nIMPORTANTE: Tu respuesta DEBE ser un objeto JSON válido con dos campos: 'text' (tu mensaje al cliente) y 'media' (un array de strings con los URLs de las imágenes que quieres mostrar). Si no quieres mostrar imágenes, envía un array vacío." },
                ...history,
                { role: 'user', content: message }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.5
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('AI Chat Error:', error);
        return "Lo siento, estoy experimentando dificultades técnicas. ¿Podría intentarlo de nuevo en un momento?";
    }
};
