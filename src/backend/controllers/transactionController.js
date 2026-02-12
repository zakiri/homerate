import Transaction from '../models/Transaction.js';
import Portfolio from '../models/Portfolio.js';
import securityMonitoringService from '../services/securityMonitoringService.js';

const GAS_PRICE = parseFloat(process.env.GAS_PRICE) || 0.025;
const GAS_ADJUSTMENT = parseFloat(process.env.GAS_ADJUSTMENT) || 1.3;
const DEFAULT_GAS = parseInt(process.env.DEFAULT_GAS) || 200000;

export const getTransactionHistory = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const transactions = await Transaction.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Transaction.countDocuments({ userId: req.user.userId });

    res.json({
      transactions,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const {
      type,
      fromSymbol,
      toSymbol,
      fromAmount,
      toAmount,
      price,
      walletAddress
    } = req.body;

    const gasUsed = DEFAULT_GAS * GAS_ADJUSTMENT;
    const gasFee = gasUsed * GAS_PRICE;

    const transaction = new Transaction({
      userId: req.user.userId,
      walletAddress,
      type,
      fromSymbol,
      toSymbol,
      fromAmount,
      toAmount,
      price,
      gasUsed,
      gasFee,
      status: 'pending',
      clientIP: req.ip,
      userAgent: req.get('user-agent')
    });

    // 🔒 Security Validation
    const securityValidation = await securityMonitoringService.validateTransaction(transaction);
    
    if (!securityValidation.isValid) {
      // High risk transaction detected
      transaction.status = 'SECURITY_CHECK_FAILED';
      
      // Log security issues
      const issuesSummary = securityValidation.issues.map(i => `${i.type}: ${i.message}`).join(' | ');
      console.log(`⚠️  Transaction ${transaction._id} failed security validation: ${issuesSummary}`);

      // If critical risk, reject the transaction
      if (securityValidation.riskScore > 80) {
        return res.status(403).json({
          error: 'Transaction blocked by security system',
          riskScore: securityValidation.riskScore,
          issues: securityValidation.issues,
          timestamp: securityValidation.timestamp
        });
      }

      // Otherwise, allow but mark for review
      transaction.securityFlags = securityValidation.issues;
    }

    await transaction.save();

    // Update portfolio
    const portfolio = await Portfolio.findOne({ userId: req.user.userId });

    if (portfolio) {
      portfolio.balanceHistory.push({
        date: new Date(),
        balance: portfolio.totalBalance,
        gasSpent: gasFee
      });

      await portfolio.save();
    }

    // Update user behavior profile in fraud detection
    securityMonitoringService.updateUserBehaviorProfile(
      req.user.userId,
      {
        amount: fromAmount,
        isSuspicious: securityValidation.riskScore > 30
      }
    );

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
      gasFee,
      securityValidation: {
        riskScore: securityValidation.riskScore,
        passed: securityValidation.isValid
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionStatus = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

export const estimateGas = async (req, res, next) => {
  try {
    const { type, fromAmount } = req.body;

    let estimatedGas = DEFAULT_GAS;

    if (type === 'swap') {
      estimatedGas = Math.floor(DEFAULT_GAS * 1.5);
    } else if (type === 'transfer') {
      estimatedGas = Math.floor(DEFAULT_GAS * 0.8);
    }

    const adjustedGas = estimatedGas * GAS_ADJUSTMENT;
    const gasFee = adjustedGas * GAS_PRICE;

    res.json({
      estimatedGas,
      adjustedGas,
      gasFee,
      gasPrice: GAS_PRICE,
      gasAdjustment: GAS_ADJUSTMENT
    });
  } catch (error) {
    next(error);
  }
};
