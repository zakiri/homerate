import SwapService from '../services/swapService.js';
import Transaction from '../models/Transaction.js';

// Swap işlemini hesapla
export const calculateSwap = (req, res) => {
  try {
    const { fromSymbol, toSymbol, fromAmount } = req.body;

    if (!fromSymbol || !toSymbol || !fromAmount) {
      return res.status(400).json({
        success: false,
        message: 'from, to ve amount alanları gereklidir'
      });
    }

    const swap = SwapService.calculateSwap(fromSymbol, toSymbol, parseFloat(fromAmount));

    res.json({
      success: swap.success,
      data: swap.success ? swap : undefined,
      error: swap.error
    });
  } catch (error) {
    console.error('Calculate swap error:', error);
    res.status(500).json({
      success: false,
      message: 'Swap hesaplanırken hata oluştu',
      error: error.message
    });
  }
};

// Ters swap hesapla
export const calculateReverseSwap = (req, res) => {
  try {
    const { fromSymbol, toSymbol, toAmount } = req.body;

    if (!fromSymbol || !toSymbol || !toAmount) {
      return res.status(400).json({
        success: false,
        message: 'from, to ve toAmount alanları gereklidir'
      });
    }

    const swap = SwapService.calculateReverseSwap(fromSymbol, toSymbol, parseFloat(toAmount));

    res.json({
      success: swap.success,
      data: swap.success ? swap : undefined,
      error: swap.error
    });
  } catch (error) {
    console.error('Calculate reverse swap error:', error);
    res.status(500).json({
      success: false,
      message: 'Ters swap hesaplanırken hata oluştu',
      error: error.message
    });
  }
};

// Swap işlemini yap
export const executeSwap = async (req, res) => {
  try {
    const { userId, walletAddress } = req.user;
    const { fromSymbol, toSymbol, fromAmount, slippage = 0.5 } = req.body;

    if (!fromSymbol || !toSymbol || !fromAmount) {
      return res.status(400).json({
        success: false,
        message: 'Gerekli alanlar eksik'
      });
    }

    // Swap hesapla
    const swapCalc = SwapService.calculateSwap(fromSymbol, toSymbol, parseFloat(fromAmount));

    if (!swapCalc.success) {
      return res.status(400).json({
        success: false,
        message: swapCalc.error
      });
    }

    // Slippage kontrolü
    const slippageCheck = SwapService.validateSlippage(
      swapCalc.to.estimatedAmount,
      swapCalc.to.estimatedAmount,
      slippage
    );

    if (!slippageCheck.valid) {
      return res.status(400).json({
        success: false,
        message: 'Slippage tolerance exceeded',
        slippage: slippageCheck
      });
    }

    // Transaction oluştur
    const transaction = new Transaction({
      userId,
      type: 'swap',
      fromAsset: fromSymbol,
      toAsset: toSymbol,
      fromAmount: parseFloat(fromAmount),
      toAmount: swapCalc.to.estimatedAmount,
      gasUsed: swapCalc.fees.gasLimit,
      gasFee: swapCalc.fees.gasTotalInHRate,
      networkFee: swapCalc.fees.networkFee,
      exchangeRate: swapCalc.exchangeRate.rate,
      status: 'completed',
      walletAddress,
      txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
      metadata: {
        swapDetails: swapCalc,
        slippage,
        timestamp: new Date()
      }
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Swap işlemi başarılı',
      data: {
        transactionId: transaction._id,
        txHash: transaction.txHash,
        swap: swapCalc,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Execute swap error:', error);
    res.status(500).json({
      success: false,
      message: 'Swap işlemi yapılırken hata oluştu',
      error: error.message
    });
  }
};

// Ücret bilgisini al
export const getSwapFees = (req, res) => {
  try {
    const { fromSymbol, toSymbol, fromAmount } = req.query;

    if (!fromSymbol || !toSymbol || !fromAmount) {
      return res.status(400).json({
        success: false,
        message: 'Gerekli parametreler eksik'
      });
    }

    const fees = SwapService.getFeeBreakdown(fromSymbol, toSymbol, parseFloat(fromAmount));

    res.json({
      success: fees.success,
      data: fees.success ? fees.breakdown : undefined,
      error: fees.error
    });
  } catch (error) {
    console.error('Get fees error:', error);
    res.status(500).json({
      success: false,
      message: 'Ücretler alınırken hata oluştu',
      error: error.message
    });
  }
};

// Likidite havuzu bilgisini al
export const getLiquidityPool = (req, res) => {
  try {
    const { symbol1, symbol2 } = req.params;

    if (!symbol1 || !symbol2) {
      return res.status(400).json({
        success: false,
        message: 'İki sembol gereklidir'
      });
    }

    const pool = SwapService.getLiquidityPool(symbol1.toUpperCase(), symbol2.toUpperCase());

    res.json({
      success: true,
      data: pool
    });
  } catch (error) {
    console.error('Get pool error:', error);
    res.status(500).json({
      success: false,
      message: 'Likidite havuzu alınırken hata oluştu',
      error: error.message
    });
  }
};

// Canlı fiyat al
export const getLivePrice = (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Sembol gereklidir'
      });
    }

    const price = SwapService.getLivePrice(symbol.toUpperCase());

    res.json({
      success: true,
      data: price
    });
  } catch (error) {
    console.error('Get price error:', error);
    res.status(500).json({
      success: false,
      message: 'Fiyat alınırken hata oluştu',
      error: error.message
    });
  }
};

