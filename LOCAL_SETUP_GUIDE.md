# 🚀 HomeRate Local Test Setup Kılavuzu

## ⚠️ GÜVENLIK UYARISI

**Private KEY'ler ASLA:**
- ❌ GitHub'a push'lanmayın
- ❌ Başkasına göstermeyin
- ❌ Public URL'lerde saklamayın
- ❌ Kod içinde hardcode'lamayın
- ❌ Production ortamında shared repo'da yapıştırmayın

**Önerilen Yöntem:**
- ✅ Sadece local `.env` dosyasında tutun
- ✅ `.env` dosyası `.gitignore`'da var
- ✅ Her bilgisayarda farklı private key kullanın
- ✅ Regular olarak key'leri rotate edin
- ✅ Vault/Secret Manager kullanın (production'da)

---

## 📋 Sistem Gereksinimleri

```
✅ Node.js 18+ (npm 9+)
✅ MongoDB (Local veya Cloud)
✅ Git
✅ Terminal/Console
```

Kontrol edin:
```bash
node --version    # v18 veya üzeri
npm --version     # 9 veya üzeri
mongod --version  # MongoDB installed
git --version
```

---

## 🔧 Adım 1: Repository'yi İndir

```bash
# Repository'yi clone et
git clone https://github.com/zakiri/homerate.git
cd homerate

# Tüm dependencies'i yükle
npm install

# Dependencies kontrol et
npm list | head -20
```

Beklenen output:
```
homerate@1.0.0
├── express@4.18.2
├── mongoose@7.6.3
├── jsonwebtoken@9.0.0
├── ethers@6.7.1
├── @cosmjs/stargate@0.31.0
...
```

---

## 🔐 Adım 2: Private Key'leri Setup Et

### 2.1 - Local .env Dosyası Oluştur

**Windows (`cmd.exe`):**
```cmd
cd /workspaces/homerate
copy .env.example .env
notepad .env
```

**MacOS/Linux:**
```bash
cd /workspaces/homerate
cp .env.example .env
nano .env  # veya vim .env
```

### 2.2 - .env Dosyasını Doldur

Dosyayı açıp aşağıdaki kısımları güncelleyin:

```env
# ========================================
# 🔑 BLOCKCHAIN MASTER ACCOUNT SETUP
# ========================================

# Ethereum Network
ETH_NETWORK_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
ETH_MASTER_PRIVATE_KEY=2ce58fca99c476b9877b1a7e08c0a1e553a53aa104052f708ddf767aacec404e
ETH_MASTER_ADDRESS=0x1234567890123456789012345678901234567890
ETH_CHAIN_ID=1
ETH_GAS_PRICE=50

# Osmosis Network
OSMO_RPC_URL=https://rpc.osmosis.zone:443
OSMO_REST_URL=https://lcd.osmosis.zone/
OSMO_CHAIN_ID=osmosis-1
OSMO_MASTER_PRIVATE_KEY=your-osmo-mnemonic-here
OSMO_MASTER_ADDRESS=osmo1...
OSMO_GAS_PRICE=0.025

# Master Account Settings
MASTER_ACCOUNT_ENABLED=true
MASTER_ACCOUNT_NAME=HomerateExchange

# Diğer ayarlar...
```

**Önemli:** 
- Private key'i asla başkasına göstermeyin!
- `.env` dosyası `.gitignore`'da olduğu için commit edilmez
- Verify edin: `.env` dosyası `.gitignore` listesinde var mı?

```bash
cat .gitignore | grep "^.env"
# Output: .env (varsa tamam)
```

### 2.3 - Ethereum Infura Key Alın (Opsiyonel)

Eğer Ethereum ile çalışacaksanız:

1. https://infura.io adresine gidin
2. Kaydolun (Email + Password)
3. "Create New Project" seçin
4. "Ethereum" seçin
5. Project ID'ni kopyalayın
6. `.env` dosyasında kullanın:

```env
ETH_NETWORK_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
```

---

## 🗄️ Adım 3: MongoDB Bağlantısı

### 3.1 - Local MongoDB

Eğer lokal MongoDB kullanacaksanız:

```bash
# MongoDB servisini start et (macOS)
brew services start mongodb-community

# MongoDB servisini start et (Windows)
net start MongoDB

# MongoDB servisini start et (Linux)
sudo systemctl start mongod

# Connection test et
mongosh
# Output: test> (success)
# Çık: exit
```

### 3.2 - MongoDB Atlas (Cloud)

Veya online MongoDB kullanmak için:

1. https://www.mongodb.com/cloud/atlas adresine gidin
2. Free account oluşturun
3. Cluster oluşturun (Free tier)
4. Connection string'i kopyalayın
5. `.env`'de güncelleyin:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/homerate
```

---

## 🚀 Adım 4: Backend'i Çalıştır

```bash
# Backend'i development mode'da başlat
npm run dev:backend

# Beklenen output:
# 
# Server running on port 5000
# 
# 🔐 Initializing Master Blockchain Account...
# ✅ Master account ready:
#    📍 Ethereum: 0x1234567890123456789012345678901234567890
#    📍 Osmosis: osmo1...
#
# 🚀 Starting Security Bots...
# ✅ All security bots initialized and running
#
# Security dashboard available at: http://localhost:5000/api/security/dashboard
```

**Bağlantı Test Edin:**
```bash
# Yeni terminal açın ve çalıştırın:
curl http://localhost:5000/api/health

# Output:
# {"status":"OK","timestamp":"2026-02-11T..."}
```

---

## 💻 Adım 5: Frontend'i Çalıştır

```bash
# Yeni terminal açıp:
npm run dev:frontend

# Beklenen output:
# ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Tarayıcıda açın:**
```
http://localhost:3000
```

---

## 🔐 Adım 6: Master Account'ı Verify Et

### 6.1 - Admin Token Oluştur

```bash
# Terminal'de çalıştırın:
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { userId: 'admin', role: 'admin' },
  'test-secret-key',
  { expiresIn: '24h' }
);
console.log('Admin Token:', token);
"
```

### 6.2 - Master Account Bilgisini Kontrol Et

```bash
# Yukarıda aldığınız token'ı kullanın:
curl http://localhost:5000/api/blockchain/master-account/info \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Output örneği:
# {
#   "success": true,
#   "account": {
#     "enabled": true,
#     "name": "HomerateExchange",
#     "accounts": {
#       "ethereum": {
#         "address": "0x...",
#         "initialized": true
#       },
#       "osmosis": {
#         "address": "osmo1...",
#         "initialized": true
#       }
#     }
#   }
# }
```

### 6.3 - Ethereum Balance'ı Kontrol Et

```bash
curl http://localhost:5000/api/blockchain/ethereum/balance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Output:
# {
#   "success": true,
#   "balance": "1.5 ETH",
#   "address": "0x...",
#   "network": "ethereum"
# }
```

---

## 🧪 Test Kaynakları

### Transaction Test

```bash
# Token oluştur
TOKEN=$(node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({userId:'testuser',role:'user'},'test-secret-key'))")

# Transaction yarat
curl -X POST http://localhost:5000/api/transaction \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "buy",
    "fromSymbol": "GOLD",
    "toSymbol": "USD",
    "fromAmount": 10,
    "price": 1950
  }'
```

### Security Dashboard

```bash
# Admin token ile dashboard'u aç
curl http://localhost:5000/api/security/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🛡️ Security Verification

Master account başlatıldığında görmesi gereken loglar:

```
🔐 Initializing Master Blockchain Account...
✅ Ethereum Wallet initialized
   Address: 0x...
   Network: Ethereum Mainnet
✅ Osmosis Wallet initialized
   Address: osmo1...
   Network: Osmosis
✅ Master account initialized successfully
```

**Eğer hata alırsanız:**

```
❌ Failed to initialize master account: Invalid ETH private key format

ÇÖZÜM:
- Private key'in 64 hex character olduğunu kontrol edin
- Başında "0x" olmamalı
- Tüm karakterler 0-9 ve a-f olmalı
```

---

## 📁 File Structure

```
homerate/
├── .env                          # ⚠️ LOCAL - Git'e push'lanmaz
├── .env.example                  # ✅ Template sadece
├── .gitignore                    # ✅ .env ignore'lanmış
├── src/
│   └── backend/
│       ├── index.js              # Master account init
│       ├── services/
│       │   ├── masterBlockchainAccount.js  # NEW
│       │   ├── securityMonitoringService.js
│       │   └── ...
│       └── routes/
│           ├── blockchain.js     # NEW
│           └── ...
└── package.json
```

---

## 🔄 Workflow

```
1. .env oluştur (private key ekle)
   ↓
2. npm install
   ↓
3. MongoDB bağlantı kontrol
   ↓
4. npm run dev:backend
   ↓
5. Terminal açı npm run dev:frontend
   ↓
6. http://localhost:3000 tarayıcıda aç
   ↓
7. API Test:
   - curl http://localhost:5000/api/health
   - curl /api/blockchain/master-account/info
   - curl /api/security/dashboard
```

---

## 🐛 Common Issues

### Issue 1: "MASTER_ACCOUNT_ENABLED is not defined"
```
Çözüm:
process.env.MASTER_ACCOUNT_ENABLED === 'false' koşulunu kontrol et
veya .env'de değeri set et: MASTER_ACCOUNT_ENABLED=true
```

### Issue 2: "Invalid ETH private key format"
```
Çözüm:
- ETH private key 64 hex character olmalı
- Başında "0x" OLMAMALI
- Tamamen lowercase olmalı
```

### Issue 3: "MongoDB connection failed"
```
Çözüm:
1. mongod servisinin çalışıyor olduğunu kontrol et
2. MONGODB_URI'nın doğru olduğunu kontrol et
3. Local ise: mongodb://localhost:27017/homerate
```

### Issue 4: "Port 5000 already in use"
```
Çözüm:
# Process'i bul
lsof -i :5000        # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Process'i kill et
kill -9 <PID>        # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Veya farklı port kullan
PORT=5001 npm run dev:backend
```

---

## 🔒 Production Deployment

Production'da:

```env
MASTER_ACCOUNT_ENABLED=true
NODE_ENV=production

# Vault/Secret Manager'den load et:
ETH_MASTER_PRIVATE_KEY=$(aws secretsmanager get-secret-value ...)
OSMO_MASTER_PRIVATE_KEY=$(vault kv get ...)

# Üretken API keys:
INFURA_API_KEY...
BINANCE_API_KEY...
```

---

## 📞 Debugging

### Logs Kontrol Et

```bash
# Backend logs'u tail et
tail -f logs/app.log

# MongoDB logs'u kontrol et
mongosh
> db.transactions.find().sort({_id: -1}).limit(5)

# Blockchain account status
curl http://localhost:5000/api/blockchain/master-account/health \
  -H "Authorization: Bearer $TOKEN"
```

### Security Dashboard Kontrol Et

```
http://localhost:5000/api/security/dashboard

Görül mesiye gereken:
- Tüm botlar "isRunning": true
- Recent alerts
- Bot stats
```

---

## ✅ Checklist

- [ ] Repository clone'layıp install completed
- [ ] .env dosyası create'lenmiş (LOCAL ONLY)
- [ ] Private key'ler .env'e eklenmiş
- [ ] .env'nin .gitignore'da olduğu confirmed
- [ ] MongoDB çalışıyor (local/cloud)
- [ ] Backend başladı (port 5000)
- [ ] Frontend başladı (port 3000)
- [ ] http://localhost:3000 açılabiliyor
- [ ] API health check çalışıyor
- [ ] Master account health check çalışıyor
- [ ] Security dashboard görülüyor
- [ ] Test transaction gönderilmiş

---

## 🚁 Quick Start Commands

Tüm komutları tek satırda:

```bash
# Clone, install, ve start
git clone https://github.com/zakiri/homerate.git && \
cd homerate && \
cp .env.example .env && \
echo "➡️  .env dosyasını edit et!" && \
npm install && \
npm run dev  # Konkurrently başlat backend+frontend
```

---

**Last Updated:** 11 Şubat 2026  
**Status:** ✅ Ready for Local Testing
