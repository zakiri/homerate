// Osmosis & HomeRate Synthetic Exchange Smart Contract ABI
export const SWAP_CONTRACT_ABI = [
  {
    type: 'execute',
    name: 'swap',
    description: 'Sentetik varlıklar arasında swap işlemi',
    inputs: [
      { name: 'token_in', type: 'string', description: 'Gönderilen token adresi' },
      { name: 'token_out', type: 'string', description: 'Alınan token adresi' },
      { name: 'amount_in', type: 'Uint128', description: 'Gönderilecek miktar' },
      { name: 'min_amount_out', type: 'Uint128', description: 'Minimum alınan miktar' },
      { name: 'slippage', type: 'Decimal', description: 'Kaymış toleransı (%)' }
    ],
    outputs: { type: 'Uint128', description: 'Alınan miktar' }
  },
  {
    type: 'execute',
    name: 'multiswap',
    description: 'Çoklu hop swap (A->B->C)',
    inputs: [
      { name: 'path', type: 'string[]', description: 'Token yolu' },
      { name: 'amount_in', type: 'Uint128', description: 'Başlangıç miktarı' },
      { name: 'min_amount_out', type: 'Uint128', description: 'Minimum son miktar' }
    ]
  },
  {
    type: 'execute',
    name: 'mint_synthetic',
    description: 'Sentetik varlık mint et',
    inputs: [
      { name: 'asset_symbol', type: 'string', description: 'Varlık sembolü' },
      { name: 'amount', type: 'Uint128', description: 'Mint edilecek miktar' },
      { name: 'collateral', type: 'string', description: 'Teminat token adresi' },
      { name: 'collateral_amount', type: 'Uint128', description: 'Teminat miktarı' }
    ]
  },
  {
    type: 'execute',
    name: 'burn_synthetic',
    description: 'Sentetik varlık yak',
    inputs: [
      { name: 'asset_symbol', type: 'string', description: 'Varlık sembolü' },
      { name: 'amount', type: 'Uint128', description: 'Yakılacak miktar' }
    ]
  },
  {
    type: 'execute',
    name: 'create_limit_order',
    description: 'Limit sipariş oluştur',
    inputs: [
      { name: 'token_in', type: 'string' },
      { name: 'token_out', type: 'string' },
      { name: 'amount_in', type: 'Uint128' },
      { name: 'limit_price', type: 'Decimal' }
    ]
  }
];

export const SEND_CONTRACT_ABI = [
  {
    type: 'execute',
    name: 'send',
    description: 'Token gönder',
    inputs: [
      { name: 'contract', type: 'string', description: 'Hedef kontrat adresi' },
      { name: 'amount', type: 'Uint128', description: 'Gönderilecek miktar' },
      { name: 'msg', type: 'string', description: 'Mesaj payload' }
    ]
  },
  {
    type: 'execute',
    name: 'transfer',
    description: 'Token transfer et',
    inputs: [
      { name: 'recipient', type: 'string', description: 'Alıcı adresi' },
      { name: 'amount', type: 'Uint128', description: 'Transfer miktar' }
    ]
  },
  {
    type: 'execute',
    name: 'approve',
    description: 'Harcama yetkisi ver',
    inputs: [
      { name: 'spender', type: 'string', description: 'Harcayıcı adresi' },
      { name: 'amount', type: 'Uint128', description: 'Yetki miktarı' }
    ]
  }
];

