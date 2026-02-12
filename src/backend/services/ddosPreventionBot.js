/**
 * DDoS & Attack Prevention Bot
 * DDoS, brute force, injection ve diğer ağ saldırılarını tespit ve engeller
 */

import securityMonitoringService from './securityMonitoringService.js';

class DDosAndAttackPreventionBot {
  constructor() {
    this.requestLog = new Map(); // ip -> [{ timestamp, endpoint, method, status }]
    this.blockedIPs = new Set();
    this.suspiciousPatterns = new Map();
    this.requestQuotas = new Map();
    this.isRunning = false;
    this.detectionInterval = null;
    this.BLOCK_DURATION = 60 * 60 * 1000; // 1 hour
    this.REQUEST_WINDOW = 60 * 1000; // 1 minute
    this.MAX_REQUESTS_PER_MINUTE = 100;
    this.MAX_REQUESTS_PER_ENDPOINT = 30;
  }

  /**
   * Bot'u başlat
   */
  start() {
    if (this.isRunning) {
      console.log('DDoS & Attack Prevention Bot is already running');
      return;
    }

    this.isRunning = true;
    console.log('🤖 DDoS & Attack Prevention Bot started');

    // Her 10 saniyede kontrol et
    this.detectionInterval = setInterval(async () => {
      await this.checkForAttacks();
    }, 10000);
  }

