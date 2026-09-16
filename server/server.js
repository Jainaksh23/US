const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');
const couponRoutes = require('./routes/coupons');
const progressRoutes = require('./routes/progress');
const authMiddleware = require('./middleware/auth');
const setupGameSocket = require('./sockets/gameSocket');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', authMiddleware, gameRoutes);
app.use('/api/coupons', authMiddleware, couponRoutes);
app.use('/api/progress', authMiddleware, progressRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io
setupGameSocket(io);

// Initialize Cron Jobs for Content Engine
const { initCronJobs } = require('./jobs/cronJobs');
initCronJobs();

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.warn('⚠️  MongoDB not available, running without persistence:', err.message);
  }

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
