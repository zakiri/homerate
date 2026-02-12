import express from 'express';
import {
  getMarketData,
  getPriceHistory,
  searchCommodities,
  getTopMovers,
  getLiveChartData
} from '../controllers/marketController.js';

const router = express.Router();

router.get('/data/:symbol', getMarketData);
router.get('/history/:symbol', getPriceHistory);
router.get('/search', searchCommodities);
router.get('/top-movers', getTopMovers);
router.get('/chart/:symbol', getLiveChartData);

export default router;
