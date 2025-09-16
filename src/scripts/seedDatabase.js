import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Order from '../models/Order.js';
import Address from '../models/Address.js';
import Payment from '../models/Payment.js';
import { ChatMessage, Conversation } from '../models/Chat.js';
import connectDB from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample data generators
const generateUsers = async () => {
  const users = [
    {
      name: 'Rajesh Kumar',
      email: 'rajesh.farmer@gmail.com',
      password: await bcrypt.hash('password123', 12),
      phone: '+91 9876543210',
      location: 'Punjab, India',
      verified: true,
      authProvider: 'local',
      rating: 4.8,
      totalTrades: 45,
    },
    {
      name: 'Priya Sharma',
      email: 'priya.organic@gmail.com',
      password: await bcrypt.hash('password123', 12),
      phone: '+91 9876543211',
      location: 'Maharashtra, India',
      verified: true,
      authProvider: 'local',
      rating: 4.6,
      totalTrades: 32,
    },
    {
      name: 'Amit Singh',
      email: 'amit.trader@gmail.com',
      password: await bcrypt.hash('password123', 12),
      phone: '+91 9876543212',
      location: 'Uttar Pradesh, India',
      verified: true,
      authProvider: 'local',
      rating: 4.9,
      totalTrades: 78,
    },
    {
      name: 'Sunita Devi',
      email: 'sunita.vegetables@gmail.com',
      password: await bcrypt.hash('password123', 12),
      phone: '+91 9876543213',
      location: 'Haryana, India',
      verified: true,
      authProvider: 'local',
      rating: 4.7,
      totalTrades: 23,
    },
    {
      name: 'Ravi Patel',
      email: 'ravi.fruits@gmail.com',
      password: await bcrypt.hash('password123', 12),
      phone: '+91 9876543214',
      location: 'Gujarat, India',
      verified: true,
      authProvider: 'local',
      rating: 4.5,
      totalTrades: 56,
    },
  ];

  return await User.insertMany(users);
};

const generateAddresses = async (users) => {
  const addresses = [];
  
  users.forEach((user, index) => {
    const states = ['Punjab', 'Maharashtra', 'Uttar Pradesh', 'Haryana', 'Gujarat'];
    const cities = ['Ludhiana', 'Mumbai', 'Lucknow', 'Gurgaon', 'Ahmedabad'];
    
    addresses.push({
      userId: user._id,
      label: 'Home',
      name: user.name,
      phone: user.phone,
      addressLine1: `${Math.floor(Math.random() * 999) + 1}, Sector ${Math.floor(Math.random() * 50) + 1}`,
      addressLine2: `Near ${['Market', 'School', 'Hospital', 'Temple'][Math.floor(Math.random() * 4)]}`,
      city: cities[index],
      state: states[index],
      pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
      landmark: `${['Main Market', 'Bus Stand', 'Railway Station'][Math.floor(Math.random() * 3)]}`,
      isDefault: true,
    });

    // Add a work address for some users
    if (index % 2 === 0) {
      addresses.push({
        userId: user._id,
        label: 'Work',
        name: user.name,
        phone: user.phone,
        addressLine1: `Office Complex ${Math.floor(Math.random() * 50) + 1}`,
        addressLine2: 'Industrial Area',
        city: cities[index],
        state: states[index],
        pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
        isDefault: false,
      });
    }
  });

  return await Address.insertMany(addresses);
};

const loadCropCategories = () => {
  try {
    const csvPath = path.join(__dirname, '../../Category.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').slice(1); // Skip header
    
    const categories = new Set();
    const crops = [];
    
    lines.forEach(line => {
      if (line.trim()) {
        const [commodity, category] = line.split(',');
        if (commodity && category) {
          categories.add(category.trim());
          crops.push({
            name: commodity.replace(/\+/g, ' ').trim(),
            category: category.trim(),
          });
        }
      }
    });

    return { categories: Array.from(categories), crops };
  } catch (error) {
    console.error('Error loading crop categories:', error);
    return { categories: ['Vegetables', 'Fruits', 'Grains'], crops: [] };
  }
};

