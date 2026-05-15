import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const getDirSize = (dirPath: string): number => {
    let size = 0;
    const files = fs.readdirSync(dirPath);

    for (let i = 0; i < files.length; i++) {
        const filePath = path.join(dirPath, files[i]);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
            size += stats.size;
        } else if (stats.isDirectory()) {
            size += getDirSize(filePath);
        }
    }

    return size;
};

export const getStorageStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        
        if (!fs.existsSync(uploadsDir)) {
            res.json({ totalSize: 0, folders: [] });
            return;
        }

        const totalSize = getDirSize(uploadsDir);
        const entries = fs.readdirSync(uploadsDir);
        
        const folders = entries.filter(name => {
            return fs.statSync(path.join(uploadsDir, name)).isDirectory();
        }).map(name => {
            const folderPath = path.join(uploadsDir, name);
            const files = fs.readdirSync(folderPath);
            const size = getDirSize(folderPath);
            
            return {
                name,
                fileCount: files.length,
                size,
                files: files.map(file => {
                    const stats = fs.statSync(path.join(folderPath, file));
                    return {
                        name: file,
                        size: stats.size,
                        createdAt: stats.birthtime
                    };
                })
            };
        });

        // Also handle files in the root of uploads (legacy or fallbacks)
        const rootFiles = entries.filter(name => {
            return fs.statSync(path.join(uploadsDir, name)).isFile();
        }).map(name => {
            const stats = fs.statSync(path.join(uploadsDir, name));
            return {
                name,
                size: stats.size,
                createdAt: stats.birthtime
            };
        });

        res.json({
            totalSize,
            folders,
            rootFiles
        });
    } catch (err: any) {
        console.error('Explorer Error:', err);
        res.status(500).json({ message: 'Error retrieving storage stats', error: err.message });
    }
};
