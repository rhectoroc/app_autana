import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export interface AuthRequest extends Request {
    user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => { // Explicitly return void
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(403).json({ message: 'No token provided' });
        return;
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        req.user = decoded;
        next();
    });
};
