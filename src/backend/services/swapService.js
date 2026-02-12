import { PRICE_REFERENCE, TRADING_PAIRS, HOMERATE_COIN, GAS_CONFIG } from '../config/syntheticAssets.js';
import Transaction from '../models/Transaction.js';

export class SwapService {
  /**
   * HRATE (HomeRate) birimini hrate (wei) birimine dönüştür
   * 1 HRATE = 1e18 hrate
   */
  static hrateToHrateWei(amount) {
    return (parseFloat(amount) * 1e18).toString();
  }

  /**
   * hrate (wei) birimini HRATE'e dönüştür
   * 1e18 hrate = 1 HRATE
   */
  static hrateWeiToHrate(weiAmount) {
    return parseFloat(weiAmount) / 1e18;
  }

  /**
   * Dönüştürme oranını hesapla
   */
  static calculateExchangeRate(fromSymbol, toSymbol) {
    const fromPrice = PRICE_REFERENCE[`${fromSymbol}_USD`] || 1;
    const toPrice = PRICE_REFERENCE[`${toSymbol}_USD`] || 1;

    if (toPrice === 0) {
      throw new Error(`Invalid exchange rate for ${toSymbol}`);
    }

    return fromPrice / toPrice;
  }

  /**
   * Değişim işleminə hesapla
   * @param {string} fromSymbol - Gönderilen varlık
   * @param {number} fromAmount - Gönderilen miktar
   * @param {string} toSymbol - Alınan varlık
   */
  static calculateSwap(fromSymbol, toSymbol, fromAmount) {
    try {
      // Desteklenen çiftleri kontrol et
      const pairExists = TRADING_PAIRS.some(p =>
        (p.from === fromSymbol && p.to === toSymbol && p.isActive) ||
        (p.from === toSymbol && p.to === fromSymbol && p.isActive)
      );

      if (!pairExists) {
        throw new Error(`Trading pair ${fromSymbol}/${toSymbol} not supported`);
      }

      // Değişim oranını hesapla
      const exchangeRate = this.calculateExchangeRate(fromSymbol, toSymbol);
      const toAmount = fromAmount * exchangeRate;

      // Gas ücretini hesapla
      const gasLimit = GAS_CONFIG.gasLimit.swap;
      const gasPrice = GAS_CONFIG.standardGasPrice;
      const gasTotalInHRate = gasLimit * gasPrice / 1e18;
      const gasTotalInToAsset = gasTotalInHRate * this.calculateExchangeRate('HRATE', toSymbol);

      // Ağı hesapla
      const networkFeePercent = 0.1; // %0.1 network ücreti
      const networkFee = toAmount * (networkFeePercent / 100);

      const finalAmount = toAmount - gasTotalInToAsset - networkFee;

      return {
        success: true,
        from: {
          symbol: fromSymbol,
          amount: fromAmount,
          amountInHrateWei: fromSymbol === 'HRATE' ? this.hrateToHrateWei(fromAmount) : null
        },
        to: {
          symbol: toSymbol,
          estimatedAmount: finalAmount,
          amountBeforeFees: toAmount
        },
        fees: {
          gasLimit,
          gasPrice: GAS_CONFIG.standardGasPrice,
          gasTotalInHRate: gasTotalInHRate,
          networkFeePercent,
          networkFee,
          totalFees: gasTotalInToAsset + networkFee
        },
        exchangeRate: {
          rate: exchangeRate,
          inverse: 1 / exchangeRate
        },
        executionTime: '~15-30 seconds'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Ters swap hesapla (hedefi biliyorsam, kaynağı ne olmalı?)
   */
  static calculateReverseSwap(fromSymbol, toSymbol, toAmount) {
    try {
      const exchangeRate = this.calculateExchangeRate(fromSymbol, toSymbol);
      const requiredFromAmount = toAmount / exchangeRate;
      
      return this.calculateSwap(fromSymbol, toSymbol, requiredFromAmount);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Çoklu değişim (A->B->C)
   */
  static calculateMultiSwap(path, initialAmount) {
    try {
      let currentAmount = initialAmount;
      let currentSymbol = path[0];
      const steps = [];
      let totalFees = 0;

      for (let i = 1; i < path.length; i++) {
        const nextSymbol = path[i];
        const swap = this.calculateSwap(currentSymbol, nextSymbol, currentAmount);

        if (!swap.success) {
          throw new Error(`Cannot swap ${currentSymbol} to ${nextSymbol}`);
        }

        steps.push(swap);
        totalFees += swap.fees.gasTotalInHRate + swap.fees.networkFee;
        currentAmount = swap.to.estimatedAmount;
        currentSymbol = nextSymbol;
      }

      return {
        success: true,
        path,
        initialAmount,
        finalAmount: currentAmount,
        steps,
        totalFees,
        totalGasUsed: steps.length * GAS_CONFIG.gasLimit.swap
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Likidite havuzu bilgisini al (simülasyon)
   */
  static getLiquidityPool(symbol1, symbol2) {
    return {
      pair: `${symbol1}/${symbol2}`,
      liquidity: {
        [symbol1]: Math.random() * 1000000,
        [symbol2]: Math.random() * 1000000
      },
      fee: 0.25, // %0.25 likidite sağlayıcı ücreti
      apr: (Math.random() * 100 + 5).toFixed(2), // %5-105 APR
      tvl: Math.random() * 10000000 // Total Value Locked
    };
  }

  /**
   * Ücret yapısı
   */
  static getFeeBreakdown(fromSymbol, toSymbol, fromAmount) {
    const swap = this.calculateSwap(fromSymbol, toSymbol, fromAmount);
    
    if (!swap.success) {
      return { success: false, error: swap.error };
    }

    return {
      success: true,
      breakdown: {
        inputAmount: swap.from.amount,
        gasLimit: swap.fees.gasLimit,
        gasPricePerUnit: swap.fees.gasPrice,
        totalGasFeeInHRate: swap.fees.gasTotalInHRate,
        totalGasFeeInTarget: swap.fees.gasTotalInToAsset,
        networkFeePercent: swap.fees.networkFeePercent,
        networkFee: swap.fees.networkFee,
        totalFeesPercent: ((swap.fees.totalFees / swap.to.amountBeforeFees) * 100).toFixed(2),
        outputAmount: swap.to.estimatedAmount,
        slippage: 0.5 // %0.5 default slippage
      }
    };
  }

  /**
   * Taraflar arasında swap işlemi yap
   */
  static async executeSwap(userId, fromSymbol, toSymbol, fromAmount, walletAddress, transaction) {
    try {
      const swap = this.calculateSwap(fromSymbol, toSymbol, fromAmount);

      if (!swap.success) {
        throw new Error(swap.error);
      }

      // Transaction kaydet
      const newTransaction = new Transaction({
        userId,
        type: 'swap',
        fromAsset: fromSymbol,
        toAsset: toSymbol,
        fromAmount,
        toAmount: swap.to.estimatedAmount,
        gasUsed: swap.fees.gasLimit,
        gasFee: swap.fees.gasTotalInHRate,
        networkFee: swap.fees.networkFee,
        exchangeRate: swap.exchangeRate.rate,
        status: 'pending',
        walletAddress,
        metadata: {
          ...swap,
          executedAt: new Date()
        }
      });

      await newTransaction.save();

      return {
        success: true,
        transactionId: newTransaction._id,
        status: 'pending',
        estimatedTime: '15-30 seconds',
        swap
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Canlı fiyat bilgisini al
   */
  static getLivePrice(symbol) {
    const basePrice = PRICE_REFERENCE[`${symbol}_USD`] || 0;
    
    // Gerçek API'den alınan fiyata olan sapma simülasyonu
    const variance = (Math.random() - 0.5) * 0.02; // +/-1% variance
    const currentPrice = basePrice * (1 + variance);

    return {
      symbol,
      current: currentPrice,
      base: basePrice,
      change: currentPrice - basePrice,
      changePercent: ((currentPrice - basePrice) / basePrice * 100).toFixed(2),
      timestamp: new Date()
    };
  }

  /**
   * Limit sipariş oluştur
   */
  static createLimitOrder(userId, symbol, amount, price, side = 'buy') {
    return {
      success: true,
      order: {
        id: `order_${Date.now()}`,
        userId,
        symbol,
        amount,
        limitPrice: price,
        side,
        status: 'open',
        createdAt: new Date()
      }
    };
  }

  /**
   * Slippage toleransı kontrol et
   */
  static validateSlippage(expectedAmount, actualAmount, tolerancePercent = 0.5) {
    const difference = Math.abs(expectedAmount - actualAmount);
    const slippagePercent = (difference / expectedAmount * 100);

    return {
      valid: slippagePercent <= tolerancePercent,
      slippagePercent: slippagePercent.toFixed(2),
      tolerancePercent,
      message: slippagePercent <= tolerancePercent 
        ? 'Slippage tolerance OK'
        : `Slippage exceeded: ${slippagePercent.toFixed(2)}%`
    };
  }
}

export default SwapService;
