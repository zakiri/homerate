import express from 'express';
import {
  getPortfolio,
  getAssets,
  getBalanceHistory,
  updatePortfolio
} from '../controllers/portfolioController.js';

const router = express.Router();

router.get('/', getPortfolio);
router.get('/assets', getAssets);
router.get('/balance-history', getBalanceHistory);
router.put('/', updatePortfolio);

export default router;