  /**
   * Bot'u durdur
   */
  stop() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.isRunning = false;
      console.log('DDoS & Attack Prevention Bot stopped');
    }
  }

  /**
   * Saldırıları kontrol et
   */
  async checkForAttacks() {
    try {
      // IP'leri kontrol et
      await this.checkIPBasedAttacks();

      // İçerik tabanlı saldırıları kontrol et
      await this.checkContentBasedAttacks();

      // Rate limiting'i uygula
      this.enforceRateLimits();

      // Zaman aşımı olan blokları temizle
      this.cleanupExpiredBlocks();
    } catch (error) {
      console.error('Error in checkForAttacks:', error);
    }
  }

  /**
   * Middleware olarak kullanılmak üzere request'i kontrol et
   */
  checkRequest(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;

    // IP bloklanmış mı kontrol et
    if (this.blockedIPs.has(ip)) {
      securityMonitoringService.addAlert({
        type: 'BLOCKED_IP_ATTEMPTED_ACCESS',
        severity: 'HIGH',
        ip,
        endpoint: req.path,
        method: req.method,
        message: `Bloklanmış IP erişim denemesi: ${ip} -> ${req.method} ${req.path}`,
        timestamp: new Date()
      });

      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Bu IP adresi geçici olarak bloklanmıştır.'
      });
    }

    // Request'i logla
    this.logRequest(ip, req.path, req.method);

    // Rate limiti kontrol et
    if (!this.checkRateLimit(ip)) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.'
      });
    }

    // Payload validation
    if (req.body && typeof req.body === 'object') {
      const injectionCheck = this.checkPayloadForInjection(req.body);
      if (injectionCheck.isSuspicious) {
        securityMonitoringService.addAlert({
          type: 'INJECTION_ATTACK_DETECTED',
          severity: 'CRITICAL',
          ip,
          endpoint: req.path,
          method: req.method,
          suspiciousFields: injectionCheck.fields,
          message: `İnjection saldırısı algılandı: ${injectionCheck.fields.join(', ')}`,
          timestamp: new Date()
        });

        this.blockIP(ip, 'Injection Attack');
        return res.status(400).json({
          error: 'Invalid Request',
          message: 'İstek doğrulama başarısız.'
        });
      }
    }

    next();
  }

  /**
   * Request'i logla
   */
  logRequest(ip, endpoint, method) {
    if (!this.requestLog.has(ip)) {
      this.requestLog.set(ip, []);
    }

    const logs = this.requestLog.get(ip);
    logs.push({
      timestamp: new Date(),
      endpoint,
      method,
      status: 'pending'
    });

    // 1 saatten eski logları temizle
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const validLogs = logs.filter(l => l.timestamp > oneHourAgo);
    this.requestLog.set(ip, validLogs);
  }

  /**
   * IP tabanlı saldırıları kontrol et
   */
  async checkIPBasedAttacks() {
    try {
      const oneMinuteAgo = new Date(Date.now() - this.REQUEST_WINDOW);

      for (const [ip, logs] of this.requestLog) {
        const recentLogs = logs.filter(l => l.timestamp > oneMinuteAgo);

        // DDoS hipotezi: Bir IP'den çok sayıda request
        if (recentLogs.length > this.MAX_REQUESTS_PER_MINUTE) {
          securityMonitoringService.addAlert({
            type: 'POSSIBLE_DDOS_ATTACK',
            severity: 'CRITICAL',
            ip,
            requestCount: recentLogs.length,
            timeWindow: '1 minute',
            message: `${ip}'den 1 dakikada ${recentLogs.length} request - DDoS saldırısı şüphesi`,
            timestamp: new Date()
          });

          this.blockIP(ip, 'Possible DDoS Attack');
          console.log(`🚨 DDoS ALERT: IP ${ip} - ${recentLogs.length} requests in 1 minute`);
        }

        // Tek endpoint'e DDoS
        const endpointCounts = {};
        for (const log of recentLogs) {
          endpointCounts[log.endpoint] = (endpointCounts[log.endpoint] || 0) + 1;
        }

        for (const [endpoint, count] of Object.entries(endpointCounts)) {
          if (count > this.MAX_REQUESTS_PER_ENDPOINT) {
            securityMonitoringService.addAlert({
              type: 'ENDPOINT_DDOS_ATTACK',
              severity: 'HIGH',
              ip,
              endpoint,
              requestCount: count,
              message: `${ip} -> ${endpoint} endpoint'ine ${count} request`,
              timestamp: new Date()
            });

            this.blockIP(ip, `Endpoint DDoS: ${endpoint}`);
          }
        }

        // Scanner tespiti (çok çeşitli endpoint'lere erişim)
        const uniqueEndpoints = new Set(recentLogs.map(l => l.endpoint));
        if (uniqueEndpoints.size > 20) {
          securityMonitoringService.addAlert({
            type: 'PORT_SCANNER_DETECTED',
            severity: 'HIGH',
            ip,
            endpointCount: uniqueEndpoints.size,
            endpoints: Array.from(uniqueEndpoints).slice(0, 10),
            message: `${ip} tarafından ${uniqueEndpoints.size} farklı endpoint taranıyor - Port Scanner şüphesi`,
            timestamp: new Date()
          });

          this.blockIP(ip, 'Port Scanner Detected');
          console.log(`🚨 SCANNER ALERT: IP ${ip} scanning ${uniqueEndpoints.size} endpoints`);
        }
      }
    } catch (error) {
      console.error('Error in checkIPBasedAttacks:', error);
    }
  }

  /**
   * İçerik tabanlı saldırıları kontrol et
   */
  async checkContentBasedAttacks() {
    try {
      // SQL Injection patterns
      const sqlInjectionPatterns = [
        /(\b(UNION|SELECT|INSERT|DELETE|DROP|UPDATE|ALTER)\b.*\b(FROM|WHERE|INTO)\b)/gi,
        /(-{2}|;|\*|\/\*)/,
        /('.*'.*'|(\'|\").*(\''|\"')|OR\s*1\s*=\s*1)/gi
      ];

      // XSS patterns
      const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi
      ];

      // Command injection patterns
      const commandInjectionPatterns = [
        /[;&|`$()]/,
        /\.\.\/|\.\.%2f/gi,
        /bin\//gi
      ];

      return {
        sqlPatterns: sqlInjectionPatterns,
        xssPatterns: xssPatterns,
        commandPatterns: commandInjectionPatterns
      };
    } catch (error) {
      console.error('Error in checkContentBasedAttacks:', error);
    }
  }

  /**
   * Payload'da injection kontrolü
   */
  checkPayloadForInjection(payload, depth = 0) {
    const sqlPatterns = [
      /(\b(UNION|SELECT|INSERT|DELETE|DROP|UPDATE|ALTER)\b\s*\b(FROM|WHERE|INTO)\b)/gi,
      /(union.*select|insert.*into|delete.*from|drop.*table)/gi,
      /(-{2}|;|\*|\/\*)/
    ];

    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi
    ];

    const suspiciousFields = [];

    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === 'string') {
        // SQL Injection check
        if (sqlPatterns.some(pattern => pattern.test(value))) {
          suspiciousFields.push(`${key} (SQL Injection)`);
        }

        // XSS check
        if (xssPatterns.some(pattern => pattern.test(value))) {
          suspiciousFields.push(`${key} (XSS)`);
        }

        // Excessive special characters
        const specialCharCount = (value.match(/[<>\"'%;()&|]/g) || []).length;
        if (specialCharCount > value.length * 0.2) {
          suspiciousFields.push(`${key} (Excessive Special Chars)`);
        }
      } else if (typeof value === 'object' && depth < 2) {
        const nestedCheck = this.checkPayloadForInjection(value, depth + 1);
        if (nestedCheck.isSuspicious) {
          suspiciousFields.push(...nestedCheck.fields);
        }
      }
    }

    return {
      isSuspicious: suspiciousFields.length > 0,
      fields: suspiciousFields
    };
  }

  /**
   * Rate limiti kontrol et
   */
  checkRateLimit(ip) {
    const oneMinuteAgo = new Date(Date.now() - this.REQUEST_WINDOW);

    if (!this.requestQuotas.has(ip)) {
      this.requestQuotas.set(ip, { count: 0, resetTime: Date.now() + this.REQUEST_WINDOW });
    }

    const quota = this.requestQuotas.get(ip);

    if (Date.now() > quota.resetTime) {
      quota.count = 0;
      quota.resetTime = Date.now() + this.REQUEST_WINDOW;
    }

    quota.count++;

    return quota.count <= this.MAX_REQUESTS_PER_MINUTE;
  }

  /**
   * Rate limiti uygula
   */
  enforceRateLimits() {
    const now = Date.now();

    for (const [ip, quota] of this.requestQuotas) {
      if (now > quota.resetTime) {
        this.requestQuotas.delete(ip);
      }
    }
  }

  /**
   * IP'yi engelle
   */
  blockIP(ip, reason) {
    if (this.blockedIPs.has(ip)) {
      return; // Zaten bloklanmış
    }

    this.blockedIPs.add(ip);

    securityMonitoringService.addAlert({
      type: 'IP_BLOCKED',
      severity: 'HIGH',
      ip,
      reason,
      unblockTime: new Date(Date.now() + this.BLOCK_DURATION),
      message: `IP bloklandı: ${ip} - Reason: ${reason}`,
      timestamp: new Date()
    });

    console.log(`🚫 IP BLOCKED: ${ip} - ${reason}`);

    // Block süresinin sonunda otomatik kaldır
    setTimeout(() => {
      this.blockedIPs.delete(ip);
      securityMonitoringService.addAlert({
        type: 'IP_UNBLOCKED',
        severity: 'LOW',
        ip,
        message: `IP blok kaldırıldı: ${ip}`,
        timestamp: new Date()
      });

      console.log(`✅ IP UNBLOCKED: ${ip}`);
    }, this.BLOCK_DURATION);
  }

  /**
   * Zaman aşımı olan blokları temizle
   */
  cleanupExpiredBlocks() {
    // Bu metod setTimeout üzerinden otomatik olarak çalışıyor
    // Manuel cleanup gerekirse çağrılabilir
    console.log(`Cleanup: ${this.blockedIPs.size} IPs currently blocked`);
  }

  /**
   * Bloklanmış IP'leri getir
   */
  getBlockedIPs() {
    return Array.from(this.blockedIPs);
  }

  /**
   * Stats'ı getir
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      blockedIPsCount: this.blockedIPs.size,
      trackedIPsCount: this.requestLog.size,
      blockedIPs: Array.from(this.blockedIPs),
      totalAttackAlertsGenerated: securityMonitoringService.alerts.filter(
        a => a.type?.includes('ATTACK') || a.type?.includes('DDoS') || a.type?.includes('SCANNER') || a.type?.includes('INJECTION')
      ).length
    };
  }

  /**
   * IP'yi manuel olarak unblock et (admin)
   */
  unblockIP(ip) {
    if (this.blockedIPs.has(ip)) {
      this.blockedIPs.delete(ip);
      console.log(`✅ Admin: IP ${ip} unblocked`);
      return true;
    }
    return false;
  }

  /**
   * Rate limit'ini reset et
   */
  resetRateLimits() {
    this.requestQuotas.clear();
    console.log('Rate limits reset');
  }
}

export default new DDosAndAttackPreventionBot();
