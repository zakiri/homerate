import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
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
    assets: [
      {
        symbol: String,
        amount: Number,
        type: {
          type: String,
          enum: ['commodity', 'token', 'nft']
        },
        entryPrice: Number,
        currentPrice: Number,
        lastUpdated: Date
      }
    ],
    totalBalance: {
      type: Number,
      default: 0
    },
    balanceHistory: [
      {
        date: Date,
        balance: Number,
        gasSpent: Number
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('Portfolio', portfolioSchema);
