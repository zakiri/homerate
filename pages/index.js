import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      {/* Navigation */}
      <nav className="bg-gray-900 bg-opacity-80 backdrop-blur-md border-b border-gray-700 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            HomeRate Exchange
          </h1>
          <div className="space-x-4">
            <Link href="/login" className="hover:text-blue-400">
              Giriş
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded hover:from-blue-700 hover:to-purple-700"
            >
              Kaydol
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Sentetik Emtia Borsası
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          OSMO ağında güvenli, hızlı ve düşük maliyetli ticaret yapın
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-3">Güvenli</h3>
            <p className="text-gray-400">
              Blockchain teknolojisinin gücü ile korunan işlemler
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-3">Hızlı</h3>
            <p className="text-gray-400">
              Saniye içinde işlemleriniz tamamlanır
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 hover:bg-gray-700 transition">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-3">Düşük Ücretler</h3>
            <p className="text-gray-400">
              Minimal gas ücretleri ile maksimum verim
            </p>
          </div>
        </div>

        <div className="space-x-4">
          <Link
            href="/register"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 rounded font-bold hover:from-blue-700 hover:to-purple-700 transition"
          >
            Başla
          </Link>
          <Link
            href="/#features"
            className="inline-block border-2 border-blue-400 px-8 py-3 rounded font-bold hover:bg-blue-400 hover:text-gray-900 transition"
          >
            Öğren
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-gray-900 bg-opacity-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Neden HomeRate?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">📊 Canlı Grafikler</h3>
              <p className="text-gray-300">
                Binance verilerini kullanarak gerçek zamanlı fiyatları takip edin
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">👛 Wallet Integration</h3>
              <p className="text-gray-300">
                Keplr, Leap ve Ledger desteği ile rahat cüzdan yönetimi
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">🌍 OSMO Network</h3>
              <p className="text-gray-300">
                Osmosis ağında doğrudan işlem yapın
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">💎 Çeşitli Emtialar</h3>
              <p className="text-gray-300">
                Altın, Gümüş, Petrol, Bakır ve daha fazlası
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2026 HomeRate Exchange. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
