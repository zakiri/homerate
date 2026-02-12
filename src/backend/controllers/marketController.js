import axios from 'axios';

const BINANCE_API_URL = 'https://api.binance.com/api/v3';
const COMMODITIES = {
  'GOLD': { symbol: 'BTCUSDT', name: 'Gold (simulated)' },
  'SILVER': { symbol: 'ETHUSDT', name: 'Silver (simulated)' },
  'OIL': { symbol: 'BNBUSDT', name: 'Oil (simulated)' },
  'COPPER': { symbol: 'ADAUSDT', name: 'Copper (simulated)' },
  'WHEAT': { symbol: 'DOGEUSDT', name: 'Wheat (simulated)' }
};

export const getMarketData = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const commodity = COMMODITIES[symbol.toUpperCase()];

    if (!commodity) {
      return res.status(404).json({ error: 'Commodity not found' });
    }

    const response = await axios.get(`${BINANCE_API_URL}/ticker/24hr`, {
      params: { symbol: commodity.symbol }
    });

    res.json({
      symbol,
      name: commodity.name,
      binanceSymbol: commodity.symbol,
      ...response.data
    });
  } catch (error) {
    next(error);
  }
};

export const getPriceHistory = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = 100 } = req.query;

    const commodity = COMMODITIES[symbol.toUpperCase()];

    if (!commodity) {
      return res.status(404).json({ error: 'Commodity not found' });
    }

    const response = await axios.get(`${BINANCE_API_URL}/klines`, {
      params: {
        symbol: commodity.symbol,
        interval,
        limit
      }
    });

    const history = response.data.map((candle) => ({
      time: new Date(candle[0]).toISOString(),
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[7])
    }));

    res.json(history);
  } catch (error) {
    next(error);
  }
};

export const searchCommodities = async (req, res, next) => {
  try {
    const { query } = req.query;

    const results = Object.entries(COMMODITIES)
      .filter(
        ([symbol, data]) =>
          symbol.includes(query.toUpperCase()) ||
          data.name.toLowerCase().includes(query.toLowerCase())
      )
      .map(([symbol, data]) => ({
        symbol,
        ...data
      }));

    res.json(results);
  } catch (error) {
    next(error);
  }
};

export const getTopMovers = async (req, res, next) => {
  try {
    const symbols = Object.values(COMMODITIES).map((c) => c.symbol);

    const response = await axios.get(`${BINANCE_API_URL}/ticker/24hr`);
    const allData = response.data;

    const topMovers = allData
      .filter((item) => symbols.includes(item.symbol))
      .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
      .slice(0, 10)
      .map((item) => {
        const commodity = Object.entries(COMMODITIES).find(
          ([_, data]) => data.symbol === item.symbol
        );

        return {
          symbol: commodity[0],
          name: commodity[1].name,
          ...item
        };
      });

    res.json(topMovers);
  } catch (error) {
    next(error);
  }
};

export const getLiveChartData = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const commodity = COMMODITIES[symbol.toUpperCase()];

    if (!commodity) {
      return res.status(404).json({ error: 'Commodity not found' });
    }

    const response = await axios.get(`${BINANCE_API_URL}/klines`, {
      params: {
        symbol: commodity.symbol,
        interval: '1m',
        limit: 60
      }
    });

    const chartData = response.data.map((candle) => ({
      timestamp: candle[0],
      close: parseFloat(candle[4])
    }));

    res.json(chartData);
  } catch (error) {
    next(error);
  }
};
