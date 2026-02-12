// 35 Sentetik Varlık Definitleri
export const SYNTHETIC_ASSETS = [
  // Precious Metals (Kıymetli Metaller) - 4
  {
    symbol: 'XAUT',
    name: 'Altın (Gold)',
    category: 'precious_metal',
    currentPrice: 2050,
    priceInHRate: 2050,
    decimals: 18,
    description: 'Uluslararası Altın spot fiyatı',
    imageUrl: '🟡'
  },
  {
    symbol: 'XAGT',
    name: 'Gümüş (Silver)',
    category: 'precious_metal',
    currentPrice: 24,
    priceInHRate: 24,
    decimals: 18,
    description: 'Uluslararası Gümüş spot fiyatı',
    imageUrl: '⚪'
  },
  {
    symbol: 'XPLT',
    name: 'Platinum',
    category: 'precious_metal',
    currentPrice: 1050,
    priceInHRate: 1050,
    decimals: 18,
    description: 'Platinum spot fiyatı',
    imageUrl: '⚙️'
  },
  {
    symbol: 'XPLD',
    name: 'Palladyum',
    category: 'precious_metal',
    currentPrice: 875,
    priceInHRate: 875,
    decimals: 18,
    description: 'Palladyum spot fiyatı',
    imageUrl: '🪙'
  },

  // Energy (Enerji) - 4
  {
    symbol: 'CRUDE',
    name: 'Petrol (WTI Crude Oil)',
    category: 'energy',
    currentPrice: 78.5,
    priceInHRate: 78.5,
    decimals: 18,
    description: 'WTI Petrol varil başına fiyatı',
    imageUrl: '🛢️'
  },
  {
    symbol: 'BRENT',
    name: 'Brent Petrol',
    category: 'energy',
    currentPrice: 82.3,
    priceInHRate: 82.3,
    decimals: 18,
    description: 'Brent Petrol varil başına fiyatı',
    imageUrl: '⛽'
  },
  {
    symbol: 'NATGAS',
    name: 'Doğal Gaz',
    category: 'energy',
    currentPrice: 3.25,
    priceInHRate: 3.25,
    decimals: 18,
    description: 'Henry Hub Doğal Gaz fiyatı',
    imageUrl: '💨'
  },
  {
    symbol: 'COAL',
    name: 'Kömür',
    category: 'energy',
    currentPrice: 125,
    priceInHRate: 125,
    decimals: 18,
    description: 'Kömür ton başına fiyatı',
    imageUrl: '⚫'
  },

  // Agricultural (Tarımsal) - 8
  {
    symbol: 'WHEAT',
    name: 'Buğday',
    category: 'agricultural',
    currentPrice: 6.85,
    priceInHRate: 6.85,
    decimals: 18,
    description: 'Buğday bushel başına fiyatı',
    imageUrl: '🌾'
  },
  {
    symbol: 'CORN',
    name: 'Mısır',
    category: 'agricultural',
    currentPrice: 4.5,
    priceInHRate: 4.5,
    decimals: 18,
    description: 'Mısır bushel başına fiyatı',
    imageUrl: '🌽'
  },
  {
    symbol: 'SOYA',
    name: 'Soya Ürünleri',
    category: 'agricultural',
    currentPrice: 12.3,
    priceInHRate: 12.3,
    decimals: 18,
    description: 'Soya bushel başına fiyatı',
    imageUrl: '🫘'
  },
  {
    symbol: 'COFFEE',
    name: 'Kahve',
    category: 'agricultural',
    currentPrice: 2.28,
    priceInHRate: 2.28,
    decimals: 18,
    description: 'Arabica Kahve pound başına fiyatı',
    imageUrl: '☕'
  },
  {
    symbol: 'COCOA',
    name: 'Kakao',
    category: 'agricultural',
    currentPrice: 4150,
    priceInHRate: 4150,
    decimals: 18,
    description: 'Kakao ton başına fiyatı',
    imageUrl: '🍫'
  },
  {
    symbol: 'SUGAR',
    name: 'Şeker',
    category: 'agricultural',
    currentPrice: 0.58,
    priceInHRate: 0.58,
    decimals: 18,
    description: 'Ham şeker pound başına fiyatı',
    imageUrl: '🍬'
  },
  {
    symbol: 'COTTON',
    name: 'Pamuk',
    category: 'agricultural',
    currentPrice: 0.82,
    priceInHRate: 0.82,
    decimals: 18,
    description: 'Pamuk pound başına fiyatı',
    imageUrl: '🩰'
  },
  {
    symbol: 'OJ',
    name: 'Portakal Suyu',
    category: 'agricultural',
    currentPrice: 1.95,
    priceInHRate: 1.95,
    decimals: 18,
    description: 'Portakal suyu pound başına fiyatı',
    imageUrl: '🍊'
  },

  // Cryptocurrency (Kripto Para) - 6
  {
    symbol: 'SBTC',
    name: 'Sentetik Bitcoin',
    category: 'cryptocurrency',
    currentPrice: 67500,
    priceInHRate: 67500,
    decimals: 18,
    description: 'Bitcoin spot fiyatı üzerinden sentetik varlık',
    imageUrl: '₿'
  },
  {
    symbol: 'SETH',
    name: 'Sentetik Ethereum',
    category: 'cryptocurrency',
    currentPrice: 3800,
    priceInHRate: 3800,
    decimals: 18,
    description: 'Ethereum spot fiyatı üzerinden sentetik varlık',
    imageUrl: '◆'
  },
  {
    symbol: 'SXRP',
    name: 'Sentetik XRP',
    category: 'cryptocurrency',
    currentPrice: 2.45,
    priceInHRate: 2.45,
    decimals: 18,
    description: 'XRP Ledger token spot fiyatı',
    imageUrl: '✕'
  },
  {
    symbol: 'SADA',
    name: 'Sentetik Cardano',
    category: 'cryptocurrency',
    currentPrice: 1.05,
    priceInHRate: 1.05,
    decimals: 18,
    description: 'ADA coin spot fiyatı',
    imageUrl: '₳'
  },
  {
    symbol: 'SSOL',
    name: 'Sentetik Solana',
    category: 'cryptocurrency',
    currentPrice: 198,
    priceInHRate: 198,
    decimals: 18,
    description: 'Solana spot fiyatı',
    imageUrl: '◎'
  },
  {
    symbol: 'SDOGE',
    name: 'Sentetik Dogecoin',
    category: 'cryptocurrency',
    currentPrice: 0.38,
    priceInHRate: 0.38,
    decimals: 18,
    description: 'DOGE spot fiyatı',
    imageUrl: '🐕'
  },

  // Stablecoin - 4
  {
    symbol: 'USDC',
    name: 'USD Coin',
    category: 'stablecoin',
    currentPrice: 1.0,
    priceInHRate: 1.0,
    decimals: 6,
    description: 'Circle tarafından çıkarılan USD stablecoin',
    imageUrl: '💵'
  },
  {
    symbol: 'DAI',
    name: 'DAI Stablecoin',
    category: 'stablecoin',
    currentPrice: 1.0,
    priceInHRate: 1.0,
    decimals: 18,
    description: 'Maker Protocol tarafından desteklenen USD stablecoin',
    imageUrl: '◆'
  },
  {
    symbol: 'BUSD',
    name: 'Binance USD',
    category: 'stablecoin',
    currentPrice: 1.0,
    priceInHRate: 1.0,
    decimals: 18,
    description: 'Binance USD stablecoin',
    imageUrl: '🏦'
  },
  {
    symbol: 'PAXG',
    name: 'Paxos Gold',
    category: 'stablecoin',
    currentPrice: 2050,
    priceInHRate: 2050,
    decimals: 18,
    description: 'Altın destekli stablecoin',
    imageUrl: '🏆'
  },

  // Platform Token - 3
  {
    symbol: 'UNI',
    name: 'Uniswap Token',
    category: 'platform_token',
    currentPrice: 12.5,
    priceInHRate: 12.5,
    decimals: 18,
    description: 'Uniswap DEX governance token',
    imageUrl: '🦄'
  },
  {
    symbol: 'AAVE',
    name: 'Aave Token',
    category: 'platform_token',
    currentPrice: 650,
    priceInHRate: 650,
    decimals: 18,
    description: 'Aave lending protocol governance token',
    imageUrl: '👻'
  },
  {
    symbol: 'COMP',
    name: 'Compound Token',
    category: 'platform_token',
    currentPrice: 185,
    priceInHRate: 185,
    decimals: 18,
    description: 'Compound protocol governance token',
    imageUrl: '🔷'
  }
];

