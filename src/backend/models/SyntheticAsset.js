import mongoose from 'mongoose';

const syntheticAssetSchema = new mongoose.Schema({
  // Varlık Temel Bilgiler
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['precious_metal', 'energy', 'agricultural', 'cryptocurrency', 'stablecoin', 'platform_token'],
    required: true
  },

  // Fiyat Bilgisi
  currentPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  priceUnit: {
    type: String,
    enum: ['USD', 'USDT', 'EUR'],
    default: 'USD'
  },
  priceHistory: [{
    price: Number,
    timestamp: { type: Date, default: Date.now }
  }],

  // Arz ve Talebi
  totalSupply: {
    type: Number,
    required: true,
    default: 0
  },
  circulatingSupply: {
    type: Number,
    required: true,
    default: 0
  },
  maxSupply: {
    type: Number,
    default: null
  },

  // Değişim Oranları (HomeRate'a göre)
  priceInHRate: {
    type: Number,
    required: true,
    min: 0
  },
  priceInHRateWei: {
    type: String,
    required: true
  },

  // Güncel Bilgiler
  dailyChange: {
    amount: Number,
    percentage: Number,
    timestamp: { type: Date, default: Date.now }
  },
  weeklyChange: {
    amount: Number,
    percentage: Number
  },
  monthlyChange: {
    amount: Number,
    percentage: Number
  },

  // Ticaret Bilgileri
  volume24h: {
    type: Number,
    default: 0
  },
  marketCap: {
    type: Number,
    default: 0
  },
  tradingVolume: [{
    timestamp: { type: Date, default: Date.now },
    volume: Number,
    transactions: Number
  }],

  // Parity (Eş değer) Bilgesi
  pairedWith: [{
    asset: {
      type: String,
      enum: ['HRATE', 'ETH', 'BTC', 'USDT', 'USD']
    },
    exchangeRate: Number,
    isActive: { type: Boolean, default: true }
  }],

  // Metadata
  description: String,
  imageUrl: String,
  decimals: {
    type: Number,
    default: 18
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },

  // Zaman Damgaları
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index tanımlamaları
syntheticAssetSchema.index({ symbol: 1, category: 1 });
syntheticAssetSchema.index({ currentPrice: 1 });
syntheticAssetSchema.index({ marketCap: -1 });
syntheticAssetSchema.index({ updatedAt: -1 });

// Pre-save hook
syntheticAssetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('SyntheticAsset', syntheticAssetSchema);
