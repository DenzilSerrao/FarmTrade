import express from 'express';
const router = express.Router();
import chatController from '../controllers/chatController.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

// Get user's conversations
router.get('/conversations', verifyToken, chatController.getConversations);

// Create or get conversation
router.post('/conversations', verifyToken, chatController.createConversation);

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', verifyToken, chatController.getMessages);

// Send message
router.post('/messages', verifyToken, chatController.sendMessage);

// Send order update message
router.post('/order-update', verifyToken, chatController.sendOrderUpdate);

export default router;