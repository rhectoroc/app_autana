import { Response } from 'express';
import zlib from 'zlib';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

/**
 * Escapes SQL string literals
 */
const escapeSql = (str: string | null | undefined): string => {
    if (str === null || str === undefined) return 'NULL';
    return `'${String(str).replace(/'/g, "''")}'`;
};

/**
 * Exports full database contents into a gzip-compressed SQL stream (.sql.gz)
 */
export const exportBackup = async (req: AuthRequest, res: Response): Promise<void> => {
    const client = await pool.connect();
    try {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const filename = `backup_autana_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.sql.gz`;

        res.setHeader('Content-Type', 'application/gzip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        const gzip = zlib.createGzip({ level: 9 });
        gzip.pipe(res);

        // Header
        gzip.write(`-- Autana Group Database Dump\n`);
        gzip.write(`-- Generated at: ${now.toISOString()}\n\n`);
        gzip.write(`BEGIN;\n\n`);

        // Tables to dump in dependency order
        const tables = ['users', 'properties', 'images', 'bookings'];

        for (const table of tables) {
            // Check if table exists
            const check = await client.query(
                `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
                [table]
            );
            if (!check.rows[0].exists) continue;

            gzip.write(`-- -----------------------------------------------------\n`);
            gzip.write(`-- Table data: ${table}\n`);
            gzip.write(`-- -----------------------------------------------------\n`);

            const rowsResult = await client.query(`SELECT * FROM ${table} ORDER BY id ASC`);
            if (rowsResult.rows.length === 0) continue;

            const columns = Object.keys(rowsResult.rows[0]);
            const colList = columns.map(c => `"${c}"`).join(', ');

            // Truncate existing data on restore before re-inserting
            gzip.write(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE;\n\n`);

            for (const row of rowsResult.rows) {
                const values = columns.map(col => {
                    const val = row[col];
                    if (val === null || val === undefined) return 'NULL';
                    if (typeof val === 'object') {
                        if (val instanceof Date) {
                            return `'${val.toISOString()}'`;
                        }
                        // JSON objects or arrays
                        return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
                    }
                    if (typeof val === 'number') return String(val);
                    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
                    return escapeSql(val);
                });

                gzip.write(`INSERT INTO ${table} (${colList}) VALUES (${values.join(', ')});\n`);
            }

            // Sync sequence to MAX(id)
            gzip.write(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1), true);\n\n`);
        }

        gzip.write(`COMMIT;\n`);
        gzip.end();
    } catch (err) {
        console.error('Backup export failed:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error generating backup' });
        }
    } finally {
        client.release();
    }
};

/**
 * Restores a database backup from an uploaded .sql or .sql.gz / .gz file
 */
export const restoreBackup = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ message: 'No backup file provided' });
        return;
    }

    const client = await pool.connect();
    try {
        const buffer = req.file.buffer;
        let sqlContent = '';

        // Check if GZIP by magic numbers 0x1f, 0x8b
        const isGzip = buffer.length > 2 && buffer[0] === 0x1f && buffer[1] === 0x8b;

        if (isGzip) {
            sqlContent = zlib.gunzipSync(buffer).toString('utf-8');
        } else {
            sqlContent = buffer.toString('utf-8');
        }

        if (!sqlContent || sqlContent.trim().length === 0) {
            res.status(400).json({ message: 'Backup file is empty' });
            return;
        }

        console.log(`[BackupRestore] Executing restoration (${sqlContent.length} chars of SQL)...`);

        // Execute inside single transaction
        await client.query('BEGIN');
        await client.query(sqlContent);
        await client.query('COMMIT');

        console.log('[BackupRestore] Database restored successfully');

        // Query summary stats after restore
        const stats = {
            properties: (await client.query('SELECT COUNT(*) FROM properties')).rows[0].count,
            images: (await client.query('SELECT COUNT(*) FROM images')).rows[0].count,
            users: (await client.query('SELECT COUNT(*) FROM users')).rows[0].count,
            bookings: (await client.query('SELECT COUNT(*) FROM bookings')).rows[0].count,
        };

        res.json({
            message: 'Database backup restored successfully',
            stats
        });
    } catch (err: any) {
        await client.query('ROLLBACK');
        console.error('[BackupRestore] Restore error:', err);
        res.status(500).json({
            message: 'Failed to restore backup. The transaction was rolled back.',
            error: err.message
        });
    } finally {
        client.release();
    }
};
