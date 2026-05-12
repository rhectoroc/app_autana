import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log connection intent (without exposing password)
if (process.env.DATABASE_URL) {
    console.log('Database connection: Attempting to connect via DATABASE_URL');
} else {
    console.log('Database connection: No DATABASE_URL found, falling back to individual DB_* variables');
    console.log(`Targeting Host: ${process.env.DB_HOST || 'autana_db'}`);
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ...(process.env.DATABASE_URL ? {} : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'autana_db', // Default to internal Docker name
        database: process.env.DB_NAME || 'autana',
        password: process.env.DB_PASSWORD || 'password',
        port: parseInt(process.env.DB_PORT || '5432'),
    })
});

// Initialize database with retry logic
export const initDB = async (retries = 5) => {
    while (retries > 0) {
        try {
            // Test connection
            await pool.query('SELECT NOW()');

            // If connection successful, run schema
            // Determine schema path based on execution environment (TS source vs compiled JS)
            // If running from dist-server/config, schema is in ../../server/schema.sql presumably,
            // or we copy schema.sql to dist-server. 
            // Safer: Assume schema.sql is in 'server' folder in project root.
            const schemaPath = path.join(process.cwd(), 'server', 'schema.sql');

            if (fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, 'utf8');
                await pool.query(schema);
                console.log('Database tables initialized');
            } else {
                console.warn(`Schema file not found at ${schemaPath}, skipping table creation.`);
            }
            break;
        } catch (err) {
            console.error(`Error connecting to database (retries left: ${retries - 1})`, err);
            retries -= 1;
            if (retries === 0) {
                console.error('Could not connect to database after multiple attempts.');
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds
        }
    }
};
