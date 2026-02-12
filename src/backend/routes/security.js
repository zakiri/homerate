/**
 * Security Routes
 * Security monitoring ve bot yönetimi endpoint'leri
 */

import express from 'express';
import { adminMiddleware } from '../middleware/auth.js';
import securityMonitoringService from '../services/securityMonitoringService.js';
import anomalyDetectionBot from '../services/anomalyDetectionBot.js';
import priceManipulationBot from '../services/priceManipulationBot.js';
import fraudDetectionBot from '../services/fraudDetectionBot.js';
import ddosPreventionBot from '../services/ddosPreventionBot.js';

const router = express.Router();

/**
 * Tüm güvenlik uyarılarını getir
 */
router.get('/alerts', adminMiddleware, (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const alerts = securityMonitoringService.getAlerts(limit);
    
    res.json({
      totalAlerts: alerts.length,
      alerts,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Kritik uyarıları getir
 */
router.get('/alerts/critical', adminMiddleware, (req, res) => {
  try {
    const alerts = securityMonitoringService.getAlerts();
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
    
    res.json({
      totalCriticalAlerts: criticalAlerts.length,
      alerts: criticalAlerts,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Güvenlik özeti (Dashboard)
 */
router.get('/dashboard', adminMiddleware, (req, res) => {
  try {
    const allAlerts = securityMonitoringService.getAlerts();

    const summary = {
      totalAlerts: allAlerts.length,
      criticalAlerts: allAlerts.filter(a => a.severity === 'CRITICAL').length,
      highAlerts: allAlerts.filter(a => a.severity === 'HIGH').length,
      mediumAlerts: allAlerts.filter(a => a.severity === 'MEDIUM').length,
      lowAlerts: allAlerts.filter(a => a.severity === 'LOW').length,
      
      botStatus: {
        anomalyDetection: {
          isRunning: anomalyDetectionBot.isRunning,
          stats: anomalyDetectionBot.getStats()
        },
        priceManipulation: {
          isRunning: priceManipulationBot.isRunning,
          stats: priceManipulationBot.getStats()
        },
        fraudDetection: {
          isRunning: fraudDetectionBot.isRunning,
          stats: fraudDetectionBot.getStats()
        },
        ddosProtection: {
          isRunning: ddosPreventionBot.isRunning,
          stats: ddosPreventionBot.getStats()
        }
      },

      recentAlerts: allAlerts.slice(-10).reverse(),
      lastUpdated: new Date()
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Anomali tespit botu start
 */
router.post('/bots/anomaly-detection/start', adminMiddleware, (req, res) => {
  try {
    anomalyDetectionBot.start();
    res.json({ message: 'Anomaly Detection Bot started', status: 'running' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Anomali tespit botu stop
 */
router.post('/bots/anomaly-detection/stop', adminMiddleware, (req, res) => {
  try {
    anomalyDetectionBot.stop();
    res.json({ message: 'Anomaly Detection Bot stopped', status: 'stopped' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Anomali tespit botu stats
 */
router.get('/bots/anomaly-detection/stats', adminMiddleware, (req, res) => {
  try {
    const stats = anomalyDetectionBot.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fiyat manipülasyonu botu start
 */
router.post('/bots/price-manipulation/start', adminMiddleware, (req, res) => {
  try {
    priceManipulationBot.start();
    res.json({ message: 'Price Manipulation Bot started', status: 'running' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fiyat manipülasyonu botu stop
 */
router.post('/bots/price-manipulation/stop', adminMiddleware, (req, res) => {
  try {
    priceManipulationBot.stop();
    res.json({ message: 'Price Manipulation Bot stopped', status: 'stopped' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fiyat manipülasyonu botu stats
 */
router.get('/bots/price-manipulation/stats', adminMiddleware, (req, res) => {
  try {
    const stats = priceManipulationBot.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Sahtekarl\u0131k tespit botu start
 */
router.post('/bots/fraud-detection/start', adminMiddleware, (req, res) => {
  try {
    fraudDetectionBot.start();
    res.json({ message: 'Fraud Detection Bot started', status: 'running' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Sahtekarl\u0131k tespit botu stop
 */
router.post('/bots/fraud-detection/stop', adminMiddleware, (req, res) => {
  try {
    fraudDetectionBot.stop();
    res.json({ message: 'Fraud Detection Bot stopped', status: 'stopped' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Sahtekarl\u0131k tespit botu stats
 */
router.get('/bots/fraud-detection/stats', adminMiddleware, (req, res) => {
  try {
    const stats = fraudDetectionBot.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DDoS koruma botu start
 */
router.post('/bots/ddos-protection/start', adminMiddleware, (req, res) => {
  try {
    ddosPreventionBot.start();
    res.json({ message: 'DDoS Prevention Bot started', status: 'running' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DDoS koruma botu stop
 */
router.post('/bots/ddos-protection/stop', adminMiddleware, (req, res) => {
  try {
    ddosPreventionBot.stop();
    res.json({ message: 'DDoS Prevention Bot stopped', status: 'stopped' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DDoS koruma botu stats
 */
router.get('/bots/ddos-protection/stats', adminMiddleware, (req, res) => {
  try {
    const stats = ddosPreventionBot.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Bloklanmış IP'leri getir
 */
router.get('/blocked-ips', adminMiddleware, (req, res) => {
  try {
    const blockedIPs = ddosPreventionBot.getBlockedIPs();
    res.json({
      blockedIPCount: blockedIPs.length,
      blockedIPs,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * IP'yi unblock et
 */
router.post('/unblock-ip', adminMiddleware, (req, res) => {
  try {
    const { ip } = req.body;
    const result = ddosPreventionBot.unblockIP(ip);
    
    if (result) {
      res.json({ message: `IP ${ip} unblocked`, success: true });
    } else {
      res.json({ message: `IP ${ip} was not blocked`, success: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Uyarıları temizle
 */
router.post('/alerts/clear', adminMiddleware, (req, res) => {
  try {
    securityMonitoringService.clearAlerts();
    res.json({ message: 'All alerts cleared', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
