import express from 'express';
const router = express.Router();
import supportController from '../controllers/supportController.js';

// GET FAQs (public)
router.get('/faqs', supportController.getFAQs);

// POST send support message (requires authentication)
router.post('/messages', supportController.sendMessage);

// GET user's support messages (requires authentication)
router.get('/messages', supportController.getUserMessages);

// GET specific support message (requires authentication and ownership)
router.get('/messages/:messageId', supportController.getMessage);

// GET contact information (public)
router.get('/contact', supportController.getContactInfo);

export default router;
