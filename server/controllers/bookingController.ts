import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import nodemailer from 'nodemailer';

const EMAIL_TO = process.env.EMAIL_TO || 'Ll.es.servicios@gmail.com';

// Configure SMTP transport using environment variables
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const createBooking = async (req: Request, res: Response): Promise<void> => {
    const { name, email, phone, property, date, recaptchaToken } = req.body;

    if (!name || !email || !phone || !property || !date) {
        res.status(400).json({ message: 'All booking fields are required.' });
        return;
    }

    if (!recaptchaToken) {
        res.status(400).json({ message: 'Security check (reCAPTCHA) is required.' });
        return;
    }

    // Verify Google reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6Legwv0sAAAAAJH9Wx40E6t--JbX0kaNNy39naE8';
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

    try {
        const verificationResponse = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${secretKey}&response=${recaptchaToken}`
        });
        const verificationResult: any = await verificationResponse.json();

        if (!verificationResult.success) {
            res.status(400).json({ message: 'reCAPTCHA verification failed. Please try again.' });
            return;
        }
    } catch (recaptchaErr) {
        console.error('reCAPTCHA verification error:', recaptchaErr);
        res.status(500).json({ message: 'Error verifying security check.' });
        return;
    }

    try {
        // 1. Store in Database
        const dbResult = await pool.query(
            `INSERT INTO bookings (name, email, phone, property, date)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [name, email, phone, property, date]
        );

        const bookingId = dbResult.rows[0].id;

        // 2. Prepare and Send Email Notification if SMTP is configured
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                const mailOptions = {
                    from: `"Autana Group Booking" <${process.env.EMAIL_USER}>`,
                    to: EMAIL_TO,
                    subject: `Nueva solicitud de reserva #${bookingId} - Autana Group`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4af37; border-radius: 10px;">
                            <h2 style="color: #1a1a1a; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">Nueva Solicitud de Reserva</h2>
                            <p>Se ha recibido una nueva solicitud de visualización/reserva desde la página web:</p>
                            
                            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                                <tr>
                                    <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee; width: 30%;">Nombre:</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Correo:</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Teléfono:</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${phone}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Propiedad:</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${property}</strong></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Fecha solicitada:</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${date}</td>
                                </tr>
                            </table>
                            
                            <p style="margin-top: 20px; font-size: 12px; color: #777; text-align: center;">
                                Autana Group Luxury Real Estate © 2026
                            </p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log(`Booking confirmation email sent for booking #${bookingId}`);
            } catch (emailErr) {
                // Log error but do not fail the request since database write succeeded
                console.error('SMTP Email sending failed:', emailErr);
            }
        } else {
            console.warn('SMTP settings (EMAIL_USER/EMAIL_PASS) are not configured. Skipping email notification.');
        }

        res.status(201).json({ message: 'Booking created successfully', bookingId });
    } catch (err: any) {
        console.error('Booking Creation Error:', err);
        res.status(500).json({ message: 'Error processing booking request', error: err.message });
    }
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err: any) {
        console.error('Fetch Bookings Error:', err);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
};
