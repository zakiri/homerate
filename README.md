# HomeRate Sentetik Emtia Borsası

## Proje Açıklaması

HomeRate, Osmosis (OSMO) blockchain ağında çalışan, sentetik emtialar (altın, gümüş, petrol vb.) için kolaylıklı bir ticaret platformudur. Kendi coin sistemi ile gas ücretlerini minimum seviyede tutarken, güvenli ve hızlı işlemler sağlar.

## Özellikler

### 🔒 Güvenlik
- EVM-compatible ve Cosmos ağları ile entegrasyon
- JWT tabanlı kimlik doğrulama
- 2FA (İki Faktörlü Kimlik Doğrulama) desteği
- Rate limiting ve CORS güvenliği
- Helmet.js ile HTTP güvenlik başlıkları

### 👛 Cüzdan Yönetimi
- Keplr cüzdan entegrasyonu
- Leap wallet desteği
- Ledger donanım cüzdan uyumluluğu
- Çoklu cüzdan profili

### 💹 Market Verileri
- Binance API entegrasyonu
- Gerçek zamanlı fiyat güncellemeleri
- Canlı grafikler (Recharts)
- 24 saat değişim analizi

### 💼 Portfolio Yönetimi
- Varlık takibi
- İşlem geçmişi
- Bakiye izleme
- Portföy değeri analizi

### ⚡ İşlemler
- Satın alma/Satış
- Takas (Swap)
- Transfer
- Gas ücret hesaplamı
- İşlem durumu takibi

## Teknolojiler

### Backend
- **Express.js** - Web framework
- **MongoDB** - Veritabanı
- **Mongoose** - ODM
- **JWT** - Kimlik doğrulama
- **Axios** - HTTP istemcisi
- **Socket.io** - Gerçek zamanlı iletişim

### Frontend
- **Next.js** - React framework
- **React** - UI kütüphanesi
- **Tailwind CSS** - Stil framework
- **Recharts** - Grafik kütüphanesi
- **Axios** - HTTP istemcisi

### Blockchain
- **CosmJS** - Cosmos SDK entegrasyonu
- **Web3.js** - Web3 arabirimleri
- **Ethers.js** - Ethereum kütüphanesi

## 🔐 Master Blockchain Account

HomeRate, merkezi bir borsyıalı account tamsı ETH ve OSMO ağlarında işlem yapabilir:

### Özellikler
- ✅ **Multi-Network:** Ethereum ve Osmosis ağlarında aynı anda çalışır
- ✅ **Secure:** Private key'ler çalışma zamanında yüklenir, hiç share'lenmiyor
- ✅ **Monitored:** Tüm işlemler security bot'ları tarafından kontrol ediliyor
- ✅ **Audited:** Her işlem kaydediliyor ve gözden geçirilebiliyor

### Setup

Master account'ı yapılandırmak için:

1. **Local .env dosyası oluşturun** (ASLA commit etmeyin!)
   ```bash
   cp .env.example .env
   ```

2. **Private key'leri ekleyin** (sadece local'de!)
   ```env
   ETH_MASTER_PRIVATE_KEY=your-64-char-hex-key
   OSMO_MASTER_PRIVATE_KEY=your-mnemonic-phrase
   MASTER_ACCOUNT_ENABLED=true
   ```

3. **Detaylı kurulum rehberi:** 👉 [LOCAL_SETUP_GUIDE.md](LOCAL_SETUP_GUIDE.md)

4. **Güvenlik best practices:** 👉 [PRIVATE_KEY_SECURITY.md](PRIVATE_KEY_SECURITY.md)

### API

Master account yönetimi (Admin only):
- `GET /api/blockchain/master-account/info` - Hesap bilgisi
- `GET /api/blockchain/master-account/health` - Sağlık durumu
- `GET /api/blockchain/ethereum/balance` - ETH balance
- `GET /api/blockchain/osmosis/account` - OSMO hesabı

## Kurulum

### Ön Gereksinimler
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 5.0
- Keplr veya Leap Cüzdan

### Adımlar

```bash
# Bağımlılıkları yükleyin
npm install

# Ortam değişkenlerini ayarlayın
cp .env.example .env

# 🔐 Master account private keys'lerini .env dosyasına ekleyin
# UYARI: .env dosyası hiçbir zaman git'e commit'lenmeyecek!
# Detaylı rehber için: LOCAL_SETUP_GUIDE.md

# Geliştirme sunucusunu başlatın
npm run dev

# Output'ta şunları görmelisiniz:
# 🔐 Initializing Master Blockchain Account...
# ✅ Master account ready:
#    📍 Ethereum: 0x...
#    📍 Osmosis: osmo1...
```

### Master Account Setup Detayları

İlk kez kurulum yapıyorsanız:

1. **[LOCAL_SETUP_GUIDE.md](LOCAL_SETUP_GUIDE.md)** - Adım adım yerel setup rehberi
2. **[PRIVATE_KEY_SECURITY.md](PRIVATE_KEY_SECURITY.md)** - Güvenlik best practices

Önemli noktalar:
- Private key'leri **ASLA** code'a yazmayın
- `.env` dosyası `.gitignore`'da (otomatik olarak)
- Her bilgisayarda farklı test key'leri kullanın
- Production'da Vault/Secrets Manager kullanın

Uygulama şunun üzerinde çalışır:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş
- `POST /api/auth/logout` - Çıkış
- `POST /api/auth/refresh-token` - Token yenileme

### Kullanıcı
- `GET /api/user/profile` - Profil bilgisi
- `PUT /api/user/profile` - Profil güncelleme
- `POST /api/user/wallet/connect` - Cüzdan bağla
- `POST /api/user/wallet/disconnect` - Cüzdan çıkar

### Portföy
- `GET /api/portfolio` - Portföy bilgisi
- `GET /api/portfolio/assets` - Varlıklar
- `GET /api/portfolio/balance-history` - Bakiye geçmişi

### Market
- `GET /api/market/data/:symbol` - Emtia verisi
- `GET /api/market/history/:symbol` - Fiyat tarihi
- `GET /api/market/top-movers` - En çok hareket edenler
- `GET /api/market/chart/:symbol` - Canlı grafik verileri

### İşlemler
- `GET /api/transaction/history` - İşlem geçmişi
- `POST /api/transaction/create` - İşlem oluştur
- `GET /api/transaction/:id/status` - İşlem durumu
- `POST /api/transaction/estimate-gas` - Gas ücret tahmini

## Docker ile Çalıştırma

```bash
docker-compose up -d
```

## Güvenlik Notları

1. Tüm API istekleri HTTPS üzerinden yapılmalıdır (production'da)
2. JWT_SECRET ve API anahtarlarını kaynak kontrol sistemine commit etmeyin
3. Rate limiting aktif olarak tutulmalıdır
4. CORS başlangıç değerleri güvenli şekilde ayarlanmalıdır
5. Düzenli güvenlik denetimleri yapılmalıdır

## Lisans

MIT License

## İletişim

Sorularınız için GitHub Issues'ı kullanın.