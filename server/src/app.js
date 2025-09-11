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
import { verifyToken } from './middlewares/auth.middleware.js';

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8081',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  })
);

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/dashboard', verifyToken, dashboardRoutes);
app.use('/api/orders', verifyToken, ordersRoutes);
app.use('/api/shelf', verifyToken, shelfRoutes);
app.use('/api/profile', verifyToken, profileRoutes);
app.use('/api/support', verifyToken, supportRoutes);

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
