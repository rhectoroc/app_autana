import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

/**
 * Get all users (id, email, role, created_at)
 */
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'SELECT id, email, role, created_at FROM users ORDER BY id ASC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

/**
 * Create a new user (admin only)
 */
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
    const { email, password, role } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }

    try {
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            res.status(400).json({ message: 'A user with this email already exists' });
            return;
        }

        const targetRole = role === 'admin' ? 'admin' : 'user';
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
            [email, hashedPassword, targetRole]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Error creating user' });
    }
};

/**
 * Update an existing user's role or password
 */
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { email, password, role } = req.body;

    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (userCheck.rows.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const currentTarget = userCheck.rows[0];

        // If target is an admin, ensure we don't accidentally demote the last admin
        if (currentTarget.role === 'admin' && role && role !== 'admin') {
            const adminCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
            if (parseInt(adminCount.rows[0].count) <= 1) {
                res.status(400).json({ message: 'Cannot demote the last administrator' });
                return;
            }
        }

        const updates: string[] = [];
        const params: any[] = [];
        let paramIdx = 1;

        if (email && email !== currentTarget.email) {
            const emailExist = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
            if (emailExist.rows.length > 0) {
                res.status(400).json({ message: 'Email already taken by another user' });
                return;
            }
            updates.push(`email = $${paramIdx++}`);
            params.push(email);
        }

        if (role) {
            updates.push(`role = $${paramIdx++}`);
            params.push(role === 'admin' ? 'admin' : 'user');
        }

        if (password && password.trim().length > 0) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push(`password_hash = $${paramIdx++}`);
            params.push(hashedPassword);
        }

        if (updates.length === 0) {
            res.json(currentTarget);
            return;
        }

        params.push(id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING id, email, role, created_at`;
        const updatedResult = await pool.query(query, params);

        res.json(updatedResult.rows[0]);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Error updating user' });
    }
};

/**
 * Delete a user (cannot delete self or the last administrator)
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    if (String(currentUserId) === String(id)) {
        res.status(400).json({ message: 'You cannot delete your own account' });
        return;
    }

    try {
        const userCheck = await pool.query('SELECT role FROM users WHERE id = $1', [id]);
        if (userCheck.rows.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (userCheck.rows[0].role === 'admin') {
            const adminCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
            if (parseInt(adminCount.rows[0].count) <= 1) {
                res.status(400).json({ message: 'Cannot delete the only remaining administrator' });
                return;
            }
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Error deleting user' });
    }
};
