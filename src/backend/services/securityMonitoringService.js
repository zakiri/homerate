/**
 * Security Monitoring Service
 * Borsa işlemlerini güvenlik açısından gerçek zamanlı izler
 */

import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

class SecurityMonitoringService {
  constructor() {
    this.alerts = [];
    this.suspiciousActivities = new Map();
    this.userBehaviorProfiles = new Map();
    this.transactionLogs = [];
    this.MAX_ALERTS = 1000;
    this.SUSPICIOUS_ACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * İşlem güvenliğini kontrol et
   */
  async validateTransaction(transaction) {
    const validations = [
      this.checkAmountAnomaly(transaction),
      this.checkFrequencyAnomaly(transaction),
      this.checkAddressPatterns(transaction),
      this.checkPriceManipulation(transaction),
      this.checkReplayAttackVectors(transaction),
      this.checkFrontRunning(transaction),
      this.detectDoubleSpeeding(transaction)
    ];

    const results = await Promise.all(validations);
    return {
      isValid: results.every(r => r.isValid),
      issues: results.flatMap(r => r.issues || []),
      riskScore: this.calculateRiskScore(results),
      timestamp: new Date()
    };
  }

  /**
   * Tutar anomalisini kontrol et
   */
  async checkAmountAnomaly(transaction) {
    try {
      const userId = transaction.userId;
      
      // Kullanıcının geçmiş işlemlerini al
      const pastTransactions = await Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(100);

      if (pastTransactions.length === 0) {
        return { isValid: true, issues: [] };
      }

      // Ortalama işlem tutarını hesapla
      const avgAmount = pastTransactions.reduce((sum, t) => sum + parseFloat(t.fromAmount || 0), 0) / pastTransactions.length;
      const currentAmount = parseFloat(transaction.fromAmount || 0);
      const stdDev = this.calculateStdDev(
        pastTransactions.map(t => parseFloat(t.fromAmount || 0)),
        avgAmount
      );

      // 3 sigma kuralı
      if (Math.abs(currentAmount - avgAmount) > 3 * stdDev && stdDev > 0) {
        return {
          isValid: false,
          issues: [{
            type: 'AMOUNT_ANOMALY',
            severity: 'HIGH',
            message: `İşlem tutarı normalden çok farklı: ${currentAmount} vs ortalama ${avgAmount.toFixed(2)}`
          }]
        };
      }

      return { isValid: true, issues: [] };
    } catch (error) {
      console.error('checkAmountAnomaly Error:', error);
      return { isValid: true, issues: [] };
    }
  }

  /**
   * İşlem sıklığı anomalisini kontrol et
   */
  async checkFrequencyAnomaly(transaction) {
    try {
      const userId = transaction.userId;
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      // Son 30 dakikada kaç işlem yapıldı
      const recentTransactions = await Transaction.countDocuments({
        userId,
        createdAt: { $gte: thirtyMinutesAgo }
      });

      // Son 24 saatte ortalama işlem sıklığı
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const dailyTransactions = await Transaction.countDocuments({
        userId,
        createdAt: { $gte: oneDayAgo }
      });

      const avgDaily = dailyTransactions / 1;
      const avgHourly = avgDaily / 24;

      // Eğer 30 dakikada saatlik ortalamadan 5 kat fazla işlem yapılmışsa
      if (recentTransactions > avgHourly * 5) {
        return {
          isValid: false,
          issues: [{
            type: 'FREQUENCY_ANOMALY',
            severity: 'MEDIUM',
            message: `Anormal işlem sıklığı tespit edildi: ${recentTransactions} işlem son 30 dakikada`
          }]
        };
      }

      return { isValid: true, issues: [] };
    } catch (error) {
      console.error('checkFrequencyAnomaly Error:', error);
      return { isValid: true, issues: [] };
    }
  }

  /**
   * Adres modellerini kontrol et (Whitelist/Blacklist)
   */
  async checkAddressPatterns(transaction) {
    const issues = [];

    // Blacklist kontrol
    const blacklistedAddresses = [
      // Bilinen kötü niyetli cüzdanlar
      '0x0000000000000000000000000000000000000000', // Null address
    ];

    if (blacklistedAddresses.includes(transaction.walletAddress?.toLowerCase())) {
      issues.push({
        type: 'BLACKLISTED_ADDRESS',
        severity: 'CRITICAL',
        message: 'Cüzdan kara listede!'
      });
    }

    // Aynı wallettan çok hızlı birden fazla işlem
    const sameChubbingTransactions = await Transaction.countDocuments({
      walletAddress: transaction.walletAddress,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    if (sameChubbingTransactions > 10) {
      issues.push({
        type: 'RAPID_ADDRESS_USAGE',
        severity: 'HIGH',
        message: 'Aynı cüzdandan çok hızlı birden fazla işlem'
      });
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Fiyat manipülasyonu kontrolü
   */
  async checkPriceManipulation(transaction) {
    try {
      const { fromSymbol, toSymbol, price, createdAt } = transaction;
      const oneHourAgo = new Date(new Date(createdAt).getTime() - 60 * 60 * 1000);

      // Son 1 saatteki aynı symbol çiftinde yapılan işlemler
      const recentTrades = await Transaction.find({
        fromSymbol,
        toSymbol,
        createdAt: { $gte: oneHourAgo }
      }).sort({ createdAt: -1 });

      if (recentTrades.length < 2) {
        return { isValid: true, issues: [] };
      }

      // Fiyat değişimini hesapla
      const prices = recentTrades.map(t => parseFloat(t.price));
      const avgPrice = prices.reduce((a, b) => a + b) / prices.length;
      const priceDeviation = Math.abs(parseFloat(price) - avgPrice) / avgPrice * 100;

      if (priceDeviation > 20) { // %20'den fazla sapma
        return {
          isValid: false,
          issues: [{
            type: 'PRICE_MANIPULATION',
            severity: 'HIGH',
            message: `Anormal fiyat sapması: ${priceDeviation.toFixed(2)}% (Mevcut: ${price}, Ortalama: ${avgPrice.toFixed(2)})`
          }]
        };
      }

      return { isValid: true, issues: [] };
    } catch (error) {
      console.error('checkPriceManipulation Error:', error);
      return { isValid: true, issues: [] };
    }
  }

  /**
   * Replay Attack vektörlerini kontrol et
   */
  async checkReplayAttackVectors(transaction) {
    try {
      const { signature, nonce, walletAddress } = transaction;

      // Aynı signature'ı önceden görmüş mü?
      const existingTransaction = await Transaction.findOne({
        signature,
        walletAddress
      });

      if (existingTransaction) {
        return {
          isValid: false,
          issues: [{
            type: 'REPLAY_ATTACK_DETECTED',
            severity: 'CRITICAL',
            message: 'Aynı imza ile daha önceden bir işlem yapılmış!'
          }]
        };
      }

      return { isValid: true, issues: [] };
    } catch (error) {
      console.error('checkReplayAttackVectors Error:', error);
      return { isValid: true, issues: [] };
    }
  }

  /**
   * Front-running saldırısını kontrol et
   */
  async checkFrontRunning(transaction) {
    try {
      const { fromSymbol, toSymbol, fromAmount, createdAt } = transaction;
      const lastMinute = new Date(new Date(createdAt).getTime() - 60 * 1000);

      // Son 1 dakikada yapılan aynı symbol çiftinde işlemi yüksek tutarlı işlemler
      const highValueTrades = await Transaction.find({
        fromSymbol,
        toSymbol,
        createdAt: { $gte: lastMinute },
        fromAmount: { $gt: parseFloat(fromAmount) * 2 }
      });

      if (highValueTrades.length > 3) {
        return {
          isValid: false,
          issues: [{
            type: 'FRONT_RUNNING_DETECTED',
            severity: 'HIGH',
            message: `Potansiyel front-running durumu: Son 1 dakikada ${highValueTrades.length} yüksek tutarlı işlem`
          }]
        };
      }

      return { isValid: true, issues: [] };
    } catch (error) {
      console.error('checkFrontRunning Error:', error);
      return { isValid: true, issues: [] };
    }
  }

  /**
   * Çifte harcama (Double Spending) kontrolü
   */
  async detectDoubleSpeeding(transaction) {
    try {
      const { walletAddress, fromSymbol, fromAmount, _id } = transaction;
      const lastFiveSeconds = new Date(Date.now() - 5 * 1000);

      // Son 5 saniyede aynı cüzdandan aynı symbol için yapılan işlemler
      const duplicateTransactions = await Transaction.find({
        _id: { $ne: mongoose.Types.ObjectId.isValid(_id) ? _id : null },
        walletAddress,
        fromSymbol,
        createdAt: { $gte: lastFiveSeconds }
      });

      if (duplicateTransactions.length > 0) {
        const totalAmount = duplicateTransactions.reduce((sum, t) => sum + parseFloat(t.fromAmount), 0) + parseFloat(fromAmount);
        const walletBalance = await this.getUserBalance(transaction.userId, fromSymbol);

        if (totalAmount > walletBalance) {
          return {
            isValid: false,
            issues: [{
              type: 'DOUBLE_SPENDING_DETECTED',
              severity: 'CRITICAL',
              message: `Çifte harcama tespiti: Toplam tutar ${totalAmount}, Bakiye: ${walletBalance}`
            }]
          };
        }
      }

      return { isValid: true, issues: [] };
    } catch (error) {
      console.error('detectDoubleSpeeding Error:', error);
      return { isValid: true, issues: [] };
    }
  }

  /**
   * Risk skorunu hesapla
   */
  calculateRiskScore(results) {
    let score = 0;

    results.forEach(result => {
      if (!result.isValid) {
        result.issues?.forEach(issue => {
          switch (issue.severity) {
            case 'CRITICAL':
              score += 100;
              break;
            case 'HIGH':
              score += 50;
              break;
            case 'MEDIUM':
              score += 25;
              break;
            case 'LOW':
              score += 10;
              break;
          }
        });
      }
    });

    return Math.min(score, 100);
  }

  /**
   * Standart sapma hesapla
   */
  calculateStdDev(values, mean) {
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Kullanıcının bakiyesini al
   */
  async getUserBalance(userId, symbol) {
    try {
      const portfolio = await Portfolio.findOne({ userId });
      if (!portfolio) return 0;
      
      const asset = portfolio.assets?.find(a => a.symbol === symbol);
      return asset ? parseFloat(asset.balance) : 0;
    } catch (error) {
      console.error('getUserBalance Error:', error);
      return 0;
    }
  }

  /**
   * Güvenlik uyarısı ekle
   */
  addAlert(alert) {
    this.alerts.push({
      ...alert,
      id: this.generateAlertId(),
      timestamp: new Date()
    });

    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts = this.alerts.slice(-this.MAX_ALERTS);
    }
  }

  /**
   * Şüpheli aktivite kaydı
   */
  recordSuspiciousActivity(userId, activityType, details) {
    const key = `${userId}:${activityType}`;
    
    if (!this.suspiciousActivities.has(key)) {
      this.suspiciousActivities.set(key, []);
    }

    const activities = this.suspiciousActivities.get(key);
    activities.push({
      timestamp: new Date(),
      details
    });

    // Eski aktiviteleri temizle
    const validActivities = activities.filter(
      a => Date.now() - a.timestamp.getTime() < this.SUSPICIOUS_ACTIVITY_TIMEOUT
    );
    this.suspiciousActivities.set(key, validActivities);
  }

  /**
   * Tüm uyarıları getir
   */
  getAlerts(limit = 100) {
    return this.alerts.slice(-limit);
  }

  /**
   * Uyarıları temizle
   */
  clearAlerts() {
    this.alerts = [];
  }

  /**
   * Alert ID oluştur
   */
  generateAlertId() {
    return `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Session'ı getir ve profili güncelle
   */
  async updateUserBehaviorProfile(userId, behavior) {
    if (!this.userBehaviorProfiles.has(userId)) {
      this.userBehaviorProfiles.set(userId, {
        totalTransactions: 0,
        totalVolume: 0,
        lastActivity: null,
        suspiciousCount: 0,
        riskLevel: 'LOW'
      });
    }

    const profile = this.userBehaviorProfiles.get(userId);
    profile.totalTransactions += 1;
    profile.totalVolume += parseFloat(behavior.amount || 0);
    profile.lastActivity = new Date();

    if (behavior.isSuspicious) {
      profile.suspiciousCount += 1;
      profile.riskLevel = this.calculateRiskLevel(profile);
    }
  }

  /**
   * Risk seviyesini hesapla
   */
  calculateRiskLevel(profile) {
    const suspiciousRatio = profile.suspiciousCount / profile.totalTransactions;

    if (suspiciousRatio > 0.5) return 'CRITICAL';
    if (suspiciousRatio > 0.3) return 'HIGH';
    if (suspiciousRatio > 0.1) return 'MEDIUM';
    return 'LOW';
  }
}

export default new SecurityMonitoringService();
