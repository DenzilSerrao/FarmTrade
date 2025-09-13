import express from 'express';
const router = express.Router();
import {
  getFAQs,
  sendMessage,
  getUserMessages,
  getMessage,
  getContactInfo,
} from '../controllers/supportController.js';

// GET FAQs (public)
router.get('/faqs', getFAQs);

// POST send support message (requires authentication)
router.post('/messages', sendMessage);

// GET user's support messages (requires authentication)
router.get('/messages', getUserMessages);

// GET specific support message (requires authentication and ownership)
router.get('/messages/:messageId', getMessage);

// GET contact information (public)
router.get('/contact', getContactInfo);

export default router;
