/**
 * Blockchain Routes
 * Master account ve blockchain işlemleri
 */

import express from 'express';
import { adminMiddleware } from '../middleware/auth.js';
import masterBlockchainAccount from '../services/masterBlockchainAccount.js';

const router = express.Router();

/**
 * Master account bilgisi (Admin only)
 */
router.get('/master-account/info', adminMiddleware, (req, res) => {
  try {
    const accountInfo = masterBlockchainAccount.getMasterAccountInfo();
    
    res.json({
      success: true,
      account: accountInfo,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * Health check
 */
router.get('/master-account/health', adminMiddleware, async (req, res) => {
  try {
    const status = await masterBlockchainAccount.healthCheck();
    
    res.json({
      success: true,
      status,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * Ethereum balance
 */
router.get('/ethereum/balance', adminMiddleware, async (req, res) => {
  try {
    const balance = await masterBlockchainAccount.getEthereumBalance();
    
    res.json({
      success: true,
      balance: `${balance} ETH`,
      address: masterBlockchainAccount.accounts.eth.address,
      network: masterBlockchainAccount.accounts.eth.network,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date()
    });
  }
});

/**
 * Osmosis account info
 */
router.get('/osmosis/account', adminMiddleware, (req, res) => {
  try {
    const account = masterBlockchainAccount.getOsmosisAccount();
    
    res.json({
      success: true,
      account: {
        address: account.address,
        network: account.network,
        chainId: account.chainId
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date()
    });
  }
});

export default router;
