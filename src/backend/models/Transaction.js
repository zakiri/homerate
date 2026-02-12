import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    walletAddress: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['buy', 'sell', 'swap', 'transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed', 'BLOCKED_BY_ANOMALY_DETECTION', 'SECURITY_CHECK_FAILED'],
      default: 'pending'
    },
    fromSymbol: String,
    toSymbol: String,
    fromAmount: Number,
    toAmount: Number,
    price: Number,
    gasUsed: Number,
    gasFee: {
      type: Number,
      default: 0
    },
    transactionHash: String,
    chainId: {
      type: String,
      default: 'osmosis-1'
    },
    
    // Security fields
    clientIP: String,
    userAgent: String,
    signature: String,
    nonce: String,
    securityFlags: [{
      type: String,
      severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
      message: String,
      timestamp: { type: Date, default: Date.now }
    }],
    blockedAt: Date,
    blockedReason: String,
    
    timestamp: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

// Indexes for better performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ walletAddress: 1, createdAt: -1 });
transactionSchema.index({ fromSymbol: 1, toSymbol: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: 1 });

// TTL Index for old security flags (delete after 30 days)
transactionSchema.index({ 'securityFlags.timestamp': 1 }, { 
  expireAfterSeconds: 30 * 24 * 60 * 60 
});

export default mongoose.model('Transaction', transactionSchema);
