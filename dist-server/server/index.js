import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import explorerRoutes from './routes/explorerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import backupRoutes from './routes/backupRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { initDB, pool } from './config/db.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// ESM fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Middleware
const defaultOrigins = [
    'https://autanagrouprd.com',
    'https://www.autanagrouprd.com',
    'https://app.autanagrouprd.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
];
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : defaultOrigins;
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, postman, curl)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        }
        else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true
}));
// Basic Security Headers Middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});
// Request Logger Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[HTTP] ${req.method} ${req.originalUrl || req.url} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
});
app.use(express.json());
// Health Check Endpoint for Easypanel/Docker
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Create uploads directory if not exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    console.log(`Creating uploads dir at: ${uploadsDir}`);
    fs.mkdirSync(uploadsDir, { recursive: true });
}
else {
    console.log(`Uploads dir exists at: ${uploadsDir}`);
}
// Static files
app.use('/uploads', express.static(uploadsDir, {
    maxAge: '1y',
    immutable: true
}));
// If file not found in uploads, return 404 immediately to avoid falling back to index.html
app.use('/uploads', (req, res) => {
    res.status(404).send('File not found');
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/explorer', explorerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/users', userRoutes);
// Serve Static Files (React App)
const clientBuildPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(clientBuildPath)) {
    // Serve static files from 'dist'
    app.use(express.static(clientBuildPath));
    // Handle React routing for HTML requests only
    // If a request has an extension (like .jpg, .png), and it wasn't caught by express.static, 
    // we want to return a 404, not the index.html
    app.get(/(.*)/, (req, res) => {
        const ext = path.extname(req.url);
        if (ext && ext !== '.html') {
            res.status(404).send('Not Found');
            return;
        }
        res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
}
else {
    console.log('Client build not found. API mode only.');
}
// Database Intialization
const initializeApp = async () => {
    try {
        await initDB();
        // Schema patches for existing deployments
        await pool.query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking_spots INTEGER DEFAULT 0');
        await pool.query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS features JSONB DEFAULT \'[]\'');
        await pool.query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS video_url VARCHAR(255)');
        await pool.query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS title_en VARCHAR(255)');
        await pool.query('ALTER TABLE properties ADD COLUMN IF NOT EXISTS description_en TEXT');
        console.log('Database schema verified and patched.');
    }
    catch (err) {
        console.error('Database initialization error:', err);
    }
};
initializeApp();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
