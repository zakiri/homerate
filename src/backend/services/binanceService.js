import axios from 'axios';

export const BinanceService = {
  baseURL: 'https://api.binance.com/api/v3',

  async getPrice(symbol) {
    try {
      const response = await axios.get(`${this.baseURL}/ticker/price`, {
        params: { symbol }
      });
      return response.data.price;
    } catch (error) {
      console.error('Error fetching Binance price:', error);
      return null;
    }
  },

  async get24hrData(symbol) {
    try {
      const response = await axios.get(`${this.baseURL}/ticker/24hr`, {
        params: { symbol }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Binance 24hr data:', error);
      return null;
    }
  },

  async getKlines(symbol, interval = '1h', limit = 100) {
    try {
      const response = await axios.get(`${this.baseURL}/klines`, {
        params: { symbol, interval, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Binance klines:', error);
      return null;
    }
  },

  async getServerTime() {
    try {
      const response = await axios.get(`${this.baseURL}/time`);
      return response.data.serverTime;
    } catch (error) {
      console.error('Error fetching server time:', error);
      return null;
    }
  }
};
