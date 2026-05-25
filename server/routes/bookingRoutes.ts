import express from 'express';
import { createBooking, getBookings } from '../controllers/bookingController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public endpoint to create booking (from client web)
router.post('/', createBooking);

// Protected endpoint to view bookings (for admin panel)
router.get('/', verifyToken, requireAdmin, getBookings);

export default router;
