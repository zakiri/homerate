/**
 * Anomaly Detection Bot
 * İşlemlerindeki anormal davranışları gerçek zamanlı tespit eder
 */

import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import securityMonitoringService from './securityMonitoringService.js';

class AnomalyDetectionBot {
  constructor() {
    this.detectionModels = new Map();
    this.userProfiles = new Map();
    this.statsCache = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    this.isRunning = false;
    this.detectionInterval = null;
  }

  /**
   * Anomali tespit botunu başlat
   */
  start() {
    if (this.isRunning) {
      console.log('Anomaly Detection Bot is already running');
      return;
    }

    this.isRunning = true;
    console.log('🤖 Anomaly Detection Bot started');

    // Her 5 saniyede bir kontrol et
    this.detectionInterval = setInterval(async () => {
      await this.checkForAnomalies();
    }, 5000);
  }

  /**
   * Anomali tespit botunu durdur
   */
  stop() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.isRunning = false;
      console.log('Anomaly Detection Bot stopped');
    }
  }

  /**
   * Anomalileri kontrol et
   */
  async checkForAnomalies() {
    try {
      // Son 5 saniyedeki işlemleri al
      const fiveSecondsAgo = new Date(Date.now() - 5 * 1000);
      const recentTransactions = await Transaction.find({
        createdAt: { $gte: fiveSecondsAgo }
      }).populate('userId');

      for (const transaction of recentTransactions) {
        await this.analyzeTransaction(transaction);
      }
    } catch (error) {
      console.error('Error in checkForAnomalies:', error);
    }
  }

  /**
   * İşlemi analiz et
   */
  async analyzeTransaction(transaction) {
    try {
      const userId = transaction.userId?._id || transaction.userId;
      const anomalies = [];

      // İstatistiksel anomalileri kontrol et
      const statAnomalies = await this.detectStatisticalAnomalies(transaction);
      anomalies.push(...statAnomalies);

      // Kullanıcı davranış anomalilerini kontrol et
      const behaviorAnomalies = await this.detectBehaviorAnomalies(transaction);
      anomalies.push(...behaviorAnomalies);

      // Ağ tabanlı anomalileri kontrol et
      const networkAnomalies = await this.detectNetworkAnomalies(transaction);
      anomalies.push(...networkAnomalies);

      if (anomalies.length > 0) {
        await this.handleAnomalies(transaction, anomalies);
      }
    } catch (error) {
      console.error('Error analyzing transaction:', error);
    }
  }

  /**
   * İstatistiksel anomalileri tespit et
   */
  async detectStatisticalAnomalies(transaction) {
    const anomalies = [];

    try {
      // Kullanıcının geçmiş işlemlerini al
      const userId = transaction.userId?._id || transaction.userId;
      const pastTransactions = await Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50);

      if (pastTransactions.length < 5) {
        return anomalies; // Yeterli veri yok
      }

      // Amount anomalisi
      const amounts = pastTransactions.map(t => parseFloat(t.fromAmount || 0));
      const mean = amounts.reduce((a, b) => a + b) / amounts.length;
      const stdDev = Math.sqrt(amounts.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / amounts.length);

      const currentAmount = parseFloat(transaction.fromAmount || 0);
      const zScore = (currentAmount - mean) / (stdDev || 1);

      if (Math.abs(zScore) > 2.5) {
        anomalies.push({
          type: 'STATISTICAL_AMOUNT_ANOMALY',
          severity: 'MEDIUM',
          zScore: zScore.toFixed(2),
          message: `Z-score anomalisi: ${zScore.toFixed(2)} (Eşik: 2.5)`
        });
      }

      // Zaman anomalisi
      const timeDiffs = [];
      for (let i = 1; i < pastTransactions.length; i++) {
        timeDiffs.push(
          (pastTransactions[i - 1].createdAt - pastTransactions[i].createdAt) / 1000
        );
      }

      const avgTimeDiff = timeDiffs.reduce((a, b) => a + b) / timeDiffs.length;
      const timeStdDev = Math.sqrt(
        timeDiffs.reduce((sum, x) => sum + Math.pow(x - avgTimeDiff, 2), 0) / timeDiffs.length
      );

      if (timeDiffs[0] < avgTimeDiff - 3 * timeStdDev) {
        anomalies.push({
          type: 'STATISTICAL_TIME_ANOMALY',
          severity: 'LOW',
          message: `Anormal işlem zamanı: Son işlemden sadece ${timeDiffs[0].toFixed(0)} saniye önce`
        });
      }
    } catch (error) {
      console.error('Error in detectStatisticalAnomalies:', error);
    }

    return anomalies;
  }

  /**
   * Kullanıcı davranış anomalilerini tespit et
   */
  async detectBehaviorAnomalies(transaction) {
    const anomalies = [];

    try {
      const userId = transaction.userId?._id || transaction.userId;
      const userKey = userId.toString();

      // Kullanıcı profili oluştur/güncelle
      if (!this.userProfiles.has(userKey)) {
        this.userProfiles.set(userKey, {
          avgDailyTransactions: 0,
          preferredSymbols: new Set(),
          averageAmount: 0,
          totalTransactions: 0,
          lastActivity: new Date(),
          riskScore: 0
        });
      }

      const profile = this.userProfiles.get(userKey);
      const allTransactions = await Transaction.countDocuments({ userId });
      profile.totalTransactions = allTransactions;
      profile.lastActivity = transaction.createdAt;

      // Tercih edilen symboller
      if (!profile.preferredSymbols.has(transaction.fromSymbol)) {
        profile.preferredSymbols.add(transaction.fromSymbol);
      }

      // Yeni symbol kullanımı anomalisi
      if (profile.preferredSymbols.size > 20) {
        anomalies.push({
          type: 'BEHAVIOR_NEW_SYMBOL',
          severity: 'LOW',
          symbolCount: profile.preferredSymbols.size,
          message: `Kullanıcı ${profile.preferredSymbols.size} farklı symbol ile işlem yapıyor`
        });
      }

      // Coğrafi/IP anomalisi (gelecekte eklenebilir)
      // Zaman dilimi anomalisi
      const hour = new Date().getHours();
      if (hour < 6 && Math.random() > 0.7) {
        // Gece saatlerinde işlem yapılması
        const lastTransactions = await Transaction.find({ userId })
          .sort({ createdAt: -1 })
          .limit(20);

        const nightTransactions = lastTransactions.filter(t => {
          const h = new Date(t.createdAt).getHours();
          return h < 6 || h > 22;
        });

        if (nightTransactions.length > 15) {
          anomalies.push({
            type: 'BEHAVIOR_NIGHT_ACTIVITY',
            severity: 'LOW',
            message: 'Gece saatlerinde anormal aktivite'
          });
        }
      }
    } catch (error) {
      console.error('Error in detectBehaviorAnomalies:', error);
    }

    return anomalies;
  }

  /**
   * Ağ tabanlı anomalileri tespit et
   */
  async detectNetworkAnomalies(transaction) {
    const anomalies = [];

    try {
      const { walletAddress, fromSymbol, toSymbol, fromAmount } = transaction;

      // Benzer işlemler bulma (clustering)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const similarTransactions = await Transaction.find({
        walletAddress,
        fromSymbol,
        toSymbol,
        createdAt: { $gte: oneHourAgo }
      });

      // Exact match işlemi
      const exactMatches = similarTransactions.filter(
        t => parseFloat(t.fromAmount) === parseFloat(fromAmount)
      );

      if (exactMatches.length > 3) {
        anomalies.push({
          type: 'NETWORK_EXACT_MATCH_CLUSTER',
          severity: 'HIGH',
          matchCount: exactMatches.length,
          message: `Aynı cüzdandan ${exactMatches.length} aynı tutar işlemi (bot şüphesi)`
        });
      }

      // Benzer miktar işlemleri
      const tolerance = parseFloat(fromAmount) * 0.01; // 1% tolerance
      const amountMatches = similarTransactions.filter(
        t => Math.abs(parseFloat(t.fromAmount) - parseFloat(fromAmount)) < tolerance
      );

      if (amountMatches.length > 5) {
        anomalies.push({
          type: 'NETWORK_AMOUNT_CLUSTER',
          severity: 'MEDIUM',
          clusterSize: amountMatches.length,
          message: `Benzer tutar yüksek sayda işlem (${amountMatches.length})`
        });
      }

      // İsim uzamı analizi (botların tekrarlayan işlemler yapması)
      const sequentialTransactions = await Transaction.find({
        fromSymbol,
        toSymbol
      })
        .sort({ createdAt: -1 })
        .limit(100);

      const fromAddresses = sequentialTransactions.map(t => t.walletAddress);
      const addressFrequencies = {};

      fromAddresses.forEach(addr => {
        addressFrequencies[addr] = (addressFrequencies[addr] || 0) + 1;
      });

      const maxFrequency = Math.max(...Object.values(addressFrequencies));
      if (maxFrequency > 30) {
        anomalies.push({
          type: 'NETWORK_SINGLE_ADDRESS_DOMINANCE',
          severity: 'HIGH',
          message: `Tek cüzdan ${maxFrequency} kez bu symbol çiftini işlem yaptı`
        });
      }
    } catch (error) {
      console.error('Error in detectNetworkAnomalies:', error);
    }

    return anomalies;
  }

  /**
   * Anomalileri işle
   */
  async handleAnomalies(transaction, anomalies) {
    try {
      const userId = transaction.userId?._id || transaction.userId;

      for (const anomaly of anomalies) {
        // Güvenlik servise uyarı gönder
        securityMonitoringService.addAlert({
          type: 'ANOMALY_DETECTED',
          severity: anomaly.severity,
          userId,
          transactionId: transaction._id,
          details: anomaly,
          detectionMethod: 'AnomalyDetectionBot'
        });

        // Şüpheli aktiviteyi kaydet
        securityMonitoringService.recordSuspiciousActivity(
          userId.toString(),
          anomaly.type,
          {
            transactionId: transaction._id,
            message: anomaly.message
          }
        );

        // Logla
        console.log(`⚠️  ANOMALY DETECTED: ${anomaly.type} - ${anomaly.message}`);
      }

      // Yüksek risk durumunda, işlemi durdur veya ek kontrol istemi
      const criticalAnomalies = anomalies.filter(a => a.severity === 'CRITICAL');
      if (criticalAnomalies.length > 0) {
        await this.blockTransaction(transaction);
      }
    } catch (error) {
      console.error('Error handling anomalies:', error);
    }
  }

  /**
   * İşlemi engelle/durdur
   */
  async blockTransaction(transaction) {
    try {
      await Transaction.updateOne(
        { _id: transaction._id },
        {
          $set: {
            status: 'BLOCKED_BY_ANOMALY_DETECTION',
            blockedAt: new Date(),
            blockedReason: 'Hatalı davranış tespiti'
          }
        }
      );

      console.log(`🚫 Transaction ${transaction._id} blocked by Anomaly Detection Bot`);
    } catch (error) {
      console.error('Error blocking transaction:', error);
    }
  }

  /**
   * User profile'ı getir
   */
  getUserProfile(userId) {
    return this.userProfiles.get(userId.toString());
  }

  /**
   * İstatistikleri getir
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      usersMonitored: this.userProfiles.size,
      alertsGenerated: securityMonitoringService.alerts.length,
      userProfiles: Array.from(this.userProfiles.entries()).map(([userId, profile]) => ({
        userId,
        ...profile,
        preferredSymbols: Array.from(profile.preferredSymbols)
      }))
    };
  }
}

export default new AnomalyDetectionBot();
