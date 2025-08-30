const express = require('express');
const router = express.Router();
const SupportService = require('../services/supportService');

const supportService = new SupportService();

// POST send message
router.post('/send-message', async (req, res) => {
  try {
    const message = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message cannot be null.' });
    }

    await supportService.sendMessage(message);
    res.status(200).json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET FAQs
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await supportService.getFAQs();
    res.status(200).json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
