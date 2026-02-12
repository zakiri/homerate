import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Card from '../components/Card';
import Modal from '../components/Modal';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function Swap() {
  const router = useRouter();
  const { from } = router.query;

  const [fromSymbol, setFromSymbol] = useState(from || 'HRATE');
  const [toSymbol, setToSymbol] = useState('USDT');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  const [swapDetails, setSwapDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);

  const [showConfirm, setShowConfirm] = useState(false);
  const [slippage, setSlippage] = useState(0.5);

  // Assets'i yükle
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setAssetsLoading(true);
      const response = await axios.get(`${API_URL}/asset?limit=100`);
      setAssets(response.data.data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setAssetsLoading(true);
    }
  };

  // Swap hesapla
  useEffect(() => {
    if (fromAmount && fromSymbol && toSymbol && fromSymbol !== toSymbol) {
      calculateSwap();
    } else {
      setSwapDetails(null);
      setToAmount('');
    }
  }, [fromAmount, fromSymbol, toSymbol]);

  const calculateSwap = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/swap/calculate`, {
        fromSymbol: fromSymbol.toUpperCase(),
        toSymbol: toSymbol.toUpperCase(),
        fromAmount: parseFloat(fromAmount)
      });

      if (response.data.success) {
        setSwapDetails(response.data.data);
        setToAmount(response.data.data.to.estimatedAmount.toFixed(6));
      } else {
        setError(response.data.error || 'Swap hesaplanamadı');
      }
    } catch (error) {
      console.error('Swap calculation error:', error);
      setError('Swap hesaplanırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    if (!fromAmount || !swapDetails) {
      setError('Lütfen tüm alanları doldurunuz');
      return;
    }
    setShowConfirm(true);
  };

  const executeSwapTransaction = async () => {
    try {
      setExecuting(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/swap/execute`,
        {
          fromSymbol: fromSymbol.toUpperCase(),
          toSymbol: toSymbol.toUpperCase(),
          fromAmount: parseFloat(fromAmount),
          slippage
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess('Swap işlemi başarıyla tamamlandı!');
        setFromAmount('');
        setToAmount('');
        setSwapDetails(null);
        setShowConfirm(false);

        // Başarıdan sonra
        setTimeout(() => {
          router.push('/portfolio');
        }, 2000);
      } else {
        setError(response.data.message || 'Swap işlemi başarısız');
      }
    } catch (error) {
      console.error('Swap execution error:', error);
      setError(error.response?.data?.message || 'Swap işlemi yapılırken hata oluştu');
    } finally {
      setExecuting(false);
    }
  };

  const swapAssets = () => {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
    setFromAmount(toAmount);
  };

  const getAssetName = (symbol) => {
    return assets.find(a => a.symbol === symbol)?.name || symbol;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">💱 Sentetik Varlık Değişimi</h1>
        <p className="text-gray-400">ETH, BTC, USDT ve 35 sentetik varlık arasında değişim yapın</p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Swap Form */}
        <div className="lg:col-span-2">
          <Card className="sticky top-4">
            <h2 className="text-2xl font-bold text-white mb-6">Değişim Yapın</h2>

            {/* From */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gönder
              </label>
              <div className="flex gap-2 mb-3">
                <select
                  value={fromSymbol}
                  onChange={(e) => setFromSymbol(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {assets.map(asset => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.symbol} - {asset.name}
                    </option>
                  ))}
                </select>
                <Button variant="secondary" size="sm" onClick={swapAssets} title="Değiştir">
                  ⇅
                </Button>
              </div>
              <Input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                min="0"
                step="0.000001"
              />
              {fromSymbol === 'HRATE' && fromAmount && (
                <p className="text-xs text-gray-400 mt-2">
                  = {(parseFloat(fromAmount) * 1e18).toFixed(0)} hrate
                </p>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center mb-6">
              <Button
                variant="primary"
                onClick={swapAssets}
                className="px-6"
              >
                ⇅ Değiştir
              </Button>
            </div>

            {/* To */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Al
              </label>
              <div className="flex gap-2 mb-3">
                <select
                  value={toSymbol}
                  onChange={(e) => setToSymbol(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {assets.map(asset => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.symbol} - {asset.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                type="number"
                placeholder="0.00"
                value={toAmount}
                disabled
              />
              {toSymbol === 'HRATE' && toAmount && (
                <p className="text-xs text-gray-400 mt-2">
                  = {(parseFloat(toAmount) * 1e18).toFixed(0)} hrate
                </p>
              )}
            </div>

            {/* Slippage */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kaymış Toleransı: {slippage}%
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-400 mt-2">
                Daha yüksek tolerans daha hızlı işlem ama daha az kar demektir
              </p>
            </div>

            {/* Swap Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleSwap}
              disabled={!fromAmount || !swapDetails || loading || executing}
              className="w-full"
            >
              {executing ? 'İşlem Yapılıyor...' : loading ? 'Hesaplanıyor...' : 'Değişimi Onayla'}
            </Button>
          </Card>
        </div>

        {/* Details */}
        <div className="lg:col-span-1">
          {swapDetails ? (
            <>
              {/* Swap Details */}
              <Card className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Detaylar</h3>

                {/* Exchange Rate */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Değişim Oranı</span>
                    <span className="text-white font-semibold">
                      1 {fromSymbol} = {swapDetails.exchangeRate.rate.toFixed(6)} {toSymbol}
                    </span>
                  </div>

                  {/* Fees */}
                  <div className="border-t border-gray-700 pt-3">
                    <p className="text-gray-300 font-semibold mb-2">Ücretler</p>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gas (Limit)</span>
                      <span className="text-white">{swapDetails.fees.gasLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gas (Birim Fiyat)</span>
                      <span className="text-white">{swapDetails.fees.gasPrice.toFixed(4)} HRATE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Toplam Gas</span>
                      <span className="text-white">{swapDetails.fees.gasTotalInHRate.toFixed(6)} HRATE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network Ücreti (%)</span>
                      <span className="text-white">{swapDetails.fees.networkFeePercent.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network Ücreti</span>
                      <span className="text-white">{swapDetails.fees.networkFee.toFixed(6)}</span>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Ödemeden Önce</span>
                      <span className="text-white font-semibold">
                        {swapDetails.to.amountBeforeFees.toFixed(6)} {toSymbol}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Toplam Ücretler</span>
                      <span className="text-red-400 font-semibold">
                        -{swapDetails.fees.totalFees.toFixed(6)} {toSymbol}
                      </span>
                    </div>
                    <div className="flex justify-between bg-gray-900 p-2 rounded">
                      <span className="text-gray-300">Alacağınız</span>
                      <span className="text-green-400 font-bold text-lg">
                        {swapDetails.to.estimatedAmount.toFixed(6)} {toSymbol}
                      </span>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="border-t border-gray-700 pt-3 flex justify-between">
                    <span className="text-gray-400">Beklenen Süre</span>
                    <span className="text-white">{swapDetails.executionTime}</span>
                  </div>
                </div>
              </Card>

              {/* Liquidity Pool Info */}
              {false && (
                <Card>
                  <h3 className="text-lg font-bold text-white mb-4">Likidite Havuzu</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{fromSymbol}</span>
                      <span className="text-white">TBD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{toSymbol}</span>
                      <span className="text-white">TBD</span>
                    </div>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <p className="text-center text-gray-400">
                Miktar girin ve detayları gör
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Değişimi Onayla"
      >
        <div className="space-y-4">
          <div className="bg-gray-900 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">Gönderme</p>
            <p className="text-2xl font-bold text-white">
              {fromAmount} {fromSymbol}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="text-2xl text-gray-400">⬇️</div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-2">Alma</p>
            <p className="text-2xl font-bold text-green-400">
              {swapDetails?.to.estimatedAmount.toFixed(6)} {toSymbol}
            </p>
          </div>

          <div className="bg-red-900/20 border border-red-700 p-3 rounded-lg">
            <p className="text-red-400 text-sm">
              ⚠️ Ücretler: {swapDetails?.fees.totalFees.toFixed(6)} {toSymbol}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowConfirm(false)}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              variant="primary"
              onClick={executeSwapTransaction}
              disabled={executing}
              className="flex-1"
            >
              {executing ? 'İşlem Yapılıyor...' : 'Onayla ve Değiştir'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