// HomeRate Coin Konfigürasyonu (ETH benzeri)
export const HOMERATE_COIN = {
  symbol: 'HRATE',
  name: 'HomeRate',
  decimals: 18,
  weiSymbol: 'hrate',
  totalSupply: '1000000', // 1M HomeRate
  description: 'HomeRate borsa native token - ETH eş değeri',
  priceInUSD: 3800,
  pairedWith: ['ETH', 'BTC', 'USDT', 'USD']
};

// Değişim Çiftleri (Trading Pairs)
export const TRADING_PAIRS = [
  { from: 'HRATE', to: 'ETH', isActive: true },
  { from: 'HRATE', to: 'BTC', isActive: true },
  { from: 'HRATE', to: 'USDT', isActive: true },
  { from: 'HRATE', to: 'USD', isActive: true },
  { from: 'ETH', to: 'BTC', isActive: true },
  { from: 'ETH', to: 'USDT', isActive: true },
  { from: 'BTC', to: 'USDT', isActive: true },
  
  // Sentetik varlıklar HRATE ile
  { from: 'XAUT', to: 'HRATE', isActive: true },
  { from: 'CRUDE', to: 'HRATE', isActive: true },
  { from: 'WHEAT', to: 'HRATE', isActive: true },
  { from: 'SBTC', to: 'HRATE', isActive: true },
  
  // Stablecoin çiftleri
  { from: 'USDC', to: 'USDT', isActive: true },
  { from: 'DAI', to: 'USDT', isActive: true },
  { from: 'BUSD', to: 'USDT', isActive: true }
];