export const QUERY_CONTRACT_ABI = [
  {
    type: 'query',
    name: 'balance',
    description: 'Token bakiyesini sorgula',
    inputs: [{ name: 'address', type: 'string', description: 'Sorgu adresi' }],
    outputs: { name: 'balance', type: 'Uint128', description: 'Bakiye' }
  },
  {
    type: 'query',
    name: 'allowance',
    description: 'Harcama yetkisini sorgula',
    inputs: [
      { name: 'owner', type: 'string' },
      { name: 'spender', type: 'string' }
    ],
    outputs: { name: 'allowance', type: 'Uint128' }
  },
  {
    type: 'query',
    name: 'price',
    description: 'Varlığın fiyatını sorgula',
    inputs: [{ name: 'asset_symbol', type: 'string' }],
    outputs: { name: 'price', type: 'Decimal' }
  },
  {
    type: 'query',
    name: 'liquidity_pool',
    description: 'Likidite havuzunu sorgula',
    inputs: [
      { name: 'token_a', type: 'string' },
      { name: 'token_b', type: 'string' }
    ],
    outputs: {
      liquidity_a: 'Uint128',
      liquidity_b: 'Uint128',
      fee: 'Decimal',
      tvl: 'Uint128'
    }
  },
  {
    type: 'query',
    name: 'swap_simulation',
    description: 'Swap sonucunu simüle et',
    inputs: [
      { name: 'token_in', type: 'string' },
      { name: 'token_out', type: 'string' },
      { name: 'amount_in', type: 'Uint128' }
    ],
    outputs: {
      amount_out: 'Uint128',
      fees: 'Uint128',
      slippage: 'Decimal'
    }
  },
  {
    type: 'query',
    name: 'get_asset_info',
    description: 'Varlık bilgisini sorgula',
    inputs: [{ name: 'symbol', type: 'string' }],
    outputs: {
      name: 'string',
      total_supply: 'Uint128',
      circulating_supply: 'Uint128',
      price: 'Decimal'
    }
  },
  {
    type: 'query',
    name: 'get_user_positions',
    description: 'Kullanıcı pozisyonlarını sorgula',
    inputs: [{ name: 'user_address', type: 'string' }],
    outputs: {
      assets: 'object[]',
      total_value_locked: 'Decimal'
    }
  }
];

// HomeRate Coin Spesifik ABI
export const HOMERATE_COIN_ABI = [
  {
    type: 'execute',
    name: 'mint_hrate',
    description: 'HomeRate token mint et (admin)',
    inputs: [
      { name: 'recipient', type: 'string' },
      { name: 'amount', type: 'Uint128' }
    ]
  },
  {
    type: 'execute',
    name: 'burn_hrate',
    description: 'HomeRate token yak',
    inputs: [{ name: 'amount', type: 'Uint128' }]
  },
  {
    type: 'query',
    name: 'total_supply',
    description: 'Toplam HomeRate arzı',
    outputs: { type: 'Uint128' }
  },
  {
    type: 'query',
    name: 'hrate_to_wei',
    description: 'HRATE'yi hrate (wei) cinsine çevir',
    inputs: [{ name: 'hrate', type: 'Decimal' }],
    outputs: { type: 'Uint128' }
  },
  {
    type: 'query',
    name: 'wei_to_hrate',
    description: 'hrate (wei) yi HRATE cinsine çevir',
    inputs: [{ name: 'wei', type: 'Uint128' }],
    outputs: { type: 'Decimal' }
  }
];

// Gas Fees ABI
export const GAS_FEES_ABI = [
  {
    type: 'query',
    name: 'estimate_gas',
    description: 'İşlem için gas tahmin et',
    inputs: [
      { name: 'operation', type: 'string' },
      { name: 'params', type: 'object' }
    ],
    outputs: {
      gas_limit: 'Uint128',
      gas_price: 'Decimal',
      total_fee: 'Decimal'
    }
  },
  {
    type: 'query',
    name: 'get_gas_prices',
    description: 'Mevcut gas fiyatlarını al',
    outputs: {
      standard: 'Decimal',
      fast: 'Decimal',
      instant: 'Decimal'
    }
  }
];

export default {
  SWAP_CONTRACT_ABI,
  SEND_CONTRACT_ABI,
  QUERY_CONTRACT_ABI,
  HOMERATE_COIN_ABI,
  GAS_FEES_ABI
};
