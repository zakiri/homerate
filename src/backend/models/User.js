import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true
    },
    walletAddresses: [{
      address: String,
      type: { type: String, enum: ['keplr', 'leap', 'ledger'] },
      addedAt: { type: Date, default: Date.now },
      isVerified: { type: Boolean, default: false }
    }],
    walletType: {
      type: String,
      enum: ['keplr', 'leap', 'ledger'],
      default: null
    },
    profile: {
      firstName: String,
      lastName: String,
      avatar: String,
      bio: String,
      phone: String,
      country: String,
      verificationLevel: {
        type: Number,
        default: 0
      }
    },
    settings: {
      twoFactorEnabled: {
        type: Boolean,
        default: false
      },
      twoFactorSecret: String,
      notificationsEnabled: {
        type: Boolean,
        default: true
      },
      emailNotifications: {
        type: Boolean,
        default: true
      },
      priceAlerts: {
        type: Boolean,
        default: true
      }
    },
    
    // Security fields
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isWalletVerified: {
      type: Boolean,
      default: false
    },
    passwordChangedAt: Date,
    twoFactorEnabledAt: Date,
    withdrawalAddressChangedAt: Date,
    lastLoginAt: Date,
    lastFailedLoginAt: Date,
    failedLoginCount: {
      type: Number,
      default: 0
    },
    loginIPs: [{
      ip: String,
      timestamp: { type: Date, default: Date.now },
      userAgent: String,
      isVerified: { type: Boolean, default: false }
    }],
    
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'walletAddresses.address': 1 });
userSchema.index({ lastLoginAt: 1 });
userSchema.index({ createdAt: 1 });

export default mongoose.model('User', userSchema);
