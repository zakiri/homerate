import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  connectWallet,
  disconnectWallet,
  enableTwoFactor,
  disableTwoFactor
} from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.post('/wallet/connect', connectWallet);
router.post('/wallet/disconnect', disconnectWallet);
router.post('/2fa/enable', enableTwoFactor);
router.post('/2fa/disable', disableTwoFactor);

export default router;
