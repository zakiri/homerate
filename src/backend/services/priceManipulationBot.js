/**
 * Price Manipulation Detection Bot
 * Fiyat manipülasyonu, pump & dump ve diğer piyasa suiistimallerini tespit eder
 */

import Transaction from '../models/Transaction.js';
import securityMonitoringService from './securityMonitoringService.js';

class PriceManipulationBot {
  constructor() {
    this.priceHistory = new Map(); // symbol -> [{ price, timestamp, volume }]
    this.windowSize = 100; // Her symbol için son 100 işlemi takip et
    this.isRunning = false;
    this.detectionInterval = null;
    this.PRICE_WINDOW_TIME = 60 * 60 * 1000; // 1 hour window
  }

  /**
   * Bot'u başlat
   */
  start() {
    if (this.isRunning) {
      console.log('Price Manipulation Detection Bot is already running');
      return;
    }

    this.isRunning = true;
    console.log('🤖 Price Manipulation Detection Bot started');

    // Her 10 saniyede kontrol et
    this.detectionInterval = setInterval(async () => {
      await this.checkPriceManipulation();
    }, 10000);
  }

  /**
   * Bot'u durdur
   */
  stop() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.isRunning = false;
      console.log('Price Manipulation Detection Bot stopped');
    }
  }

  /**
   * Fiyat manipülasyonunu kontrol et
   */
  async checkPriceManipulation() {
    try {
      // Son 1 dakikadaki işlemleri al
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentTransactions = await Transaction.find({
        createdAt: { $gte: oneMinuteAgo }
      });

      for (const transaction of recentTransactions) {
        await this.analyzePrice(transaction);
      }

      // Global market analizi
      await this.detectPumpAndDump();
      await this.detectWashTrading();
      await this.detectSlippageManipulation();
    } catch (error) {
      console.error('Error in checkPriceManipulation:', error);
    }
  }

  /**
   * Fiyatı analiz et
   */
  async analyzePrice(transaction) {
    try {
      const symbolPair = `${transaction.fromSymbol}/${transaction.toSymbol}`;
      const price = parseFloat(transaction.price);
      const volume = parseFloat(transaction.fromAmount);

      // Fiyat geçmişini güncelle
      if (!this.priceHistory.has(symbolPair)) {
        this.priceHistory.set(symbolPair, []);
      }

      const history = this.priceHistory.get(symbolPair);
      history.push({
        price,
        volume,
        timestamp: transaction.createdAt,
        transactionId: transaction._id,
        walletAddress: transaction.walletAddress
      });

      // Eski verileri sil
      if (history.length > this.windowSize) {
        history.shift();
      }

      // Volatilite anomalisini kontrol et
      await this.checkVolatilitySpike(symbolPair, history);

      // Fiyat manipülasyonu modellerini kontrol et
      await this.checkPricePatterns(symbolPair, history);
    } catch (error) {
      console.error('Error in analyzePrice:', error);
    }
  }

  /**
   * Volatilite piksini kontrol et
   */
  async checkVolatilitySpike(symbolPair, history) {
    if (history.length < 10) return;

    try {
      const prices = history.map(h => h.price);
      const mean = prices.reduce((a, b) => a + b) / prices.length;
      const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
      const stdDev = Math.sqrt(variance);

      // Son 3 işlemin getirisini hesapla
      for (let i = Math.max(0, history.length - 3); i < history.length; i++) {
        if (i === 0) continue;

        const prevPrice = history[i - 1].price;
        const currentPrice = history[i].price;
        const percentChange = Math.abs((currentPrice - prevPrice) / prevPrice * 100);

        // %10'dan fazla hızlı fiyat değişimi
        if (percentChange > 10) {
          const timeDiff = (history[i].timestamp - history[i - 1].timestamp) / 1000; // seconds

          if (timeDiff < 30) { // 30 saniyede %10 değişim = şüpheli
            securityMonitoringService.addAlert({
              type: 'PRICE_VOLATILITY_SPIKE',
              severity: 'HIGH',
              symbolPair,
              percentChange: percentChange.toFixed(2),
              timeSeconds: timeDiff,
              message: `${symbolPair}: ${percentChange.toFixed(2)}% değişim ${timeDiff.toFixed(0)} saniyede`,
              timestamp: new Date()
            });

            console.log(`⚠️  PRICE SPIKE: ${symbolPair} - ${percentChange.toFixed(2)}% in ${timeDiff.toFixed(0)}s`);
          }
        }
      }
    } catch (error) {
      console.error('Error in checkVolatilitySpike:', error);
    }
  }

  /**
   * Fiyat modellerini kontrol et
   */
  async checkPricePatterns(symbolPair, history) {
    if (history.length < 5) return;

    try {
      // V-şekli model (çabuk düşüp çabuk yükseliş) - pump hazırlığı
      const lastThree = history.slice(-3);
      if (lastThree.length === 3) {
        const trend = [
          lastThree[1].price - lastThree[0].price,
          lastThree[2].price - lastThree[1].price
        ];

        // Zıt yönde güçlü hareketler
        if (trend[0] < 0 && trend[1] > 0 && Math.abs(trend[1]) > Math.abs(trend[0]) * 1.5) {
          securityMonitoringService.addAlert({
            type: 'PUMP_PREPARATION_V_PATTERN',
            severity: 'MEDIUM',
            symbolPair,
            message: `${symbolPair}: V-şekli fiyat modeli - Pump hazırlığı şüphesi`,
            timestamp: new Date()
          });
        }
      }

      // Monoton yükseliş (pump) veya düşüş (dump)
      const lastTen = history.slice(-10);
      if (lastTen.length === 10) {
        let upswings = 0;
        let downswings = 0;

        for (let i = 1; i < lastTen.length; i++) {
          if (lastTen[i].price > lastTen[i - 1].price) upswings++;
          else downswings++;
        }

        // Son 10 işlemde 8+ iniş = koordineli dump
        if (downswings >= 8) {
          securityMonitoringService.addAlert({
            type: 'COORDINATED_DUMP',
            severity: 'HIGH',
            symbolPair,
            downswingCount: downswings,
            message: `${symbolPair}: ${downswings} ardışık fiyat düşüşü - Koordineli dump şüphesi`,
            timestamp: new Date()
          });

          console.log(`🚨 DUMP ALERT: ${symbolPair} - ${downswings} consecutive downswings`);
        }

        // Son 10 işlemde 8+ yükseliş = koordineli pump
        if (upswings >= 8) {
          securityMonitoringService.addAlert({
            type: 'COORDINATED_PUMP',
            severity: 'HIGH',
            symbolPair,
            upswingCount: upswings,
            message: `${symbolPair}: ${upswings} ardışık fiyat yükselişi - Koordineli pump şüphesi`,
            timestamp: new Date()
          });

          console.log(`🚨 PUMP ALERT: ${symbolPair} - ${upswings} consecutive upswings`);
        }
      }

      // Hacim anomalisi
      const volumes = history.map(h => h.volume);
      const avgVolume = volumes.reduce((a, b) => a + b) / volumes.length;
      const lastVolume = volumes[volumes.length - 1];

      if (lastVolume > avgVolume * 5) {
        securityMonitoringService.addAlert({
          type: 'VOLUME_SPIKE',
          severity: 'MEDIUM',
          symbolPair,
          volumeMultiplier: (lastVolume / avgVolume).toFixed(2),
          message: `${symbolPair}: Hacim spiği - ${(lastVolume / avgVolume).toFixed(2)}x ortalama`,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error in checkPricePatterns:', error);
    }
  }

  /**
   * Pump & Dump tespiti
   */
  async detectPumpAndDump() {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Son 24 saatte en fazla işlem yapılan symbol çiftlerini al
      const transactions = await Transaction.find({
        createdAt: { $gte: oneDayAgo }
      });

      const symbolPairStats = {};

      for (const tx of transactions) {
        const pair = `${tx.fromSymbol}/${tx.toSymbol}`;
        if (!symbolPairStats[pair]) {
          symbolPairStats[pair] = {
            count: 0,
            startPrice: 0,
            endPrice: 0,
            maxPrice: 0,
            minPrice: Infinity,
            volume: 0,
            uniqueWallets: new Set()
          };
        }

        const stats = symbolPairStats[pair];
        stats.count++;
        stats.volume += parseFloat(tx.fromAmount);
        stats.maxPrice = Math.max(stats.maxPrice, parseFloat(tx.price));
        stats.minPrice = Math.min(stats.minPrice, parseFloat(tx.price));
        stats.uniqueWallets.add(tx.walletAddress);

        if (stats.count === 1) stats.startPrice = parseFloat(tx.price);
        stats.endPrice = parseFloat(tx.price);
      }

      // Pump & Dump analizi
      for (const [pair, stats] of Object.entries(symbolPairStats)) {
        if (stats.count < 5) continue; // En az 5 işlem

        const priceRange = stats.maxPrice - stats.minPrice;
        const percentRange = (priceRange / stats.minPrice) * 100;

        // Kümeleştirilmiş hacim çok az sayıda cüzdan tarafından
        const walletRatio = stats.count / stats.uniqueWallets.size;

        // Yüksek volatilite + Az sayıda cüzdan = Pump & Dump şüphesi
        if (percentRange > 15 && walletRatio > 2) {
          securityMonitoringService.addAlert({
            type: 'PUMP_AND_DUMP_PATTERN',
            severity: 'HIGH',
            symbolPair: pair,
            priceRange: percentRange.toFixed(2),
            volumeCount: stats.count,
            uniqueWallets: stats.uniqueWallets.size,
            message: `${pair}: %${percentRange.toFixed(2)} volatilite - Pump & Dump modeli şüphesi`,
            timestamp: new Date()
          });

          console.log(`🚨 PUMP & DUMP DETECTED: ${pair} - ${percentRange.toFixed(2)}% volatility`);
        }
      }
    } catch (error) {
      console.error('Error in detectPumpAndDump:', error);
    }
  }

  /**
   * Wash Trading tespiti
   */
  async detectWashTrading() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const recentTransactions = await Transaction.find({
        createdAt: { $gte: fiveMinutesAgo }
      });

      const walletPairStats = {};

      for (const tx of recentTransactions) {
        const key = `${tx.walletAddress}:${tx.fromSymbol}:${tx.toSymbol}`;
        walletPairStats[key] = (walletPairStats[key] || 0) + 1;
      }

      // Aynı cüzdan aynı pair'de birçok kez işlem = Wash Trading şüphesi
      for (const [key, count] of Object.entries(walletPairStats)) {
        if (count >= 5) {
          const [wallet, fromSymbol, toSymbol] = key.split(':');

          securityMonitoringService.addAlert({
            type: 'WASH_TRADING_DETECTED',
            severity: 'HIGH',
            wallet,
            symbolPair: `${fromSymbol}/${toSymbol}`,
            transactionCount: count,
            message: `Aynı cüzdan (${wallet}) tarafından 5 dakikada ${count} kez ${fromSymbol}/${toSymbol} işlemi - Wash Trading şüphesi`,
            timestamp: new Date()
          });

          console.log(`🚨 WASH TRADING: ${wallet} - ${count} transactions in 5 minutes`);
        }
      }
    } catch (error) {
      console.error('Error in detectWashTrading:', error);
    }
  }

  /**
   * Slippage Manipülasyonu tespiti
   */
  async detectSlippageManipulation() {
    try {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

      const recentTransactions = await Transaction.find({
        createdAt: { $gte: oneMinuteAgo }
      });

      // Benzer işlemleri bul
      const symbolPairs = new Map();

      for (const tx of recentTransactions) {
        const pair = `${tx.fromSymbol}/${tx.toSymbol}`;
        if (!symbolPairs.has(pair)) {
          symbolPairs.set(pair, []);
        }
        symbolPairs.get(pair).push(tx);
      }

      // Her pair için slippage analizi
      for (const [pair, transactions] of symbolPairs) {
        if (transactions.length < 2) continue;

        const prices = transactions.map(t => parseFloat(t.price));
        const amounts = transactions.map(t => parseFloat(t.fromAmount));

        // Büyük hacim işlemlerin daha yüksek fiyat ödediği modeli tespit et
        for (let i = 0; i < transactions.length - 1; i++) {
          const currentTx = transactions[i];
          const nextTx = transactions[i + 1];

          const currentPrice = parseFloat(currentTx.price);
          const nextPrice = parseFloat(nextTx.price);
          const currentVolume = parseFloat(currentTx.fromAmount);
          const nextVolume = parseFloat(nextTx.fromAmount);

          // Küçük hacim daha düşük fiyatta işlem yaptığı halde, büyük hacim daha yüksek fiyat ödüyorsa
          if (
            nextVolume > currentVolume * 2 &&
            nextPrice > currentPrice * 1.05 &&
            currentTx.walletAddress !== nextTx.walletAddress
          ) {
            securityMonitoringService.addAlert({
              type: 'SLIPPAGE_MANIPULATION',
              severity: 'MEDIUM',
              symbolPair: pair,
              message: `${pair}: Slippage manipülasyonu - Ufak hacim daha düşük fiyat, büyük hacim daha yüksek fiyat`,
              timestamp: new Date()
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in detectSlippageManipulation:', error);
    }
  }

  /**
   * Price history'yi getir
   */
  getPriceHistory(symbolPair) {
    return this.priceHistory.get(symbolPair) || [];
  }

  /**
   * Stats'ı getir
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      symbolPairsMonitored: this.priceHistory.size,
      tradingPairs: Array.from(this.priceHistory.keys()),
      alertsGenerated: securityMonitoringService.alerts.filter(
        a => a.type?.includes('PRICE')
      ).length
    };
  }
}

export default new PriceManipulationBot();
