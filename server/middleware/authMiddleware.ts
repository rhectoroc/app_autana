import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        console.error('FATAL SECURITY ERROR: JWT_SECRET environment variable is not defined in production!');
    } else {
        console.warn('WARNING: JWT_SECRET environment variable is not defined, using fallback key for development.');
    }
}
const ACTUAL_JWT_SECRET = JWT_SECRET || 'supersecretkey';

export interface AuthRequest extends Request {
    user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(403).json({ message: 'No token provided' });
        return;
    }

    jwt.verify(token, ACTUAL_JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        req.user = decoded;
        next();
    });
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({ message: 'Access denied: Administrator role required' });
        return;
    }

    next();
};

