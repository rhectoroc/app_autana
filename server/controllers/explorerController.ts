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

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { folder, filename } = req.body;
        if (!filename) {
            res.status(400).json({ message: 'Filename is required' });
            return;
        }

        const filePath = folder 
            ? path.join(process.cwd(), 'uploads', folder, filename)
            : path.join(process.cwd(), 'uploads', filename);

        if (!fs.existsSync(filePath)) {
            res.status(404).json({ message: 'File not found' });
            return;
        }

        fs.unlinkSync(filePath);
        res.json({ message: 'File deleted successfully' });
    } catch (err: any) {
        console.error('Delete File Error:', err);
        res.status(500).json({ message: 'Error deleting file', error: err.message });
    }
};

export const deleteFolder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { folder } = req.body;
        if (!folder) {
            res.status(400).json({ message: 'Folder name is required' });
            return;
        }

        const folderPath = path.join(process.cwd(), 'uploads', folder);

        if (!fs.existsSync(folderPath)) {
            res.status(404).json({ message: 'Folder not found' });
            return;
        }

        // Use recursive deletion for safety
        fs.rmSync(folderPath, { recursive: true, force: true });
        res.json({ message: 'Folder deleted successfully' });
    } catch (err: any) {
        console.error('Delete Folder Error:', err);
        res.status(500).json({ message: 'Error deleting folder', error: err.message });
    }
};
