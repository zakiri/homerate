import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Card from '../../components/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function AssetDetail() {
  const router = useRouter();
  const { symbol } = router.query;

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [quantity, setQuantity] = useState(null);

  useEffect(() => {
    if (symbol) {
      fetchAsset();
    }
  }, [symbol]);

  const fetchAsset = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/asset/${symbol}`);
      setAsset(response.data.data);

      // Miktar bilgisini al
      const quantResponse = await axios.get(`${API_URL}/asset/${symbol}/quantity`);
      setQuantity(quantResponse.data.data);

      // Mock chart data
      const mockChartData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        price: response.data.data.currentPrice * (0.95 + Math.random() * 0.1)
      }));
      setChartData(mockChartData);

      setError(null);
    } catch (err) {
      console.error('Error fetching asset:', err);
      setError('Varlık detayı yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" message={error || 'Varlık bulunamadı'} />
        <Button onClick={() => router.back()} className="mt-4">
          Geri Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="secondary" onClick={() => router.back()} className="mb-4">
          ← Geri Dön
        </Button>
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">{asset.imageUrl}</span>
          <div>
            <h1 className="text-4xl font-bold text-white">{asset.name}</h1>
            <p className="text-gray-400 text-lg">{asset.symbol}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Info */}
        <div className="lg:col-span-2">
          {/* Price Card */}
          <Card className="mb-8">
            <div className="mb-6">
              <p className="text-gray-400 mb-2">Canlı Fiyat</p>
              <h2 className="text-5xl font-bold text-white mb-2">
                ${asset.currentPrice?.toLocaleString('en', { maximumFractionDigits: 2 })}
              </h2>
              <p className="text-lg text-gray-300">
                {asset.priceInHRate?.toLocaleString('en', { maximumFractionDigits: 6 })} HRATE
              </p>
            </div>

            {/* Change Indicators */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">24s Değişim</p>
                <p className={`text-xl font-bold ${
                  (asset.dailyChange?.percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {asset.dailyChange?.percentage >= 0 ? '+' : ''}
                  {asset.dailyChange?.percentage?.toFixed(2)}%
                </p>
                <p className="text-sm text-gray-400">
                  {asset.dailyChange?.amount >= 0 ? '+' : ''}
                  ${asset.dailyChange?.amount?.toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">7g Değişim</p>
                <p className={`text-xl font-bold ${
                  (asset.weeklyChange?.percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {asset.weeklyChange?.percentage >= 0 ? '+' : ''}
                  {asset.weeklyChange?.percentage?.toFixed(2)}%
                </p>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">30g Değişim</p>
                <p className={`text-xl font-bold ${
                  (asset.monthlyChange?.percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {asset.monthlyChange?.percentage >= 0 ? '+' : ''}
                  {asset.monthlyChange?.percentage?.toFixed(2)}%
                </p>
              </div>
            </div>
          </Card>

          {/* Chart */}
          <Card className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Son 24 Saat Fiyat Hareketi</h3>
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3B82F6"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          {/* Action Card */}
          <Card className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">İşlemler</h3>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push(`/swap?from=${asset.symbol}`)}
              className="w-full mb-3"
            >
              💱 Değiştir
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => router.push('/buy-sell')}
              className="w-full"
            >
              💰 Al/Sat
            </Button>
          </Card>

          {/* Details Card */}
          <Card className="mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Bilgiler</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Kategori</p>
                <p className="text-white">{asset.category?.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Market Cap</p>
                <p className="text-white">
                  ${asset.marketCap?.toLocaleString('en', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">24s Hacim</p>
                <p className="text-white">
                  ${asset.volume24h?.toLocaleString('en', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Decimal</p>
                <p className="text-white">{asset.decimals}</p>
              </div>
            </div>
          </Card>

          {/* Supply Card */}
          {quantity && (
            <Card>
              <h3 className="text-lg font-bold text-white mb-4">Arz Bilgisi</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Toplam Arz</p>
                  <p className="text-white">
                    {(quantity.totalSupply / 1e6).toLocaleString('en', { maximumFractionDigits: 2 })}M {quantity.symbol}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Dolaşımdaki</p>
                  <p className="text-white">
                    {(quantity.circulatingSupply / 1e6).toLocaleString('en', { maximumFractionDigits: 2 })}M {quantity.symbol}
                  </p>
                </div>
                {quantity.maxSupply && (
                  <div>
                    <p className="text-gray-400 mb-1">Max Arz</p>
                    <p className="text-white">
                      {(quantity.maxSupply / 1e6).toLocaleString('en', { maximumFractionDigits: 2 })}M {quantity.symbol}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Description */}
      {asset.description && (
        <Card>
          <h3 className="text-xl font-bold text-white mb-4">Açıklama</h3>
          <p className="text-gray-300 leading-relaxed">{asset.description}</p>
        </Card>
      )}
    </div>
  );
}
