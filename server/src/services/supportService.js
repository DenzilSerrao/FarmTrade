const Message = require('../models/Message');

class SupportService {
  async sendMessage(messageData) {
    try {
      const msg = new Message(messageData);
      await msg.save();
    } catch (err) {
      console.error('Error in sendMessage:', err);
      throw err;
    }
  }

  async getFAQs() {
    // You can store FAQs in DB or hardcode for now
    return [
      'How do I reset my password?',
      'How can I add crops to my shelf?',
      'How do I track my orders?',
      'How do I contact support?',
    ];
  }
}

module.exports = SupportService;
