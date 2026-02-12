import express from 'express';
import * as swapController from '../controllers/swapController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes - Hesaplamalar
router.post('/calculate', swapController.calculateSwap);
router.post('/calculate-reverse', swapController.calculateReverseSwap);
router.post('/calculate-multi', swapController.multiSwap);
router.get('/fees', swapController.getSwapFees);

// Canlı fiyat ve likidite
router.get('/price/:symbol', swapController.getLivePrice);
router.get('/pool/:symbol1/:symbol2', swapController.getLiquidityPool);

// HRATE (wei) dönüşümleri
router.get('/convert/hrate-to-wei', swapController.convertHRateToWei);
router.get('/convert/wei-to-hrate', swapController.convertWeiToHRate);

// Protected routes
router.post('/execute', authMiddleware, swapController.executeSwap);
router.post('/limit-order', authMiddleware, swapController.createLimitOrder);

export default router;
