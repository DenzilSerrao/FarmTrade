import { ChatMessage, Conversation } from '../models/Chat.js';
import User from '../models/User.js';

class ChatController {
  // Get user's conversations
  async getConversations(req, res) {
    try {
      const userId = req.user.id;

      const conversations = await Conversation.find({
        participants: userId,
        isActive: true,
      })
        .populate('participants', 'name avatar')
        .populate('lastMessage')
        .sort({ lastMessageAt: -1 });

      // Format conversations with unread count
      const formattedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const unreadCount = await ChatMessage.countDocuments({
            conversationId: conv._id,
            receiverId: userId,
            isRead: false,
          });

          return {
            id: conv._id,
            participants: conv.participants.map(p => p._id),
            participantDetails: conv.participants.map(p => ({
              id: p._id,
              name: p.name,
              avatar: p.avatar,
            })),
            lastMessage: conv.lastMessage,
            unreadCount,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
          };
        })
      );

      res.json({
        success: true,
        data: formattedConversations,
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversations',
      });
    }
  }

  // Get messages for a conversation
  async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      const { page = 1, limit = 50 } = req.query;

      // Verify user is part of conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }

      const skip = (page - 1) * limit;
      const messages = await ChatMessage.find({
        conversationId,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('orderReference', 'productName status');

      // Mark messages as read
      await ChatMessage.updateMany(
        {
          conversationId,
          receiverId: userId,
          isRead: false,
        },
        {
          isRead: true,
          readAt: new Date(),
        }
      );

      res.json({
        success: true,
        data: messages.reverse(), // Reverse to show oldest first
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch messages',
      });
    }
  }

  // Send a message
  async sendMessage(req, res) {
    try {
      const { conversationId, message, messageType = 'text', orderReference } = req.body;
      const userId = req.user.id;

      // Verify conversation exists and user is participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }

      // Get receiver ID
      const receiverId = conversation.participants.find(
        p => p.toString() !== userId
      );

      // Create message
      const chatMessage = new ChatMessage({
        conversationId,
        senderId: userId,
        receiverId,
        message,
        messageType,
        orderReference,
      });

      await chatMessage.save();

      // Update conversation's last message
      conversation.lastMessage = chatMessage._id;
      conversation.lastMessageAt = new Date();
      await conversation.save();

      await chatMessage.populate('orderReference', 'productName status');

      res.status(201).json({
        success: true,
        data: chatMessage,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
      });
    }
  }

  // Create or get conversation
  async createConversation(req, res) {
    try {
      const { participantId } = req.body;
      const userId = req.user.id;

      if (participantId === userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create conversation with yourself',
        });
      }

      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        participants: { $all: [userId, participantId], $size: 2 },
      }).populate('participants', 'name avatar');

      if (!conversation) {
        // Create new conversation
        conversation = new Conversation({
          participants: [userId, participantId],
        });

        await conversation.save();
        await conversation.populate('participants', 'name avatar');
      }

      res.json({
        success: true,
        data: {
          id: conversation._id,
          participants: conversation.participants.map(p => p._id),
          participantDetails: conversation.participants.map(p => ({
            id: p._id,
            name: p.name,
            avatar: p.avatar,
          })),
          createdAt: conversation.createdAt,
        },
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create conversation',
      });
    }
  }

  // Send order update message
  async sendOrderUpdate(req, res) {
    try {
      const { orderId, message } = req.body;
      const userId = req.user.id;

      // Find or create conversation between buyer and seller
      const order = await Order.findById(orderId).populate('buyerId sellerId');
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      const otherUserId = order.buyerId._id.toString() === userId 
        ? order.sellerId._id 
        : order.buyerId._id;

      // Find or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [userId, otherUserId], $size: 2 },
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [userId, otherUserId],
        });
        await conversation.save();
      }

      // Send order update message
      const chatMessage = new ChatMessage({
        conversationId: conversation._id,
        senderId: userId,
        receiverId: otherUserId,
        message,
        messageType: 'order_update',
        orderReference: orderId,
      });

      await chatMessage.save();

      // Update conversation
      conversation.lastMessage = chatMessage._id;
      conversation.lastMessageAt = new Date();
      await conversation.save();

      res.json({
        success: true,
        data: chatMessage,
      });
    } catch (error) {
      console.error('Error sending order update:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send order update',
      });
    }
  }
}

export default new ChatController();