const generateShelfItems = async (users) => {
  const { crops } = loadCropCategories();
  const items = [];
  const units = ['kg', 'quintal', 'ton', 'piece', 'dozen', 'liter', 'gram'];
  
  const sampleImages = [
    'https://images.pexels.com/photos/568383/pexels-photo-568383.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1292556/pexels-photo-1292556.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
  ];

  users.forEach((user, userIndex) => {
    // Generate 3-8 items per user
    const itemCount = Math.floor(Math.random() * 6) + 3;
    
    for (let i = 0; i < itemCount; i++) {
      const crop = crops[Math.floor(Math.random() * crops.length)] || { name: 'Tomatoes', category: 'Vegetables' };
      const unit = units[Math.floor(Math.random() * units.length)];
      const quantity = Math.floor(Math.random() * 500) + 10;
      const price = Math.floor(Math.random() * 100) + 10;
      const lowStockThreshold = Math.floor(quantity * 0.2);
      
      // Create harvest and expiry dates
      const harvestDate = new Date();
      harvestDate.setDate(harvestDate.getDate() - Math.floor(Math.random() * 30));
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Math.floor(Math.random() * 60) + 7);

      items.push({
        name: crop.name,
        description: `Fresh ${crop.name.toLowerCase()} directly from farm. High quality produce with natural farming methods.`,
        category: crop.category.toLowerCase().replace(/\s+/g, '_'),
        price,
        quantity,
        unit,
        minOrderQuantity: Math.floor(Math.random() * 5) + 1,
        lowStockThreshold,
        ownerId: user._id,
        available: true,
        organic: Math.random() > 0.6,
        harvestDate,
        expiryDate,
        location: user.location,
        qualityGrade: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        tags: [crop.category, Math.random() > 0.5 ? 'organic' : 'conventional', 'fresh'],
        images: [{
          filename: `${crop.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.jpg`,
          originalName: `${crop.name}.jpg`,
          alt: `Fresh ${crop.name}`,
          isPrimary: true,
          uploadedAt: new Date(),
        }],
      });
    }
  });

  return await Item.insertMany(items);
};

const generateOrders = async (users, items) => {
  const orders = [];
  const statuses = ['pending', 'accepted', 'shipped', 'delivered', 'cancelled'];
  
  // Generate 20-30 orders
  for (let i = 0; i < 25; i++) {
    const buyer = users[Math.floor(Math.random() * users.length)];
    const item = items[Math.floor(Math.random() * items.length)];
    const seller = users.find(u => u._id.toString() === item.ownerId.toString());
    
    // Don't create orders where buyer and seller are the same
    if (buyer._id.toString() === seller._id.toString()) continue;
    
    const quantity = Math.floor(Math.random() * Math.min(item.quantity, 50)) + 1;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
    
    const order = {
      buyerId: buyer._id,
      sellerId: seller._id,
      productId: item._id,
      productName: item.name,
      quantity,
      unit: item.unit,
      pricePerUnit: item.price,
      totalPrice: quantity * item.price,
      status,
      shippingAddress: {
        street: `${Math.floor(Math.random() * 999) + 1}, Main Street`,
        city: buyer.location.split(',')[0],
        state: buyer.location.split(',')[1]?.trim() || 'Unknown',
        pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
        country: 'India',
      },
      paymentStatus: status === 'delivered' ? 'paid' : status === 'cancelled' ? 'failed' : 'pending',
      createdAt: orderDate,
    };

    // Add status-specific timestamps
    if (status !== 'pending') {
      order.acceptedAt = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);
    }
    if (status === 'shipped' || status === 'delivered') {
      order.shippedAt = new Date(orderDate.getTime() + 48 * 60 * 60 * 1000);
    }
    if (status === 'delivered') {
      order.deliveredAt = new Date(orderDate.getTime() + 72 * 60 * 60 * 1000);
      order.buyerRating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
    }

    orders.push(order);
  }

  return await Order.insertMany(orders);
};

