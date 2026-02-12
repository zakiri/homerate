import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';

export const getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.userId });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    res.json(portfolio);
  } catch (error) {
    next(error);
  }
};

export const getAssets = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.userId });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    res.json(portfolio.assets);
  } catch (error) {
    next(error);
  }
};

export const getBalanceHistory = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.userId });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    res.json(portfolio.balanceHistory);
  } catch (error) {
    next(error);
  }
};

export const updatePortfolio = async (req, res, next) => {
  try {
    const { assets, totalBalance } = req.body;

    const portfolio = await Portfolio.findOneAndUpdate(
      { userId: req.user.userId },
      {
        assets,
        totalBalance,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      message: 'Portfolio updated successfully',
      portfolio
    });
  } catch (error) {
    next(error);
  }
};
