import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [topMovers, setTopMovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, portfolioRes, topRes] = await Promise.all([
        axios.get(`${API_URL}/user/profile`, { headers }),
        axios.get(`${API_URL}/portfolio`, { headers }),
        axios.get(`${API_URL}/market/top-movers`)
      ]);

      setUser(userRes.data);
      setPortfolio(portfolioRes.data);
      setTopMovers(topRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-2xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-2">Hoşgeldiniz, {user?.username}</p>
        </div>

        {/* Portfolio Overview */}
        {portfolio && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-400">Toplam Bakiye</p>
              <h2 className="text-3xl font-bold mt-2">
                ${portfolio.totalBalance?.toFixed(2) || '0.00'}
              </h2>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-400">Varlık Sayısı</p>
              <h2 className="text-3xl font-bold mt-2">{portfolio.assets?.length || 0}</h2>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-400">Cüzdan Adres</p>
              <p className="text-sm text-green-400 mt-2">
                {user?.walletAddress
                  ? `${user.walletAddress.slice(0, 10)}...${user.walletAddress.slice(-10)}`
                  : 'Bağlı değil'}
              </p>
            </div>
          </div>
        )}

        {/* Top Movers */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-6">En Çok Hareket Edenler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topMovers.slice(0, 5).map((item) => (
              <div key={item.symbol} className="bg-gray-700 rounded p-4">
                <p className="font-bold">{item.symbol}</p>
                <p className="text-lg mt-2">${parseFloat(item.lastPrice).toFixed(2)}</p>
                <p
                  className={`text-sm mt-1 ${
                    parseFloat(item.priceChangePercent) >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {parseFloat(item.priceChangePercent) >= 0 ? '+' : ''}
                  {parseFloat(item.priceChangePercent).toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button className="bg-blue-600 hover:bg-blue-700 rounded-lg p-6 text-center font-bold">
            Al/Sat
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 rounded-lg p-6 text-center font-bold">
            Takas
          </button>
        </div>
      </div>
    </div>
  );
}
