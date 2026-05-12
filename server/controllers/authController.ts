import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        console.log(`Login attempt received for email: ${email}`);
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            console.log(`Login failed: User with email ${email} not found in database.`);
            res.status(404).json({ message: 'User not found' });
            return;
        }

        console.log(`User found: ${user.email}. Role: ${user.role}. Comparing passwords...`);
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            console.log(`Login failed: Password mismatch for user ${email}.`);
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        console.log(`Login successful for user: ${email}`);

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const register = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
            [email, hashedPassword, 'user']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error registering user' });
    }
};
