import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export const authAPI = {
  register: (data) => axios.post(`${API_URL}/auth/register`, data),
  login: (email, password) => axios.post(`${API_URL}/auth/login`, { email, password }),
  logout: () => axios.post(`${API_URL}/auth/logout`),
  refreshToken: (token) => axios.post(`${API_URL}/auth/refresh-token`, { token })
};

export const userAPI = {
  getProfile: (token) => axios.get(`${API_URL}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateProfile: (token, data) => axios.put(`${API_URL}/user/profile`, data, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  connectWallet: (token, data) => axios.post(`${API_URL}/user/wallet/connect`, data, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  disconnectWallet: (token) => axios.post(`${API_URL}/user/wallet/disconnect`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  })
};

export const portfolioAPI = {
  getPortfolio: (token) => axios.get(`${API_URL}/portfolio`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getAssets: (token) => axios.get(`${API_URL}/portfolio/assets`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getBalanceHistory: (token) => axios.get(`${API_URL}/portfolio/balance-history`, {
    headers: { Authorization: `Bearer ${token}` }
  })
};

export const marketAPI = {
  getMarketData: (symbol) => axios.get(`${API_URL}/market/data/${symbol}`),
  getPriceHistory: (symbol, interval = '1h', limit = 100) =>
    axios.get(`${API_URL}/market/history/${symbol}`, {
      params: { interval, limit }
    }),
  searchCommodities: (query) => axios.get(`${API_URL}/market/search`, {
    params: { query }
  }),
  getTopMovers: () => axios.get(`${API_URL}/market/top-movers`),
  getLiveChartData: (symbol) => axios.get(`${API_URL}/market/chart/${symbol}`)
};

export const transactionAPI = {
  getHistory: (token, limit = 50, offset = 0) =>
    axios.get(`${API_URL}/transaction/history`, {
      params: { limit, offset },
      headers: { Authorization: `Bearer ${token}` }
    }),
  create: (token, data) => axios.post(`${API_URL}/transaction/create`, data, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getStatus: (token, transactionId) =>
    axios.get(`${API_URL}/transaction/${transactionId}/status`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  estimateGas: (token, data) => axios.post(`${API_URL}/transaction/estimate-gas`, data, {
    headers: { Authorization: `Bearer ${token}` }
  })
};
