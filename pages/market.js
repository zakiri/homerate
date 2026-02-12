import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function MarketPage() {
  const [commodities] = useState([
    { symbol: 'GOLD', name: 'Altın' },
    { symbol: 'SILVER', name: 'Gümüş' },
    { symbol: 'OIL', name: 'Petrol' },
    { symbol: 'COPPER', name: 'Bakır' },
    { symbol: 'WHEAT', name: 'Buğday' }
  ]);

  const [selectedSymbol, setSelectedSymbol] = useState('GOLD');
  const [priceHistory, setPriceHistory] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, [selectedSymbol]);

  const fetchMarketData = async () => {
    try {
      setLoading(true);

      const [dataRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/market/data/${selectedSymbol}`),
        axios.get(`${API_URL}/market/history/${selectedSymbol}?interval=1h&limit=24`)
      ]);

      setMarketData(dataRes.data);
      setPriceHistory(historyRes.data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Pazar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Sidebar */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Emtialar</h2>
            <div className="space-y-2">
              {commodities.map((commodity) => (
                <button
                  key={commodity.symbol}
                  onClick={() => setSelectedSymbol(commodity.symbol)}
                  className={`w-full px-4 py-2 rounded text-left ${
                    selectedSymbol === commodity.symbol
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {commodity.name}
                  <span className="text-xs ml-2">({commodity.symbol})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {marketData && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">
                  {commodities.find((c) => c.symbol === selectedSymbol)?.name}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <p className="text-gray-400 text-sm">Son Fiyat</p>
                    <p className="text-2xl font-bold">
                      ${parseFloat(marketData.lastPrice).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gray-700 p-4 rounded">
                    <p className="text-gray-400 text-sm">24h Değişim</p>
                    <p
                      className={`text-2xl font-bold ${
                        parseFloat(marketData.priceChangePercent) >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {parseFloat(marketData.priceChangePercent) >= 0 ? '+' : ''}
                      {parseFloat(marketData.priceChangePercent).toFixed(2)}%
                    </p>
                  </div>

                  <div className="bg-gray-700 p-4 rounded">
                    <p className="text-gray-400 text-sm">Yüksek</p>
                    <p className="text-2xl font-bold">
                      ${parseFloat(marketData.highPrice).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gray-700 p-4 rounded">
                    <p className="text-gray-400 text-sm">Düşük</p>
                    <p className="text-2xl font-bold">
                      ${parseFloat(marketData.lowPrice).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chart */}
            {priceHistory.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Fiyat Tarihi (24 Saat)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#3b82f6"
                      dot={false}
                      name="Fiyat"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
