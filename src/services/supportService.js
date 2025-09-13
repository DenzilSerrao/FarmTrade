import Message from '../models/Message.js';

class SupportService {
  // Send support message
  async sendMessage(messageData) {
    try {
      const message = new Message(messageData);
      await message.save();

      await message.populate('userId', 'name email');
      return message;
    } catch (err) {
      console.error('Error in sendMessage:', err);
      throw err;
    }
  }

  // Get user's support messages
  async getUserMessages(userId, options = {}) {
    try {
      const { status, page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const query = { userId };
      if (status) {
        query.status = status;
      }

      const messages = await Message.find(query)
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Message.countDocuments(query);

      return {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      console.error('Error in getUserMessages:', err);
      throw err;
    }
  }

  // Get specific message by ID
  async getMessageById(messageId, userId) {
    try {
      const message = await Message.findOne({
        _id: messageId,
        userId: userId,
      })
        .populate('userId', 'name email')
        .populate('assignedTo', 'name')
        .populate('responses.responderId', 'name');

      return message;
    } catch (err) {
      console.error('Error in getMessageById:', err);
      throw err;
    }
  }

  // Get FAQs
  async getFAQs(category) {
    try {
      // In a real app, this would come from a database
      const allFAQs = [
        {
          id: 1,
          category: 'general',
          question: 'How do I reset my password?',
          answer:
            'You can reset your password by clicking on "Forgot Password" on the login page and following the instructions sent to your email.',
        },
        {
          id: 2,
          category: 'trading',
          question: 'How can I add crops to my shelf?',
          answer:
            'Go to the Shelf tab and click the "+" button to add new items. Fill in the required details like name, quantity, price, and expiry date.',
        },
        {
          id: 3,
          category: 'orders',
          question: 'How do I track my orders?',
          answer:
            'Visit the Orders tab to see all your orders. You can filter by status and see detailed tracking information for each order.',
        },
        {
          id: 4,
          category: 'support',
          question: 'How do I contact support?',
          answer:
            'You can contact support through the Community tab, send us an email, or call our support hotline available 24/7.',
        },
        {
          id: 5,
          category: 'trading',
          question: 'What payment methods are accepted?',
          answer:
            'We accept cash on delivery, UPI payments, bank transfers, and card payments through our secure payment gateway.',
        },
        {
          id: 6,
          category: 'general',
          question: 'How is my rating calculated?',
          answer:
            "Your rating is based on feedback from buyers and sellers you've traded with. It's calculated as an average of all ratings received.",
        },
      ];

      if (category) {
        return allFAQs.filter((faq) => faq.category === category);
      }

      return allFAQs;
    } catch (err) {
      console.error('Error in getFAQs:', err);
      throw err;
    }
  }

  // Get contact information
  async getContactInfo() {
    try {
      return {
        phone: '+1 (555) 123-4567',
        email: 'support@farmtrade.com',
        website: 'www.farmtrade.com',
        address: {
          street: '123 Farm Street',
          city: 'Agriculture City',
          state: 'CA',
          zipCode: '12345',
          country: 'USA',
        },
        hours: {
          weekdays: '9:00 AM - 6:00 PM',
          weekends: '10:00 AM - 4:00 PM',
          support: '24/7 Emergency Support Available',
        },
        socialMedia: {
          facebook: 'https://facebook.com/farmtrade',
          twitter: 'https://twitter.com/farmtrade',
          instagram: 'https://instagram.com/farmtrade',
        },
      };
    } catch (err) {
      console.error('Error in getContactInfo:', err);
      throw err;
    }
  }

  // Add response to support message (admin function)
  async addMessageResponse(messageId, responderId, content) {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      message.responses.push({
        content,
        responderId,
        timestamp: new Date(),
      });

      message.status = 'in_progress';
      await message.save();

      await message.populate([
        { path: 'userId', select: 'name email' },
        { path: 'responses.responderId', select: 'name' },
      ]);

      return message;
    } catch (err) {
      console.error('Error in addMessageResponse:', err);
      throw err;
    }
  }
}

export default new SupportService();