const generatePayments = async (orders) => {
  const payments = [];
  
  orders.forEach(order => {
    if (order.paymentStatus === 'paid') {
      payments.push({
        userId: order.buyerId,
        orderId: order._id,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: order.totalPrice,
        paymentMethod: Math.random() > 0.5 ? 'phonepe' : 'cod',
        status: 'success',
        paidAt: order.deliveredAt || order.createdAt,
      });
    }
  });

  return await Payment.insertMany(payments);
};

const generateConversations = async (users, orders) => {
  const conversations = [];
  const messages = [];
  
  // Create conversations based on orders
  const orderPairs = new Set();
  
  orders.forEach(order => {
    const pairKey = [order.buyerId.toString(), order.sellerId.toString()].sort().join('_');
    if (!orderPairs.has(pairKey)) {
      orderPairs.add(pairKey);
      
      const conversation = {
        participants: [order.buyerId, order.sellerId],
        lastMessageAt: new Date(),
      };
      
      conversations.push(conversation);
    }
  });

  const savedConversations = await Conversation.insertMany(conversations);

  // Generate messages for conversations
  savedConversations.forEach((conv, index) => {
    const messageCount = Math.floor(Math.random() * 5) + 2;
    
    for (let i = 0; i < messageCount; i++) {
      const isFromFirst = Math.random() > 0.5;
      const senderId = isFromFirst ? conv.participants[0] : conv.participants[1];
      const receiverId = isFromFirst ? conv.participants[1] : conv.participants[0];
      
      const sampleMessages = [
        'Hi, is this product still available?',
        'Yes, it is available. When do you need it?',
        'Can you deliver by tomorrow?',
        'Sure, I can arrange delivery.',
        'What is the quality grade?',
        'It is Grade A quality, freshly harvested.',
        'Great! I would like to place an order.',
        'Thank you for the quick delivery!',
      ];
      
      const messageDate = new Date();
      messageDate.setHours(messageDate.getHours() - Math.floor(Math.random() * 48));
      
      messages.push({
        conversationId: conv._id,
        senderId,
        receiverId,
        message: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
        messageType: 'text',
        isRead: Math.random() > 0.3,
        timestamp: messageDate,
        createdAt: messageDate,
      });
    }
  });

  await ChatMessage.insertMany(messages);

  // Update conversations with last message
  for (const conv of savedConversations) {
    const lastMessage = await ChatMessage.findOne({ conversationId: conv._id })
      .sort({ createdAt: -1 });
    
    if (lastMessage) {
      conv.lastMessage = lastMessage._id;
      conv.lastMessageAt = lastMessage.createdAt;
      await conv.save();
    }
  }

  return { conversations: savedConversations, messages };
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      Order.deleteMany({}),
      Address.deleteMany({}),
      Payment.deleteMany({}),
      ChatMessage.deleteMany({}),
      Conversation.deleteMany({}),
    ]);

    // Generate and insert data
    console.log('👥 Creating users...');
    const users = await generateUsers();
    console.log(`✅ Created ${users.length} users`);

    console.log('📍 Creating addresses...');
    const addresses = await generateAddresses(users);
    console.log(`✅ Created ${addresses.length} addresses`);

    console.log('🌾 Creating shelf items...');
    const items = await generateShelfItems(users);
    console.log(`✅ Created ${items.length} shelf items`);

    console.log('📦 Creating orders...');
    const orders = await generateOrders(users, items);
    console.log(`✅ Created ${orders.length} orders`);

    console.log('💳 Creating payments...');
    const payments = await generatePayments(orders);
    console.log(`✅ Created ${payments.length} payments`);

    console.log('💬 Creating conversations and messages...');
    const { conversations, messages } = await generateConversations(users, orders);
    console.log(`✅ Created ${conversations.length} conversations and ${messages.length} messages`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`Users: ${users.length}`);
    console.log(`Addresses: ${addresses.length}`);
    console.log(`Shelf Items: ${items.length}`);
    console.log(`Orders: ${orders.length}`);
    console.log(`Payments: ${payments.length}`);
    console.log(`Conversations: ${conversations.length}`);
    console.log(`Messages: ${messages.length}`);
    
    console.log('\n🔐 Test Login Credentials:');
    users.forEach(user => {
      console.log(`Email: ${user.email} | Password: password123`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeder
seedDatabase();