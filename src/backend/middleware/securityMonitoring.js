/**
 * Security Monitoring Middleware
 * Login ve auth event'lerini güvenlik servislere rapor eder
 */

import fraudDetectionBot from '../services/fraudDetectionBot.js';
import securityMonitoringService from '../services/securityMonitoringService.js';

/**
 * Login denemesini kaydet
 */
export const recordLoginAttempt = (req, res, next) => {
  res.locals.recordLogin = (userId, success) => {
    const ip = req.ip || req.connection.remoteAddress;
    fraudDetectionBot.recordLoginAttempt(userId, success, ip);
    
    if (success) {
      securityMonitoringService.addAlert({
        type: 'LOGIN_SUCCESSFUL',
        severity: 'LOW',
        userId,
        ip,
        timestamp: new Date()
      });
    }
  };
  
  next();
};

/**
 * Güvenlik açısından şüpheli aktivite kaydı
 */
export const recordSuspiciousActivity = (req, res, next) => {
  res.locals.flagActivity = (userId, activityType, details) => {
    securityMonitoringService.recordSuspiciousActivity(userId, activityType, details);
  };
  
  next();
};

/**
 * Transaction header'ları doğrula
 */
export const validateTransactionHeaders = (req, res, next) => {
  // User-Agent ve IP'yi transaction'a ekle
  req.clientIP = req.ip || req.connection.remoteAddress;
  req.userAgent = req.get('user-agent');
  
  next();
};

/**
 * Hata yanıtında güvenlik log'u
 */
export const logSecurityError = (err, req, res, next) => {
  if (err.status >= 401 && err.status <= 403) {
    const userId = req.user?.userId;
    const ip = req.ip || req.connection.remoteAddress;
    
    securityMonitoringService.addAlert({
      type: 'AUTHENTICATION_ERROR',
      severity: 'MEDIUM',
      userId,
      ip,
      endpoint: req.path,
      method: req.method,
      errorMessage: err.message,
      timestamp: new Date()
    });
  }
  
  next(err);
};

export default {
  recordLoginAttempt,
  recordSuspiciousActivity,
  validateTransactionHeaders,
  logSecurityError
};
