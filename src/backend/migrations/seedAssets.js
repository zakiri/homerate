import mongoose from 'mongoose';
import SyntheticAsset from '../models/SyntheticAsset.js';
import { SYNTHETIC_ASSETS, ASSET_QUANTITIES, PRICE_REFERENCE } from '../config/syntheticAssets.js';
import dotenv from 'dotenv';

dotenv.config();

const seedSyntheticAssets = async () => {
  try {
    // MongoDB bağlantısı kur
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/homerate',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );

    console.log('✅ MongoDB bağlantısı başarılı');

    // Mevcut varlıkları sil
    const deletedCount = await SyntheticAsset.deleteMany({});
    console.log(`🗑️  ${deletedCount.deletedCount} eski varlık silindi`);

    // Sentetik varlıkları ekle
    const assetsToInsert = SYNTHETIC_ASSETS.map(asset => {
      const symbol = asset.symbol.toUpperCase();
      const quantity = ASSET_QUANTITIES[symbol] || 0;

      // Wei hesapla (HRATE benzeri)
      const hrateWei = (asset.priceInHRate * 1e18).toString();

      return {
        symbol,
        name: asset.name,
        category: asset.category,
        currentPrice: asset.currentPrice,
        priceInHRate: asset.priceInHRate,
        priceInHRateWei: hrateWei,
        priceUnit: 'USD',
        totalSupply: quantity,
        circulatingSupply: Math.floor(quantity * 0.7), // %70 dolaşımda
        maxSupply: quantity,
        decimals: asset.decimals,
        description: asset.description,
        imageUrl: asset.imageUrl,
        // Günlük değişim simülasyonu
        dailyChange: {
          amount: (Math.random() - 0.5) * asset.currentPrice * 0.1,
          percentage: (Math.random() - 0.5) * 5, // ±2.5%
          timestamp: new Date()
        },
        weeklyChange: {
          amount: (Math.random() - 0.5) * asset.currentPrice * 0.2,
          percentage: (Math.random() - 0.5) * 10
        },
        monthlyChange: {
          amount: (Math.random() - 0.5) * asset.currentPrice * 0.3,
          percentage: (Math.random() - 0.5) * 20
        },
        volume24h: Math.random() * 1000000,
        marketCap: quantity * asset.currentPrice,
        pairedWith: [
          { asset: 'HRATE', exchangeRate: asset.priceInHRate, isActive: true },
          { asset: 'ETH', exchangeRate: asset.priceInHRate / PRICE_REFERENCE.ETH_USD, isActive: true },
          { asset: 'BTC', exchangeRate: asset.priceInHRate / PRICE_REFERENCE.BTC_USD, isActive: true },
          { asset: 'USDT', exchangeRate: asset.currentPrice, isActive: true }
        ],
        isActive: true,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    const insertedAssets = await SyntheticAsset.insertMany(assetsToInsert);
    console.log(`✅ ${insertedAssets.length} sentetik varlık başarıyla eklendi`);

    // Özet bilgisi
    console.log('\n📊 Varlık Özeti:');
    const categories = ['precious_metal', 'energy', 'agricultural', 'cryptocurrency', 'stablecoin', 'platform_token'];
    for (const cat of categories) {
      const count = await SyntheticAsset.countDocuments({ category: cat });
      console.log(`  ${cat}: ${count} varlık`);
    }

    const totalMarketCap = await SyntheticAsset.aggregate([
      { $group: { _id: null, total: { $sum: '$marketCap' } } }
    ]);
    console.log(`\n💰 Toplam Market Cap: $${totalMarketCap[0]?.total.toLocaleString('en', { maximumFractionDigits: 2 }) || 0}`);

    console.log('\n✨ Seed işlemi tamamlandı!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed işlemi sırasında hata oluştu:', error);
    process.exit(1);
  }
};

// Seed'i çalıştır
seedSyntheticAssets();
