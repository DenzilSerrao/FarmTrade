import express from 'express';
const router = express.Router();
import paymentController from '../controllers/paymentController.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

// Create payment order
router.post('/create-order', verifyToken, paymentController.createPaymentOrder);

// PhonePe callback (no auth required)
router.post('/phonepe/callback', paymentController.phonePeCallback);

// Verify payment status
router.post('/verify', verifyToken, paymentController.verifyPayment);

export default router;