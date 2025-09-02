const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { optionalAuth } = require('../middlewares/auth.middleware');

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

module.exports = router;