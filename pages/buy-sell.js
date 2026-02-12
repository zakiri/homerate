import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function BuySellPage() {
  const [activeTab, setActiveTab] = useState('buy');
  const [symbol, setSymbol] = useState('GOLD');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('0');
  const [gasEstimate, setGasEstimate] = useState('0');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const commodities = ['GOLD', 'SILVER', 'OIL', 'COPPER', 'WHEAT', 'CORN', 'NATURAL_GAS'];

  useEffect(() => {
    fetchPrice();
    estimateGas();
  }, [symbol, amount]);

  const fetchPrice = async () => {
    try {
      const response = await axios.get(`${API_URL}/market/data/${symbol}`);
      setPrice(parseFloat(response.data.lastPrice).toFixed(2));
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  const estimateGas = async () => {
    try {
      if (!amount) {
        setGasEstimate('0');
        return;
      }

      const response = await axios.post(
        `${API_URL}/transaction/estimate-gas`,
        {
          type: activeTab,
          fromAmount: parseFloat(amount)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGasEstimate(response.data.gasFee.toFixed(6));
    } catch (error) {
      console.error('Error estimating gas:', error);
    }
  };

  const handleTransaction = async () => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        setMessage('Geçerli bir miktar girin');
        setMessageType('error');
        return;
      }

      setLoading(true);

      const response = await axios.post(
        `${API_URL}/transaction/create`,
        {
          type: activeTab === 'buy' ? 'buy' : 'sell',
          fromSymbol: activeTab === 'buy' ? 'OSMO' : symbol,
          toSymbol: activeTab === 'buy' ? symbol : 'OSMO',
          fromAmount: parseFloat(amount),
          toAmount: parseFloat(amount) * parseFloat(price),
          price: parseFloat(price),
          walletAddress: 'osmo...' // Get from user context
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`${activeTab === 'buy' ? 'Satın alma' : 'Satış'} işlemi başarıyla oluşturuldu!`);
      setMessageType('success');
      setAmount('');
    } catch (error) {
      setMessage(error.response?.data?.error || 'İşlem başarısız oldu');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = (parseFloat(amount) || 0) * parseFloat(price);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Al/Sat</h1>

        {message && (
          <Alert
            type={messageType}
            message={message}
            onClose={() => setMessage('')}
          />
        )}

        <div className="bg-gray-800 rounded-lg p-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-3 rounded font-bold transition ${
                activeTab === 'buy'
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              AL
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 py-3 rounded font-bold transition ${
                activeTab === 'sell'
                  ? 'bg-red-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              SAT
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2 font-bold">Emtia</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              >
                {commodities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Miktar"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />

            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 mb-2">Birim Fiyatı</p>
              <p className="text-2xl font-bold">${price}</p>
            </div>

            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 mb-2">Toplam Tutar</p>
              <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
            </div>

            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 mb-2">Tahmini Gas Ücreti</p>
              <p className="text-lg font-bold">{gasEstimate} OSMO</p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleTransaction}
              disabled={loading || !amount}
              className="w-full"
            >
              {loading ? 'İşleme alınıyor...' : (activeTab === 'buy' ? 'Satın Al' : 'Sat')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
