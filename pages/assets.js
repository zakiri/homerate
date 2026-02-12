import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Card from '../components/Card';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function Assets() {
  const router = useRouter();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('marketCap');
  const [filteredAssets, setFilteredAssets] = useState([]);

  const categories = [
    { value: '', label: 'Tüm Kategoriler' },
    { value: 'precious_metal', label: '💰 Kıymetli Metaller' },
    { value: 'energy', label: '⛽ Enerji' },
    { value: 'agricultural', label: '🌾 Tarımsal' },
    { value: 'cryptocurrency', label: '₿ Kripto Para' },
    { value: 'stablecoin', label: '💵 Stablecoin' },
    { value: 'platform_token', label: '🔷 Platform Token' }
  ];

  useEffect(() => {
    fetchAssets();
  }, [selectedCategory, sortBy]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sortBy,
        limit: 100,
        ...(selectedCategory && { category: selectedCategory })
      });

      const response = await axios.get(`${API_URL}/asset?${params}`);
      setAssets(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError('Varlıklar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = assets.filter(asset =>
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAssets(filtered);
  }, [searchTerm, assets]);

  const handleAssetClick = (symbol) => {
    router.push(`/assets/${symbol}`);
  };

  const handleSwap = (symbol) => {
    router.push(`/swap?from=${symbol}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">💎 Sentetik Varlıklar</h1>
        <p className="text-gray-400">35 sentetik varlık - HomeRate borsasında değişim yapılabilir</p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ara
            </label>
            <Input
              type="text"
              placeholder="Varlık adı veya sembol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sıralama
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="marketCap">Market Cap (Büyük → Küçük)</option>
              <option value="price">Fiyat (Yüksek → Düşük)</option>
              <option value="dailyChange">Günlük Değişim</option>
              <option value="volume"> 24s Hacim</option>
              <option value="name">İsim (A → Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.length > 0 ? (
          filteredAssets.map(asset => (
            <Card key={asset.symbol} className="hover:border-blue-500 transition cursor-pointer">
              <div onClick={() => handleAssetClick(asset.symbol)} className="mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {asset.imageUrl} {asset.name}
                    </h3>
                    <p className="text-blue-400 font-mono">{asset.symbol}</p>
                  </div>
                  <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                    {asset.category.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Fiyat Bilgisi */}
                <div className="mb-4">
                  <p className="text-2xl font-bold text-white mb-1">
                    ${asset.currentPrice?.toLocaleString('en', { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {asset.priceInHRate?.toLocaleString('en', { maximumFractionDigits: 6 })} HRATE
                  </p>
                </div>

                {/* Değişim */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">24s Değişim</p>
                    <p className={`font-semibold ${
                      (asset.dailyChange?.percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {asset.dailyChange?.percentage >= 0 ? '+' : ''}
                      {asset.dailyChange?.percentage?.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">24s Hacim</p>
                    <p className="text-white font-semibold">
                      ${(asset.volume24h || 0) / 1000000 >= 1 
                        ? (asset.volume24h / 1000000).toFixed(1) + 'M'
                        : (asset.volume24h / 1000).toFixed(1) + 'K'}
                    </p>
                  </div>
                </div>

                {/* Supply Info */}
                {asset.totalSupply > 0 && (
                  <div className="text-xs text-gray-400 mb-4 bg-gray-900 p-2 rounded">
                    <p>Toplam: {(asset.totalSupply / 1e6).toFixed(2)}M</p>
                    <p>Dolaşımdaki: {(asset.circulatingSupply / 1e6).toFixed(2)}M</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleSwap(asset.symbol)}
                >
                  💱 Değiştir
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAssetClick(asset.symbol)}
                >
                  📊 Detay
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">Varlık bulunamadı</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <p className="text-gray-400 mb-1">Toplam Varlık</p>
          <p className="text-2xl font-bold text-white">{filteredAssets.length}</p>
        </Card>
        <Card>
          <p className="text-gray-400 mb-1">Ortalama Fiyat</p>
          <p className="text-2xl font-bold text-white">
            ${(filteredAssets.reduce((sum, a) => sum + (a.currentPrice || 0), 0) / filteredAssets.length).toFixed(2)}
          </p>
        </Card>
        <Card>
          <p className="text-gray-400 mb-1">Toplam 24s Hacim</p>
          <p className="text-2xl font-bold text-white">
            ${(filteredAssets.reduce((sum, a) => sum + (a.volume24h || 0), 0) / 1e6).toFixed(1)}M
          </p>
        </Card>
        <Card>
          <p className="text-gray-400 mb-1">Ortalama Değişim</p>
          <p className="text-2xl font-bold text-green-400">
            +{(filteredAssets.reduce((sum, a) => sum + (a.dailyChange?.percentage || 0), 0) / filteredAssets.length).toFixed(2)}%
          </p>
        </Card>
      </div>
    </div>
  );
}
