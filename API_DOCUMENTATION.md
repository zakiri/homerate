# API Dokumentasyonu

## Temel Bilgiler

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json`
- **Rate Limit**: 100 istek/15 dakika

## Authentication

### Register (Kayıt)

```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "confirmPassword": "password"
}

Response 201:
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "username"
  }
}
```

### Login (Giriş)

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response 200:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "username",
    "walletAddress": "osmo1..."
  }
}
```

## User (Kullanıcı)

### Get Profile (Profil Bilgisi)

```
GET /user/profile
Authorization: Bearer {token}

Response 200:
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "username": "username",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Trader",
    "avatar": "url",
    "verificationLevel": 1
  },
  "walletAddress": "osmo1...",
  "walletType": "keplr",
  "isEmailVerified": true,
  "isWalletVerified": true
}
```

### Update Profile (Profil Güncelleme)

```
PUT /user/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Professional Trader",
    "phone": "+1234567890",
    "country": "Turkey"
  }
}

Response 200:
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### Connect Wallet (Cüzdan Bağla)

```
POST /user/wallet/connect
Authorization: Bearer {token}
Content-Type: application/json

{
  "walletAddress": "osmo1abcd1234...",
  "walletType": "keplr"
}

Response 200:
{
  "message": "Wallet connected successfully",
  "user": { ... }
}
```

## Portfolio (Portföy)

### Get Portfolio (Portföy Bilgisi)

```
GET /portfolio
Authorization: Bearer {token}

Response 200:
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439011",
  "walletAddress": "osmo1...",
  "totalBalance": 10000.50,
  "assets": [
    {
      "symbol": "GOLD",
      "amount": 50,
      "type": "commodity",
      "entryPrice": 100,
      "currentPrice": 105,
      "lastUpdated": "2026-02-10T12:30:00Z"
    }
  ],
  "balanceHistory": [
    {
      "date": "2026-02-10T12:30:00Z",
      "balance": 10000.50,
      "gasSpent": 0.50
    }
  ]
}
```

## Market (Pazar)

### Get Market Data (Emtia Verisi)

```
GET /market/data/GOLD

Response 200:
{
  "symbol": "GOLD",
  "name": "Altın",
  "binanceSymbol": "BTCUSDT",
  "lastPrice": "100.50",
  "priceChangePercent": "2.50",
  "highPrice": "102.00",
  "lowPrice": "98.00",
  "volume": "5000000"
}
```

### Get Price History (Fiyat Tarihi)

```
GET /market/history/GOLD?interval=1h&limit=24

Response 200:
[
  {
    "time": "2026-02-10T00:00:00Z",
    "open": 99.00,
    "high": 100.50,
    "low": 98.50,
    "close": 100.00,
    "volume": 500000
  },
  ...
]
```

### Get Top Movers (En Çok Hareket Edenler)

```
GET /market/top-movers

Response 200:
[
  {
    "symbol": "GOLD",
    "name": "Altın",
    "lastPrice": "100.50",
    "priceChangePercent": "5.00"
  },
  ...
]
```

## Transactions (İşlemler)

### Get Transaction History (İşlem Geçmişi)

```
GET /transaction/history?limit=50&offset=0
Authorization: Bearer {token}

Response 200:
{
  "transactions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439011",
      "type": "buy",
      "status": "confirmed",
      "fromSymbol": "OSMO",
      "toSymbol": "GOLD",
      "fromAmount": 1000,
      "toAmount": 50,
      "price": 2000,
      "gasUsed": 260000,
      "gasFee": 6.5,
      "transactionHash": "0x...",
      "timestamp": "2026-02-10T12:30:00Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

### Create Transaction (İşlem Oluştur)

```
POST /transaction/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "buy",
  "fromSymbol": "OSMO",
  "toSymbol": "GOLD",
  "fromAmount": 1000,
  "toAmount": 50,
  "price": 2000,
  "walletAddress": "osmo1..."
}

Response 201:
{
  "message": "Transaction created successfully",
  "transaction": { ... },
  "gasFee": 6.5
}
```

### Estimate Gas (Gas Ücret Tahmini)

```
POST /transaction/estimate-gas
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "swap",
  "fromAmount": 1000
}

Response 200:
{
  "estimatedGas": 300000,
  "adjustedGas": 390000,
  "gasFee": 9.75,
  "gasPrice": 0.025,
  "gasAdjustment": 1.3
}
```

## Error Responses (Hata Yanıtları)

```json
{
  "error": {
    "status": 400,
    "message": "Bad Request",
    "timestamp": "2026-02-10T12:30:00Z"
  }
}
```

### Common Error Codes

- `200`: Success (Başarılı)
- `201`: Created (Oluşturuldu)
- `400`: Bad Request (Hatalı İstek)
- `401`: Unauthorized (Yetkisiz)
- `403`: Forbidden (Yasak)
- `404`: Not Found (Bulunamadı)
- `409`: Conflict (Çakışma)
- `429`: Too Many Requests (Çok Fazla İstek)
- `500`: Internal Server Error (Sunucu Hatası)
