import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { profile, settings } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        ...(profile && { profile }),
        ...(settings && { settings })
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

export const connectWallet = async (req, res, next) => {
  try {
    const { walletAddress, walletType } = req.body;

    const existingWallet = await User.findOne({ walletAddress });

    if (existingWallet && existingWallet._id.toString() !== req.user.userId) {
      return res.status(409).json({ error: 'Wallet address already connected to another account' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        walletAddress,
        walletType,
        isWalletVerified: true
      },
      { new: true }
    ).select('-password');

    // Create portfolio if doesn't exist
    const portfolio = await Portfolio.findOne({ userId: req.user.userId });

    if (!portfolio) {
      await Portfolio.create({
        userId: req.user.userId,
        walletAddress
      });
    }

    res.json({
      message: 'Wallet connected successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

export const disconnectWallet = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        walletAddress: null,
        walletType: null,
        isWalletVerified: false
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Wallet disconnected successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

export const enableTwoFactor = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { 'settings.twoFactorEnabled': true },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Two-factor authentication enabled',
      user
    });
  } catch (error) {
    next(error);
  }
};

export const disableTwoFactor = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        'settings.twoFactorEnabled': false,
        'settings.twoFactorSecret': null
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Two-factor authentication disabled',
      user
    });
  } catch (error) {
    next(error);
  }
};
