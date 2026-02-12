import SyntheticAsset from '../models/SyntheticAsset.js';
import { SYNTHETIC_ASSETS, ASSET_QUANTITIES, PRICE_REFERENCE } from '../config/syntheticAssets.js';

// Tüm varlıkları listele
export const listAssets = async (req, res) => {
  try {
    const { category, sortBy = 'marketCap', limit = 50, offset = 0, search } = req.query;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { symbol: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    switch (sortBy) {
      case 'price':
        sortOptions.currentPrice = -1;
        break;
      case 'name':
        sortOptions.name = 1;
        break;
      case 'dailyChange':
        sortOptions['dailyChange.percentage'] = -1;
        break;
      case 'volume':
        sortOptions.volume24h = -1;
        break;
      default:
        sortOptions.marketCap = -1;
    }

    const assets = await SyntheticAsset.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    const total = await SyntheticAsset.countDocuments(query);

    res.json({
      success: true,
      data: assets,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Varlıklar listelenirken hata oluştu',
      error: error.message
    });
  }
};

// Tek varlık detayı
export const getAssetDetail = async (req, res) => {
  try {
    const { symbol } = req.params;

    const asset = await SyntheticAsset.findOne({
      symbol: symbol.toUpperCase(),
      isActive: true
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Varlık bulunamadı'
      });
    }

    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error('Get asset detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Varlık detayı alınırken hata oluştu',
      error: error.message
    });
  }
};

// Varlık fiyatını güncelle
export const updateAssetPrice = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { currentPrice, dailyChange } = req.body;

    const asset = await SyntheticAsset.findOneAndUpdate(
      { symbol: symbol.toUpperCase() },
      {
        currentPrice,
        'dailyChange.amount': dailyChange?.amount || 0,
        'dailyChange.percentage': dailyChange?.percentage || 0,
        'dailyChange.timestamp': new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Varlık bulunamadı'
      });
    }

    res.json({
      success: true,
      data: asset,
      message: 'Fiyat başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({
      success: false,
      message: 'Fiyat güncellenirken hata oluştu',
      error: error.message
    });
  }
};

// Kategorilere göre varlıklar
export const getAssetsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const assets = await SyntheticAsset.find({
      category,
      isActive: true
    }).sort({ marketCap: -1 });

    res.json({
      success: true,
      category,
      count: assets.length,
      data: assets
    });
  } catch (error) {
    console.error('Get by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategoriye göre varlıklar alınırken hata oluştu',
      error: error.message
    });
  }
};

// Varlık arama
export const searchAssets = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Arama sorgusu gereklidir'
      });
    }

    const assets = await SyntheticAsset.find({
      $or: [
        { symbol: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      query: q,
      results: assets,
      count: assets.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Arama yapılırken hata oluştu',
      error: error.message
    });
  }
};

// Top performers (En çok yükselen)
export const getTopPerformers = async (req, res) => {
  try {
    const { limit = 10, period = '24h' } = req.query;

    let sortField = 'dailyChange.percentage';
    if (period === 'weekly') {
      sortField = 'weeklyChange.percentage';
    } else if (period === 'monthly') {
      sortField = 'monthlyChange.percentage';
    }

    const assets = await SyntheticAsset.find({ isActive: true })
      .sort({ [sortField]: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      period,
      data: assets
    });
  } catch (error) {
    console.error('Top performers error:', error);
    res.status(500).json({
      success: false,
      message: 'En çok yükselen varlıklar alınırken hata oluştu',
      error: error.message
    });
  }
};

// Varlığı favorilere ekle/çıkar
export const toggleFavorite = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { userId } = req.user;

    const asset = await SyntheticAsset.findOne({ symbol: symbol.toUpperCase() });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Varlık bulunamadı'
      });
    }

    // User favorilerine ekle/çıkar
    // Bu işlem Portfolio model üzerinde yapılacak
    res.json({
      success: true,
      message: asset.isFavorite ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi',
      data: asset
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Favori işlemi yapılırken hata oluştu',
      error: error.message
    });
  }
};

// Varlık miktarını al
export const getAssetQuantity = async (req, res) => {
  try {
    const { symbol } = req.params;

    const asset = await SyntheticAsset.findOne({ symbol: symbol.toUpperCase() });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Varlık bulunamadı'
      });
    }

    const quantity = ASSET_QUANTITIES[symbol.toUpperCase()] || 0;

    res.json({
      success: true,
      data: {
        symbol: asset.symbol,
        name: asset.name,
        totalSupply: asset.totalSupply,
        circulatingSupply: asset.circulatingSupply,
        maxSupply: asset.maxSupply,
        quantity,
        decimals: asset.decimals
      }
    });
  } catch (error) {
    console.error('Get quantity error:', error);
    res.status(500).json({
      success: false,
      message: 'Miktar bilgisi alınırken hata oluştu',
      error: error.message
    });
  }
};

// Tüm kategorileri al
export const getCategories = async (req, res) => {
  try {
    const categories = [
      'precious_metal',
      'energy',
      'agricultural',
      'cryptocurrency',
      'stablecoin',
      'platform_token'
    ];

    const categoryStats = {};

    for (const category of categories) {
      const count = await SyntheticAsset.countDocuments({
        category,
        isActive: true
      });
      const topAsset = await SyntheticAsset.findOne({
        category,
        isActive: true
      }).sort({ marketCap: -1 });

      categoryStats[category] = {
        count,
        topAsset: topAsset?.symbol || 'N/A'
      };
    }

    res.json({
      success: true,
      data: categoryStats
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Kategoriler alınırken hata oluştu',
      error: error.message
    });
  }
};
