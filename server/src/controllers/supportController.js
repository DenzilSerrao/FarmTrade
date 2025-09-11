import express from 'express';
const router = express.Router();
import SupportService from '../services/supportService';

const supportService = new SupportService();

// GET FAQs (public)
exports.getFAQs = async (req, res) => {
  try {
    const { category } = req.query;
    const faqs = await supportService.getFAQs(category);

    res.status(200).json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch FAQs',
      error: 'FETCH_FAQS_ERROR',
    });
  }
};

// POST send support message
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const messageData = {
      ...req.body,
      userId,
    };

    // Validation
    if (!messageData.subject || !messageData.content) {
      return res.status(400).json({
        success: false,
        message: 'Subject and content are required',
        error: 'MISSING_REQUIRED_FIELDS',
      });
    }

    const message = await supportService.sendMessage(messageData);

    res.status(201).json({
      success: true,
      message: 'Support message sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Error sending support message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: 'SEND_MESSAGE_ERROR',
    });
  }
};

// GET user's support messages
exports.getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const messages = await supportService.getUserMessages(userId, {
      status,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: 'FETCH_MESSAGES_ERROR',
    });
  }
};

// GET specific support message
exports.getMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await supportService.getMessageById(messageId, userId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
        error: 'MESSAGE_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message',
      error: 'FETCH_MESSAGE_ERROR',
    });
  }
};

// GET contact information (public)
exports.getContactInfo = async (req, res) => {
  try {
    const contactInfo = await supportService.getContactInfo();

    res.status(200).json({
      success: true,
      data: contactInfo,
    });
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact information',
      error: 'FETCH_CONTACT_ERROR',
    });
  }
};

export default supportController;
