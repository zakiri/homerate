import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [portfolioRes, transactionsRes] = await Promise.all([
        axios.get(`${API_URL}/portfolio`, { headers }),
        axios.get(`${API_URL}/transaction/history`, { headers })
      ]);

      setPortfolio(portfolioRes.data);
      setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-10">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Portföy</h1>

        {portfolio && (
          <>
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400">Toplam Değer</p>
                <h2 className="text-3xl font-bold mt-2">
                  ${portfolio.totalBalance?.toFixed(2) || '0.00'}
                </h2>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400">Varlık Sayısı</p>
                <h2 className="text-3xl font-bold mt-2">{portfolio.assets?.length || 0}</h2>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400">Cüzdan</p>
                <p className="text-sm text-green-400 mt-2 font-mono">
                  {portfolio.walletAddress?.slice(0, 15)}...
                </p>
              </div>
            </div>

            {/* Assets */}
            {portfolio.assets && portfolio.assets.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6">Varlıklar</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4">Sembol</th>
                        <th className="text-right py-3 px-4">Miktar</th>
                        <th className="text-right py-3 px-4">Giriş Fiyatı</th>
                        <th className="text-right py-3 px-4">Güncel Fiyat</th>
                        <th className="text-right py-3 px-4">Tür</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.assets.map((asset, idx) => (
                        <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700">
                          <td className="py-3 px-4 font-bold">{asset.symbol}</td>
                          <td className="text-right py-3 px-4">{asset.amount}</td>
                          <td className="text-right py-3 px-4">
                            ${asset.entryPrice?.toFixed(2) || '0.00'}
                          </td>
                          <td className="text-right py-3 px-4">
                            ${asset.currentPrice?.toFixed(2) || '0.00'}
                          </td>
                          <td className="text-right py-3 px-4 text-xs">
                            <span className="bg-purple-600 px-2 py-1 rounded">
                              {asset.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Transaction History */}
            {transactions.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">İşlem Geçmişi</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4">Tarih</th>
                        <th className="text-left py-3 px-4">Tür</th>
                        <th className="text-left py-3 px-4">Gönder</th>
                        <th className="text-left py-3 px-4">Al</th>
                        <th className="text-right py-3 px-4">Gas Ücreti</th>
                        <th className="text-center py-3 px-4">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 10).map((tx) => (
                        <tr key={tx._id} className="border-b border-gray-700 hover:bg-gray-700">
                          <td className="py-3 px-4 text-sm">
                            {new Date(tx.createdAt).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="py-3 px-4 font-bold">{tx.type.toUpperCase()}</td>
                          <td className="py-3 px-4">{tx.fromSymbol}</td>
                          <td className="py-3 px-4">{tx.toSymbol}</td>
                          <td className="text-right py-3 px-4">
                            {tx.gasFee?.toFixed(6) || '0'} OSMO
                          </td>
                          <td className="text-center py-3 px-4">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                tx.status === 'confirmed'
                                  ? 'bg-green-900 text-green-200'
                                  : tx.status === 'pending'
                                  ? 'bg-yellow-900 text-yellow-200'
                                  : 'bg-red-900 text-red-200'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
