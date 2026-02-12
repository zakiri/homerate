/**
 * Fraud Detection Bot
 * Hesap ele geçirmesi, yetkisiz erişim ve diğer fraud modellerini tespit eder
 */

import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import securityMonitoringService from './securityMonitoringService.js';

class FraudDetectionBot {
  constructor() {
    this.loginAttempts = new Map(); // userId -> [{ timestamp, success, ip }]
    this.deviceProfiles = new Map(); // userId -> [{ device, ip, timestamp, isKnown }]
    this.transactionPatterns = new Map(); // userId -> { avgAmount, avgTime, preferred, etc. }
    this.isRunning = false;
    this.detectionInterval = null;
    this.MAX_LOGIN_ATTEMPTS = 5;
    this.LOGIN_ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Bot'u başlat
   */
  start() {
    if (this.isRunning) {
      console.log('Fraud Detection Bot is already running');
      return;
    }

    this.isRunning = true;
    console.log('🤖 Fraud Detection Bot started');

    // Her 15 saniyede kontrol et
    this.detectionInterval = setInterval(async () => {
      await this.checkFraudPatterns();
    }, 15000);
  }

  /**
   * Bot'u durdur
   */
  stop() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.isRunning = false;
      console.log('Fraud Detection Bot stopped');
    }
  }

  /**
   * Fraud modellerini kontrol et
   */
  async checkFraudPatterns() {
    try {
      // Son 5 dakikadaki işlemleri ve login denemelerini kontrol et
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const recentTransactions = await Transaction.find({
        createdAt: { $gte: fiveMinutesAgo }
      }).populate('userId');

      const recentUsers = await User.find({
        updatedAt: { $gte: fiveMinutesAgo }
      });

      for (const tx of recentTransactions) {
        await this.analyzeTransactionFraud(tx);
      }

      for (const user of recentUsers) {
        await this.analyzeAccountFraud(user);
      }

      // Global fraud pattern analizi
      await this.detectBulkFraudBehavior();
    } catch (error) {
      console.error('Error in checkFraudPatterns:', error);
    }
  }

  /**
   * İşlem fraud'ını analiz et
   */
  async analyzeTransactionFraud(transaction) {
    try {
      const userId = transaction.userId?._id || transaction.userId;

      // Hızlı ardışık işlemler (Bot işareti)
      await this.checkRapidTransactions(transaction, userId);

      // Coğrafi uyumsuzluk (gelecekte IP kontrolleri eklenebilir)
      await this.checkGeographicAnomaly(transaction, userId);

      // Cüzdan davranış anomalisi
      await this.checkWalletBehaviorAnomaly(transaction, userId);

      // Receiver pattern analizi
      await this.checkSuspiciousReceiverPattern(transaction);
    } catch (error) {
      console.error('Error in analyzeTransactionFraud:', error);
    }
  }

  /**
   * Hızlı ardışık işlemleri kontrol et
   */
  async checkRapidTransactions(transaction, userId) {
    try {
      const tenSecondsAgo = new Date(Date.now() - 10 * 1000);

      const rapidTransactions = await Transaction.countDocuments({
        userId,
        createdAt: { $gte: tenSecondsAgo }
      });

      // 10 saniyede 3+ işlem = Bot/Otomatik işlem şüphesi
      if (rapidTransactions > 3) {
        securityMonitoringService.addAlert({
          type: 'RAPID_TRANSACTION_SEQUENCE',
          severity: 'MEDIUM',
          userId,
          transactionCount: rapidTransactions,
          timeWindow: '10 seconds',
          message: `${rapidTransactions} işlem 10 saniyede - Bot/Otomatik işlem şüphesi`,
          timestamp: new Date()
        });

        securityMonitoringService.recordSuspiciousActivity(
          userId.toString(),
          'RAPID_TRANSACTIONS',
          { count: rapidTransactions }
        );
      }
    } catch (error) {
      console.error('Error in checkRapidTransactions:', error);
    }
  }

  /**
   * Coğrafi anomali kontrol et (IP tabanlı)
   */
  async checkGeographicAnomaly(transaction, userId) {
    try {
      // Şu anki cihaz/IP bilgisini al (transaction'dan veya context'ten)
      const currentIP = transaction.clientIP || 'unknown';
      const currentDevice = transaction.userAgent || 'unknown';

      if (!this.deviceProfiles.has(userId.toString())) {
        this.deviceProfiles.set(userId.toString(), []);
      }

      const devices = this.deviceProfiles.get(userId.toString());

      // Yeni cihaz/IP kombinasyonunu kontrol et
      const knownDevice = devices.some(
        d => d.ip === currentIP && d.device === currentDevice
      );

      if (!knownDevice && devices.length > 0) {
        // Yeni cihaz - ek doğrulama yapılmalı
        devices.push({
          ip: currentIP,
          device: currentDevice,
          timestamp: new Date(),
          isKnown: false
        });

        // 2+ yeni cihazdan aynı saatte işlem = Hesap ele geçirilme şüphesi
        const newDeviceCount = devices.filter(d => !d.isKnown && 
          Date.now() - d.timestamp.getTime() < 60 * 60 * 1000 // 1 saat
        ).length;

        if (newDeviceCount >= 2) {
          securityMonitoringService.addAlert({
            type: 'MULTIPLE_NEW_DEVICES',
            severity: 'HIGH',
            userId,
            deviceCount: newDeviceCount,
            message: `${newDeviceCount} yeni cihazdan 1 saatte işlem - Hesap ele geçirilme şüphesi`,
            timestamp: new Date()
          });

          securityMonitoringService.recordSuspiciousActivity(
            userId.toString(),
            'NEW_DEVICE_LOGIN',
            { ip: currentIP, device: currentDevice }
          );
        }
      } else if (!knownDevice) {
        // İlk kez bu cihazdan işlem yapılıyor
        devices.push({
          ip: currentIP,
          device: currentDevice,
          timestamp: new Date(),
          isKnown: false
        });
      }

      // Maksimum 50 cihazı tut
      if (devices.length > 50) {
        devices.shift();
      }
    } catch (error) {
      console.error('Error in checkGeographicAnomaly:', error);
    }
  }

  /**
   * Cüzdan davranış anomalisini kontrol et
   */
  async checkWalletBehaviorAnomaly(transaction, userId) {
    try {
      const walletAddress = transaction.walletAddress;

      // İlk olarak walletAddress kontrol et
      const user = await User.findById(userId);
      if (!user.walletAddresses?.includes(walletAddress)) {
        // Yeni cüzdan eklemek için izin var mı?
        securityMonitoringService.addAlert({
          type: 'UNAUTHORIZED_WALLET_USAGE',
          severity: 'HIGH',
          userId,
          walletAddress,
          message: `Kayıtlı olmayan cüzdandan işlem - Yetkisiz erişim şüphesi`,
          timestamp: new Date()
        });
      }

      // Cüzdandan yapılan toplam işlem sayısı
      const totalWalletTransactions = await Transaction.countDocuments({
        walletAddress
      });

      // En fazla işlem yapan cüzdanları kontrol et
      if (totalWalletTransactions > 1000) {
        securityMonitoringService.addAlert({
          type: 'HIGH_ACTIVITY_WALLET',
          severity: 'LOW',
          walletAddress,
          totalTransactions: totalWalletTransactions,
          message: `Yüksek aktivite cüzdan - ${totalWalletTransactions} işlem`,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error in checkWalletBehaviorAnomaly:', error);
    }
  }

  /**
   * Şüpheli receiver pattern'i kontrol et
   */
  async checkSuspiciousReceiverPattern(transaction) {
    try {
      // Aynı receiver'a çok hızlı birden fazla transfer = Rug Pull şüphesi
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const walletAddress = transaction.walletAddress;

      const transfersToSameWallet = await Transaction.find({
        walletAddress,
        createdAt: { $gte: oneMinuteAgo }
      });

      const destinationMap = {};
      for (const tx of transfersToSameWallet) {
        const dest = tx.toSymbol; // Exchange hedefi
        destinationMap[dest] = (destinationMap[dest] || 0) + 1;
      }

      // Aynı hedefe 5+ transfer = Rug Pull / Pump hazırlığı
      for (const [destination, count] of Object.entries(destinationMap)) {
        if (count >= 5) {
          securityMonitoringService.addAlert({
            type: 'SUSPICIOUS_RECEIVER_PATTERN',
            severity: 'HIGH',
            walletAddress,
            destination,
            transferCount: count,
            message: `${walletAddress} aynı hedefe 1 dakikada ${count} transfer - Rug Pull/Pump hazırlığı şüphesi`,
            timestamp: new Date()
          });

          console.log(`🚨 RUG PULL ALERT: Wallet ${walletAddress} sending to ${destination} (${count} times)`);
        }
      }
    } catch (error) {
      console.error('Error in checkSuspiciousReceiverPattern:', error);
    }
  }

  /**
   * Hesap fraud'ını analiz et
   */
  async analyzeAccountFraud(user) {
    try {
      // Şifre değişikliği kasıtsız
      await this.checkPasswordChangeAnomaly(user);

      // Email değişikliği
      await this.check2FADisable(user);

      // Banka bilgisi değişikliği
      await this.checkWithdrawalAddressChange(user);
    } catch (error) {
      console.error('Error in analyzeAccountFraud:', error);
    }
  }

  /**
   * Şifre değişikliği anomalisini kontrol et
   */
  async checkPasswordChangeAnomaly(user) {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Son 24 saatte şifre değişimi + işlem = Hesap ele geçirilme modeli
      if (user.passwordChangedAt && user.passwordChangedAt > oneDayAgo) {
        const transactionsAfterPasswordChange = await Transaction.countDocuments({
          userId: user._id,
          createdAt: { $gte: user.passwordChangedAt }
        });

        if (transactionsAfterPasswordChange > 5) {
          securityMonitoringService.addAlert({
            type: 'PASSWORD_CHANGE_BEFORE_TRANSACTIONS',
            severity: 'HIGH',
            userId: user._id,
            transactionCount: transactionsAfterPasswordChange,
            message: `Şifre değişikliğinden sonra ${transactionsAfterPasswordChange} işlem - Hesap ele geçirilme şüphesi`,
            timestamp: new Date()
          });

          console.log(`🚨 ACCOUNT TAKEOVER ALERT: User ${user._id} changed password and made ${transactionsAfterPasswordChange} transactions`);
        }
      }
    } catch (error) {
      console.error('Error in checkPasswordChangeAnomaly:', error);
    }
  }

  /**
   * 2FA devre dışı kullanım kontrolü
   */
  async check2FADisable(user) {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // 2FA'nın kaldırılması + çabuk işlemler = El atılmış
      if (user.twoFactorEnabledAt && !user.twoFactorEnabledAt && user.updatedAt > oneDayAgo) {
        const recentTransactions = await Transaction.countDocuments({
          userId: user._id,
          createdAt: { $gte: oneDayAgo }
        });

        if (recentTransactions > 3) {
          securityMonitoringService.addAlert({
            type: '2FA_DISABLED_SUSPICIOUS',
            severity: 'CRITICAL',
            userId: user._id,
            reason: '2FA disabled with active transactions',
            message: `2FA devre dışı bırakıldı ve ${recentTransactions} işlem yapıldı - Hesap ele geçirilme şüphesi!`,
            timestamp: new Date()
          });

          console.log(`🚨 CRITICAL: User ${user._id} disabled 2FA with active transactions`);
        }
      }
    } catch (error) {
      console.error('Error in check2FADisable:', error);
    }
  }

  /**
   * Çekme adresi değişikliğini kontrol et
   */
  async checkWithdrawalAddressChange(user) {
    try {
      // Eğer withdrawal address değiştirilmişse ve sonra transfer yapılmışsa
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      if (user.withdrawalAddressChangedAt && user.withdrawalAddressChangedAt > oneDayAgo) {
        const transactionsAfterAddressChange = await Transaction.countDocuments({
          userId: user._id,
          createdAt: { $gte: user.withdrawalAddressChangedAt }
        });

        if (transactionsAfterAddressChange > 2) {
          securityMonitoringService.addAlert({
            type: 'WITHDRAWAL_ADDRESS_CHANGED',
            severity: 'HIGH',
            userId: user._id,
            transactionCount: transactionsAfterAddressChange,
            message: `Çekme adresi değiştirildi ve hemen ardından ${transactionsAfterAddressChange} işlem - Hırsızlık şüphesi`,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error in checkWithdrawalAddressChange:', error);
    }
  }

  /**
   * Toplu fraud davranışını tespit et
   */
  async detectBulkFraudBehavior() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      // Son 1 saatteki tüm işlemleri al
      const recentTransactions = await Transaction.find({
        createdAt: { $gte: oneHourAgo }
      });

      // Benzer işlem modellerini bul
      const transactionPatterns = {};

      for (const tx of recentTransactions) {
        const pattern = `${tx.fromSymbol}:${tx.toSymbol}:${Math.round(tx.fromAmount / 10) * 10}`;
        transactionPatterns[pattern] = (transactionPatterns[pattern] || 0) + 1;
      }

      // Aynı pattern 20+ kez tekrarlanmışsa = Bot network
      for (const [pattern, count] of Object.entries(transactionPatterns)) {
        if (count >= 20) {
          const [fromSymbol, toSymbol] = pattern.split(':');

          securityMonitoringService.addAlert({
            type: 'BOT_NETWORK_DETECTED',
            severity: 'CRITICAL',
            pattern,
            occurrenceCount: count,
            message: `${count} kez tekrarlanan işlem deseni - Bot network şüphesi (${fromSymbol}→${toSymbol})`,
            timestamp: new Date()
          });

          console.log(`🚨 BOT NETWORK: Pattern repeated ${count} times - ${pattern}`);
        }
      }
    } catch (error) {
      console.error('Error in detectBulkFraudBehavior:', error);
    }
  }

  /**
   * Login denemesini kaydet
   */
  recordLoginAttempt(userId, success, ip) {
    if (!this.loginAttempts.has(userId.toString())) {
      this.loginAttempts.set(userId.toString(), []);
    }

    const attempts = this.loginAttempts.get(userId.toString());
    attempts.push({
      timestamp: new Date(),
      success,
      ip
    });

    // Eski denemeleripak ET
    const validAttempts = attempts.filter(
      a => Date.now() - a.timestamp.getTime() < this.LOGIN_ATTEMPT_WINDOW
    );
    this.loginAttempts.set(userId.toString(), validAttempts);

    // Başarısız giriş denemelerini kontrol et
    const failedAttempts = validAttempts.filter(a => !a.success);
    if (failedAttempts.length >= this.MAX_LOGIN_ATTEMPTS) {
      securityMonitoringService.addAlert({
        type: 'MULTIPLE_FAILED_LOGIN_ATTEMPTS',
        severity: 'HIGH',
        userId,
        attemptCount: failedAttempts.length,
        timeWindow: '15 minutes',
        ips: Array.from(new Set(failedAttempts.map(a => a.ip))),
        message: `${failedAttempts.length} başarısız login denemesi - Brute force saldırısı şüphesi`,
        timestamp: new Date()
      });

      console.log(`🚨 BRUTE FORCE ATTACK: User ${userId} - ${failedAttempts.length} failed attempts`);
    }
  }

  /**
   * Stats'ı getir
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      usersMonitored: this.deviceProfiles.size,
      devicesTracked: Array.from(this.deviceProfiles.values()).reduce((sum, arr) => sum + arr.length, 0),
      loginAttemptsTracking: this.loginAttempts.size,
      fraudAlertsGenerated: securityMonitoringService.alerts.filter(
        a => a.type?.includes('FRAUD') || a.type?.includes('ACCOUNT') || a.type?.includes('BOT_NETWORK')
      ).length
    };
  }
}

export default new FraudDetectionBot();
