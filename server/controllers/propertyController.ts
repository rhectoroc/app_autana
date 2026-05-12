import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { processImage } from '../utils/imageProcessor.js';

export const createProperty = async (req: Request, res: Response): Promise<void> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { title, description, price, type, bathrooms, bedrooms, area_sqm, parking_spots, location, features, status } = req.body;
        const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;

        // Handle Video
        let videoUrl = null;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        if (files && files.video && files.video[0]) {
            const videoFile = files.video[0];
            const newVideoName = videoFile.filename.replace('temp-', 'video-');
            const oldPath = videoFile.path;
            const newPath = path.join(path.dirname(oldPath), newVideoName);
            fs.renameSync(oldPath, newPath);
            videoUrl = `/uploads/${newVideoName}`;
        }

        const propResult = await client.query(
            `INSERT INTO properties (title, description, price, type, bathrooms, bedrooms, area_sqm, parking_spots, location, features, video_url, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id`,
            [title, description, price, type, bathrooms, bedrooms, area_sqm || 0, parking_spots || 0, location, JSON.stringify(parsedFeatures), videoUrl, status || 'available']
        );

        const propertyId = propResult.rows[0].id;

        if (files && files.images) {
            const imageFiles = files.images;
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const { filename } = await processImage(file.path, file.originalname, i + 1);
                const isMain = i === 0;
                await client.query(
                    `INSERT INTO images (property_id, image_url, is_main) VALUES ($1, $2, $3)`,
                    [propertyId, `/uploads/${filename}`, isMain]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Property created successfully', propertyId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Error creating property' });
    } finally {
        client.release();
    }
};

export const getProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type, location, q } = req.query;
        let queryText = `
            SELECT p.*, 
                   COALESCE(json_agg(json_build_object('id', i.id, 'image_url', i.image_url, 'is_main', i.is_main)) 
                   FILTER (WHERE i.id IS NOT NULL), '[]') as images
            FROM properties p
            LEFT JOIN images i ON p.id = i.property_id
        `;

        const conditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (type && type !== 'all') {
            conditions.push(`p.type = $${paramIndex}`);
            params.push(type);
            paramIndex++;
        }

        if (location) {
            conditions.push(`p.location ILIKE $${paramIndex}`);
            params.push(`%${location}%`);
            paramIndex++;
        }

        if (q) {
            conditions.push(`(p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`);
            params.push(`%${q}%`);
            paramIndex++;
        }

        if (conditions.length > 0) {
            queryText += ` WHERE ${conditions.join(' AND ')}`;
        }

        queryText += ` GROUP BY p.id ORDER BY p.created_at DESC`;

        const result = await pool.query(queryText, params);
        
        const properties = result.rows.map(prop => {
            const media = (prop.images || []).map((img: any) => ({
                id: img.id,
                url: img.image_url,
                type: 'image',
                is_main: img.is_main
            }));

            if (prop.video_url) {
                media.push({
                    id: 'video-' + prop.id,
                    url: prop.video_url,
                    type: 'video',
                    is_main: false
                });
            }

            const { images, ...rest } = prop;
            return { ...rest, media };
        });

        res.json(properties);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching properties' });
    }
};

export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const query = `
            SELECT p.*, 
                   COALESCE(json_agg(json_build_object('id', i.id, 'image_url', i.image_url, 'is_main', i.is_main)) 
                   FILTER (WHERE i.id IS NOT NULL), '[]') as images
            FROM properties p
            LEFT JOIN images i ON p.id = i.property_id
            WHERE p.id = $1
            GROUP BY p.id
        `;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Property not found' });
            return;
        }

        const prop = result.rows[0];
        const media = (prop.images || []).map((img: any) => ({
            id: img.id,
            url: img.image_url,
            type: 'image',
            is_main: img.is_main
        }));

        if (prop.video_url) {
            media.push({
                id: 'video-' + prop.id,
                url: prop.video_url,
                type: 'video',
                is_main: false
            });
        }

        const { images, ...rest } = prop;
        res.json({ ...rest, media });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching property' });
    }
};

export const updateProperty = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { title, description, price, type, bathrooms, bedrooms, area_sqm, parking_spots, location, features, status, existingImages } = req.body;
        const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;

        // Handle Video
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        let videoUpdateSql = '';
        const videoParams = [];

        if (files && files.video && files.video[0]) {
            const videoFile = files.video[0];
            const newVideoName = videoFile.filename.replace('temp-', 'video-');
            const oldPath = videoFile.path;
            const newPath = path.join(path.dirname(oldPath), newVideoName);
            fs.renameSync(oldPath, newPath);
            videoUpdateSql = ', video_url = $12';
            videoParams.push(`/uploads/${newVideoName}`);
        }

        // Update property details
        await client.query(
            `UPDATE properties 
             SET title = $1, description = $2, price = $3, type = $4, bathrooms = $5, bedrooms = $6, area_sqm = $7, parking_spots = $8, location = $9, features = $10, status = $11${videoUpdateSql}
             WHERE id = $${12 + videoParams.length}`,
            [title, description, price, type, bathrooms, bedrooms, area_sqm || 0, parking_spots || 0, location, JSON.stringify(parsedFeatures), status || 'available', ...videoParams, id]
        );

        // Handle Images
        // existingImages is sent as a JSON string of IDs to keep
        const keepIds = existingImages ? JSON.parse(existingImages) : [];

        // Construct delete query
        let deleteQuery = '';
        let deleteParams: any[] = [id];

        if (keepIds.length > 0) {
            // Delete images NOT in the keep list
            deleteQuery = `DELETE FROM images WHERE property_id = $1 AND id NOT IN (${keepIds.map((_: any, i: number) => '$' + (i + 2)).join(',')}) RETURNING image_url`;
            deleteParams = [id, ...keepIds];
        } else {
            // If empty, delete ALL images for this property
            deleteQuery = `DELETE FROM images WHERE property_id = $1 RETURNING image_url`;
        }

        const deletedImgs = await client.query(deleteQuery, deleteParams);

        // Delete files from filesystem
        deletedImgs.rows.forEach((img: any) => {
            const relativePath = img.image_url.startsWith('/') ? img.image_url.substring(1) : img.image_url;
            const filePath = path.join(process.cwd(), relativePath);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
        // If existingImages is NOT sent or empty string? Be careful not to delete all if not intended. 
        // Let's assume if it is NOT present, we do nothing to existing. If it is present but empty, we delete all?
        // Better: Frontend MUST send 'existingImages' as JSON string of ID array if it wants to manage them.

        if (files && files.images) {
            const imageFiles = files.images;
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const { filename } = await processImage(file.path, file.originalname, i + 1);
                await client.query(
                    `INSERT INTO images (property_id, image_url, is_main) VALUES ($1, $2, $3)`,
                    [id, `/uploads/${filename}`, false]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'Property updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Error updating property' });
    } finally {
        client.release();
    }
};

export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Get images to delete files
        const imgResult = await client.query('SELECT image_url FROM images WHERE property_id = $1', [id]);

        await client.query('DELETE FROM properties WHERE id = $1', [id]);

        await client.query('COMMIT');

        // Delete files from filesystem
        imgResult.rows.forEach((img: any) => {
            const relativePath = img.image_url.startsWith('/') ? img.image_url.substring(1) : img.image_url;
            const filePath = path.join(process.cwd(), relativePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        res.json({ message: 'Property deleted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Error deleting property' });
    } finally {
        client.release();
    }
};
