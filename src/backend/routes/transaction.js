import express from 'express';
import {
  getTransactionHistory,
  createTransaction,
  getTransactionStatus,
  estimateGas
} from '../controllers/transactionController.js';

const router = express.Router();

router.get('/history', getTransactionHistory);
router.post('/create', createTransaction);
router.get('/:transactionId/status', getTransactionStatus);
router.post('/estimate-gas', estimateGas);

export default router;
