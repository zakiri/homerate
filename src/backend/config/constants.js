export const COMMODITY_SYMBOLS = {
  GOLD: {
    name: 'Altın',
    binanceSymbol: 'BTCUSDT',
    description: 'Kıymetli metal - Altın',
    category: 'metal'
  },
  SILVER: {
    name: 'Gümüş',
    binanceSymbol: 'ETHUSDT',
    description: 'Kıymetli metal - Gümüş',
    category: 'metal'
  },
  OIL: {
    name: 'Petrol',
    binanceSymbol: 'BNBUSDT',
    description: 'Enerji kaynağı - Petrol (WTI)',
    category: 'energy'
  },
  COPPER: {
    name: 'Bakır',
    binanceSymbol: 'ADAUSDT',
    description: 'Endüstriyel metal - Bakır',
    category: 'metal'
  },
  WHEAT: {
    name: 'Buğday',
    binanceSymbol: 'DOGEUSDT',
    description: 'Tarım ürünü - Buğday',
    category: 'agricultural'
  },
  CORN: {
    name: 'Mısır',
    binanceSymbol: 'LTCUSDT',
    description: 'Tarım ürünü - Mısır',
    category: 'agricultural'
  },
  NATURAL_GAS: {
    name: 'Doğal Gaz',
    binanceSymbol: 'XRPUSDT',
    description: 'Enerji kaynağı - Doğal Gaz',
    category: 'energy'
  }
};

export const GAS_SETTINGS = {
  BASE_GAS: 200000,
  GAS_PRICE: 0.025,
  GAS_ADJUSTMENT: 1.3,
  MAX_GAS: 1000000,
  OPERATIONS: {
    SWAP: 1.5,
    TRANSFER: 0.8,
    BUY: 1.0,
    SELL: 1.0
  }
};

export const NETWORK_CONFIG = {
  OSMOSIS: {
    chainId: 'osmosis-1',
    rpc: 'https://rpc.osmosis.zone',
    rest: 'https://lcd.osmosis.zone',
    explorer: 'https://www.mintscan.io/osmosis',
    denom: 'uosmo'
  }
};

export const WALLET_TYPES = {
  KEPLR: 'keplr',
  LEAP: 'leap',
  LEDGER: 'ledger'
};

export const TX_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed'
};

export const RATE_LIMITS = {
  DEFAULT_WINDOW: 15 * 60 * 1000, // 15 minutes
  DEFAULT_MAX: 100,
  API_WINDOW: 15 * 60 * 1000,
  API_MAX: 30
};
