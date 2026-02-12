import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoose from 'mongoose';
import http from 'http';
import { Server as IOServer } from 'socket.io';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import portfolioRoutes from './routes/portfolio.js';
import marketRoutes from './routes/market.js';
import transactionRoutes from './routes/transaction.js';
import assetRoutes from './routes/asset.js';
import swapRoutes from './routes/swap.js';
import securityRoutes from './routes/security.js';
import blockchainRoutes from './routes/blockchain.js';

// Middleware
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

// Security Services & Bots
import securityMonitoringService from './services/securityMonitoringService.js';
import anomalyDetectionBot from './services/anomalyDetectionBot.js';
import priceManipulationBot from './services/priceManipulationBot.js';
import fraudDetectionBot from './services/fraudDetectionBot.js';
import ddosPreventionBot from './services/ddosPreventionBot.js';

// Blockchain Master Account
import masterBlockchainAccount from './services/masterBlockchainAccount.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: process.env.REACT_APP_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.set('trust proxy', 1); // Trust proxy for rate limiting
app.use(cors({
  origin: process.env.REACT_APP_APP_URL || 'http://localhost:3000',
  credentials: true
}));

// Security middleware (DDoS prevention)
app.use((req, res, next) => {
  ddosPreventionBot.checkRequest(req, res, next);
});

app.use(rateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/homerate', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection failed:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/portfolio', authMiddleware, portfolioRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/transaction', authMiddleware, transactionRoutes);
app.use('/api/asset', assetRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io Events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('subscribe_market', (symbol) => {
    socket.join(`market_${symbol}`);
  });

  socket.on('unsubscribe_market', (symbol) => {
    socket.leave(`market_${symbol}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Export io for use in services
app.set('io', io);

// Error Handler
app.use(errorHandler);

// Initialize Master Blockchain Account
console.log('\n🔐 Initializing Master Blockchain Account...');
await masterBlockchainAccount.initialize();
const accountInfo = masterBlockchainAccount.getMasterAccountInfo();
if (accountInfo.enabled) {
  console.log('✅ Master account ready:');
  if (accountInfo.accounts.ethereum.initialized) {
    console.log(`   📍 Ethereum: ${accountInfo.accounts.ethereum.address}`);
  }
  if (accountInfo.accounts.osmosis.initialized) {
    console.log(`   📍 Osmosis: ${accountInfo.accounts.osmosis.address}`);
  }
}

// Start Security Bots
console.log('\n🚀 Starting Security Bots...');
anomalyDetectionBot.start();
priceManipulationBot.start();
fraudDetectionBot.start();
ddosPreventionBot.start();
console.log('✅ All security bots initialized and running\n');

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Security dashboard available at: http://localhost:${PORT}/api/security/dashboard`);
});

export default app;