// Limit order oluştur
export const createLimitOrder = async (req, res) => {
  try {
    const { userId } = req.user;
    const { symbol, amount, limitPrice, side } = req.body;

    if (!symbol || !amount || !limitPrice) {
      return res.status(400).json({
        success: false,
        message: 'Gerekli alanlar eksik'
      });
    }

    const order = SwapService.createLimitOrder(userId, symbol, amount, limitPrice, side);

    res.json({
      success: true,
      data: order.order
    });
  } catch (error) {
    console.error('Create limit order error:', error);
    res.status(500).json({
      success: false,
      message: 'Limit order oluşturulurken hata oluştu',
      error: error.message
    });
  }
};

// Çoklu swap (A->B->C)
export const multiSwap = (req, res) => {
  try {
    const { path, initialAmount } = req.body;

    if (!path || !Array.isArray(path) || path.length < 2 || !initialAmount) {
      return res.status(400).json({
        success: false,
        message: 'path (array) ve initialAmount gereklidir'
      });
    }

    const result = SwapService.calculateMultiSwap(path, parseFloat(initialAmount));

    res.json({
      success: result.success,
      data: result.success ? result : undefined,
      error: result.error
    });
  } catch (error) {
    console.error('Multi swap error:', error);
    res.status(500).json({
      success: false,
      message: 'Çoklu swap hesaplanırken hata oluştu',
      error: error.message
    });
  }
};

// HRATE (wei) dönüşümleri
export const convertHRateToWei = (req, res) => {
  try {
    const { hrate } = req.query;

    if (!hrate) {
      return res.status(400).json({
        success: false,
        message: 'hrate parametresi gereklidir'
      });
    }

    const wei = SwapService.hrateToHrateWei(hrate);

    res.json({
      success: true,
      data: {
        hrate: parseFloat(hrate),
        hrateWei: wei,
        formula: '1 HRATE = 1e18 hrate'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const convertWeiToHRate = (req, res) => {
  try {
    const { wei } = req.query;

    if (!wei) {
      return res.status(400).json({
        success: false,
        message: 'wei parametresi gereklidir'
      });
    }

    const hrate = SwapService.hrateWeiToHrate(wei);

    res.json({
      success: true,
      data: {
        hrateWei: wei,
        hrate,
        formula: '1e18 hrate = 1 HRATE'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
