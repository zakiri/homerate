import express from 'express';
import * as assetController from '../controllers/assetController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', assetController.listAssets);
router.get('/categories', assetController.getCategories);
router.get('/search', assetController.searchAssets);
router.get('/top-performers', assetController.getTopPerformers);
router.get('/category/:category', assetController.getAssetsByCategory);
router.get('/:symbol', assetController.getAssetDetail);
router.get('/:symbol/quantity', assetController.getAssetQuantity);

// Protected routes
router.post('/:symbol/favorite', authMiddleware, assetController.toggleFavorite);

// Admin routes (would need admin middleware)
router.put('/:symbol/price', assetController.updateAssetPrice);

export default router;
