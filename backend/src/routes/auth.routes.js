import express from 'express';
import { login, checkAuth, logout, register, verifyEmail, resendVerificationOTP } from '../controllers/authController.js';

const authRoutes = express.Router();

// Login route
authRoutes.post('/login', login);

// Check authentication status route
authRoutes.get('/check', checkAuth);

// Logout route
authRoutes.post('/logout', logout);

authRoutes.post('/register', register);

// Verify email with OTP
authRoutes.post('/verify-email', verifyEmail);

// Resend verification OTP
authRoutes.post('/resend-verification', resendVerificationOTP);


export default authRoutes;