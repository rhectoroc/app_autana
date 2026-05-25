import fs from 'fs';
import path from 'path';
const getDirSize = (dirPath) => {
    let size = 0;
    const files = fs.readdirSync(dirPath);
    for (let i = 0; i < files.length; i++) {
        const filePath = path.join(dirPath, files[i]);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            size += stats.size;
        }
        else if (stats.isDirectory()) {
            size += getDirSize(filePath);
        }
    }
    return size;
};
export const getStorageStats = async (req, res) => {
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
    }
    catch (err) {
        console.error('Explorer Error:', err);
        res.status(500).json({ message: 'Error retrieving storage stats', error: err.message });
    }
};
export const deleteFile = async (req, res) => {
    try {
        const { folder, filename } = req.body;
        if (!filename) {
            res.status(400).json({ message: 'Filename is required' });
            return;
        }
        const uploadsDir = path.resolve(process.cwd(), 'uploads');
        const filePath = folder
            ? path.resolve(uploadsDir, folder, filename)
            : path.resolve(uploadsDir, filename);
        // Strict path traversal check
        if (!filePath.startsWith(uploadsDir)) {
            res.status(403).json({ message: 'Access denied: Path traversal detected' });
            return;
        }
        if (!fs.existsSync(filePath)) {
            res.status(404).json({ message: 'File not found' });
            return;
        }
        // Additional safeguard: ensure it is a file and not a directory
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) {
            res.status(400).json({ message: 'Target is not a file' });
            return;
        }
        fs.unlinkSync(filePath);
        res.json({ message: 'File deleted successfully' });
    }
    catch (err) {
        console.error('Delete File Error:', err);
        res.status(500).json({ message: 'Error deleting file', error: err.message });
    }
};
export const deleteFolder = async (req, res) => {
    try {
        const { folder } = req.body;
        if (!folder) {
            res.status(400).json({ message: 'Folder name is required' });
            return;
        }
        const uploadsDir = path.resolve(process.cwd(), 'uploads');
        const folderPath = path.resolve(uploadsDir, folder);
        // Strict path traversal check (must be inside uploads, and cannot be uploads itself)
        if (!folderPath.startsWith(uploadsDir) || folderPath === uploadsDir) {
            res.status(403).json({ message: 'Access denied: Invalid folder path' });
            return;
        }
        if (!fs.existsSync(folderPath)) {
            res.status(404).json({ message: 'Folder not found' });
            return;
        }
        // Additional safeguard: ensure it is a directory
        const stats = fs.statSync(folderPath);
        if (!stats.isDirectory()) {
            res.status(400).json({ message: 'Target is not a directory' });
            return;
        }
        // Use recursive deletion for safety
        fs.rmSync(folderPath, { recursive: true, force: true });
        res.json({ message: 'Folder deleted successfully' });
    }
    catch (err) {
        console.error('Delete Folder Error:', err);
        res.status(500).json({ message: 'Error deleting folder', error: err.message });
    }
};