// Mevcut Fiyatlar (Reference Prices)
export const PRICE_REFERENCE = {
  ETH_USD: 3800,
  BTC_USD: 67500,
  USDT_USD: 1.0,
  HRATE_USD: 3800, // HRATE = ETH eş değeri
  HRATE_WEI: 1 // 1 HRATE = 1e18 hrate (wei)
};

// Gas Ücret Konfigürasyonu
export const GAS_CONFIG = {
  standardGasPrice: 0.025, // HRATE cinsinden
  fastGasPrice: 0.035,
  instantGasPrice: 0.050,
  gasLimit: {
    transfer: 21000,
    swap: 200000,
    mint: 300000,
    burn: 250000
  }
};

// Adet/Miktar Bilgileri
export const ASSET_QUANTITIES = {
  XAUT: 1000000, // 1M ons
  XAGT: 5000000, // 5M ons
  XPLT: 500000,
  XPLD: 600000,
  CRUDE: 2000000, // 2M varil
  BRENT: 1800000,
  NATGAS: 50000000, // 50M MBtu
  COAL: 10000000, // 10M ton
  WHEAT: 500000000, // 500M bushel
  CORN: 400000000,
  SOYA: 300000000,
  COFFEE: 50000000, // 50M pounds
  COCOA: 20000000,
  SUGAR: 100000000,
  COTTON: 80000000,
  OJ: 60000000,
  SBTC: 21000000, // 21M max supply
  SETH: 120000000, // 120M ether
  SXRP: 100000000000, // 100B XRP
  SADA: 45000000000, // 45B ADA
  SSOL: 576000000, // 576M SOL
  SDOGE: 133000000000, // 133B DOGE
  USDC: 500000000, // 500M USDC
  DAI: 500000000, // 500M DAI
  BUSD: 500000000, // 500M BUSD
  PAXG: 200000, // 200K oz (stashed altın eş)
  UNI: 1000000000, // 1B UNI
  AAVE: 16000000, // 16M AAVE
  COMP: 1000000 // 1M COMP
};
