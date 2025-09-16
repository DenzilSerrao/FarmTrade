import express, { json, urlencoded } from 'express';
import session from 'express-session';
import {
  initialize as passportInitialize,
  session as passportSession,
  default as passport,
} from './config/passport.js';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import ordersRoutes from './routes/ordersRoutes.js';
import shelfRoutes from './routes/shelfRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import { verifyToken } from './middlewares/auth.middleware.js';
import mongoose from 'mongoose';
import connectDB from './config/db.js'; // Import the database connection

const app = express();

// Initialize MongoDB connection
connectDB(); // This will connect to MongoDB Atlas

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8081',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Handle OPTIONS requests explicitly
app.options('*', cors()); // Enable preflight for all routes

// Middlewares
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true }));

// Session configuration for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// initialize passport
app.use(passportInitialize());
app.use(passportSession());

// Handle OPTIONS requests for all routes
app.options('*', (req, res) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    process.env.FRONTEND_URL || 'http://localhost:8081'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-access-token'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(204).send();
});

// Health check endpoint with DB status
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'OK',
    database: statusMap[dbStatus] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);
app.use('/api', categoryRoutes);

// Protected routes (authentication required)
app.use('/api/dashboard', verifyToken, dashboardRoutes);
app.use('/api/orders', verifyToken, ordersRoutes);
app.use('/api/shelf', verifyToken, shelfRoutes);
app.use('/api/profile', verifyToken, profileRoutes);
app.use('/api/support', verifyToken, supportRoutes);
app.use('/api/payment', paymentRoutes); // Some routes don't need auth (callbacks)
app.use('/api/chat', verifyToken, chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
