import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
const OSMO_RPC = process.env.NEXT_PUBLIC_OSMO_RPC_URL;

export default function WalletPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletType, setWalletType] = useState('keplr');
  const [balance, setBalance] = useState('0');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.walletAddress) {
        setWalletAddress(response.data.walletAddress);
        setWalletType(response.data.walletType);
        setConnected(true);
      }
    } catch (error) {
      console.error('Error checking wallet:', error);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);

      if (typeof window !== 'undefined' && window.keplr) {
        await window.keplr.enable(process.env.NEXT_PUBLIC_OSMO_CHAIN_ID);

        const offlineSigner = window.keplr.getOfflineSigner(
          process.env.NEXT_PUBLIC_OSMO_CHAIN_ID
        );
        const accounts = await offlineSigner.getAccounts();
        const address = accounts[0].address;

        await axios.post(
          `${API_URL}/user/wallet/connect`,
          {
            walletAddress: address,
            walletType: 'keplr'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setWalletAddress(address);
        setWalletType('keplr');
        setConnected(true);
      } else {
        alert('Keplr cüzdan uzantısı yüklü değildir');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Cüzdan bağlanması başarısız');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await axios.post(
        `${API_URL}/user/wallet/disconnect`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWalletAddress('');
      setConnected(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Cüzdan Yönetimi</h1>

        <div className="bg-gray-800 rounded-lg p-8">
          {connected ? (
            <>
              <div className="mb-8">
                <p className="text-gray-400 mb-2">Bağlı Cüzdan</p>
                <div className="bg-gray-700 p-4 rounded flex items-center justify-between">
                  <span className="font-mono text-sm break-all">{walletAddress}</span>
                  <span className="text-green-400 text-sm ml-4">Bağlı ✓</span>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-gray-400 mb-2">Bakiye</p>
                <div className="bg-gray-700 p-4 rounded text-2xl font-bold">
                  {balance} OSMO
                </div>
              </div>

              <button
                onClick={disconnectWallet}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
              >
                Cüzdanı Çıkar
              </button>
            </>
          ) : (
            <>
              <div className="mb-8">
                <label className="block text-gray-300 mb-4">Cüzdan Türü</label>
                <select
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="keplr">Keplr</option>
                  <option value="leap">Leap</option>
                  <option value="ledger">Ledger</option>
                </select>
              </div>

              <button
                onClick={connectWallet}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-8 rounded focus:outline-none disabled:opacity-50"
              >
                {loading ? 'Bağlanıyor...' : 'Cüzdan Bağla'}
              </button>
            </>
          )}
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Ağ Bilgileri</h2>
          <div className="space-y-2 text-gray-300">
            <p>
              <span className="font-bold">Ağ:</span> Osmosis (OSMO)
            </p>
            <p>
              <span className="font-bold">Chain ID:</span>{' '}
              {process.env.NEXT_PUBLIC_OSMO_CHAIN_ID}
            </p>
            <p>
              <span className="font-bold">RPC:</span> {OSMO_RPC}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
