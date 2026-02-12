# Proje Yapısı Özeti

## Dizin Ağacı

```
homerate/
│
├── src/
│   ├── backend/
│   │   ├── index.js                          ← Ana server dosyası
│   │   ├── config/
│   │   │   └── constants.js                  ← Sabit tanımlamalar
│   │   ├── models/
│   │   │   ├── User.js                       ← Kullanıcı şeması
│   │   │   ├── Portfolio.js                  ← Portföy şeması
│   │   │   └── Transaction.js                ← İşlem şeması
│   │   ├── controllers/
│   │   │   ├── authController.js             ← Kimlik doğrulama mantığı
│   │   │   ├── userController.js             ← Kullanıcı yönetimi
│   │   │   ├── portfolioController.js        ← Portföy yönetimi
│   │   │   ├── marketController.js           ← Pazar verileri
│   │   │   └── transactionController.js      ← İşlem yönetimi
│   │   ├── routes/
│   │   │   ├── auth.js                       ← Kimlik doğrulama rotaları
│   │   │   ├── user.js                       ← Kullanıcı rotaları
│   │   │   ├── portfolio.js                  ← Portföy rotaları
│   │   │   ├── market.js                     ← Pazar rotaları
│   │   │   └── transaction.js                ← İşlem rotaları
│   │   ├── middleware/
│   │   │   ├── auth.js                       ← JWT kimlik doğrulaması
│   │   │   ├── rateLimiter.js                ← İstek sınırlaması
│   │   │   └── errorHandler.js               ← Hata işleme
│   │   ├── services/
│   │   │   ├── binanceService.js             ← Binance API entegrasyonu
│   │   │   ├── osmoService.js                ← OSMO/Cosmos entegrasyonu
│   │   │   └── priceService.js               ← Fiyat güncellemeleri
│   │   ├── utils/
│   │   │   └── security.js                   ← Güvenlik yardımcıları
│   │   └── migrations/
│   │       └── run.js                        ← Veritabanı göçleri
│   │
│   ├── frontend/
│   │   ├── pages/
│   │   │   ├── _app.js                       ← Next.js App wrapper
│   │   │   ├── _document.js                  ← HTML template
│   │   │   ├── index.js                      ← Ana sayfa (/)
│   │   │   ├── login.js                      ← Giriş sayfası
│   │   │   ├── register.js                   ← Kayıt sayfası
│   │   │   ├── dashboard.js                  ← Panel (/dashboard)
│   │   │   ├── profile.js                    ← Profil sayfası
│   │   │   ├── wallet.js                     ← Cüzdan yönetimi
│   │   │   ├── market.js                     ← Pazar sayfası
│   │   │   ├── portfolio.js                  ← Portföy sayfası
│   │   │   ├── 404.js                        ← 404 hata sayfası
│   │   │   └── 500.js                        ← 500 hata sayfası
│   │   ├── components/
│   │   │   ├── Navbar.js                     ← Navigasyon çubuğu
│   │   │   └── Card.js                       ← Kart bileşeni
│   │   ├── hooks/
│   │   │   ├── useAuth.js                    ← Kimlik doğrulama hook
│   │   │   ├── useForm.js                    ← Form yönetimi hook
│   │   │   └── useLocalStorage.js            ← Local storage hook
│   │   ├── utils/
│   │   │   ├── api.js                        ← API istemcisi
│   │   │   └── helpers.js                    ← Yardımcı fonksiyonlar
│   │   └── styles/
│   │       └── globals.css                   ← Genel stiller
│   │
│   └── contracts/
│       └── abi/
│           └── swapABI.js                    ← Smart contract ABI'ları
│
├── config/                                    ← Yapılandırma klasörü
├── public/                                    ← Statik dosyalar
├── .env.example                               ← Örnek ortam değişkenleri
├── .env                                       ← Gerçek ortam değişkenleri (git'den dışlanmış)
├── .gitignore                                 ← Git ignore kuralları
├── .eslintrc.js                               ← ESLint yapılandırması
├── .prettierrc                                ← Prettier yapılandırması
├── .babelrc                                   ← Babel yapılandırması
├── tsconfig.json                              ← TypeScript yapılandırması
├── jest.config.js                             ← Jest test yapılandırması
├── package.json                               ← npm bağımlılıkları
├── next.config.js                             ← Next.js yapılandırması
├── tailwind.config.js                         ← Tailwind CSS yapılandırması
├── postcss.config.js                          ← PostCSS yapılandırması
├── vite.config.js                             ← Vite yapılandırması
├── docker-compose.yml                         ← Docker Compose yapılandırması
├── Dockerfile.backend                         ← Backend Docker image
├── Dockerfile.frontend                        ← Frontend Docker image
├── install.sh                                 ← Kurulum script
├── README.md                                  ← Proje README
├── API_DOCUMENTATION.md                       ← API belgeleri
└── DEVELOPMENT.md                             ← Geliştirme rehberi
```

## Ana Dosyalar ve Amaçları

### Backend

| Dosya | Amaç |
|-------|------|
| `src/backend/index.js` | Express sunucusunu başlatır, rotaları ve middleware'i yapılandırır |
| `models/*.js` | MongoDB şemalarını tanımlar |
| `controllers/*.js` | Business logic'i içerir, router'lar tarafından çağrılır |
| `routes/*.js` | API endpoint'lerini tanımlar |
| `middleware/*.js` | Request/response işlemeleri |
| `services/*.js` | Harici API ve blockchain entegrasyonları |

### Frontend

| Dosya | Amaç |
|-------|------|
| `pages/index.js` | Ana sayfa (landing page) |
| `pages/_app.js` | Tüm sayfaları wrap eden component |
| `pages/_document.js` | HTML template tanımlaması |
| `components/*.js` | Yeniden kullanılabilir UI bileşenleri |
| `hooks/*.js` | Custom React hooks |
| `utils/api.js` | Backend API çağrıları |
| `styles/*.css` | Global CSS ve Tailwind |

## Veri Akışı

### Kullanıcı Kaydı
1. Frontend: `/register` → Form gönder
2. Backend: `POST /api/auth/register` → Kullanıcı oluştur
3. MongoDB: User kaydı ekle
4. Response: JWT token gönder
5. Frontend: Token'ı localStorage'a kaydet

### Portföy Görüntüleme
1. Frontend: `/dashboard` → Veri talep et
2. Backend: `GET /api/portfolio` → JWT doğrula
3. MongoDB: Portfolio sorgusu
4. Response: Portfolio verisini gönder
5. Frontend: Verileri göster

### İşlem Oluşturma
1. Frontend: Satın al/Sat form → Submit
2. Backend: `POST /api/transaction/create` → Valide et
3. Blockchain: OSMO ağında işlemi imzala (Keplr)
4. MongoDB: İşlem kaydı ekle
5. Response: Tx hash gönder
6. Frontend: Başarı mesajı göster

## Teknoloji Stack'i

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **DB ORM**: Mongoose
- **Auth**: JWT
- **Blockchain**: CosmJS, Web3.js

### Frontend
- **Framework**: Next.js 14
- **UI**: React 18
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **State**: Zustand

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Real-time**: Socket.io
- **Code Quality**: ESLint, Prettier

## Kurulum Adımları

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Ortam değişkenlerini ayarla
cp .env.example .env

# 3. MongoDB'yi başlat
docker-compose up mongodb

# 4. Geliştirme sunucularını başlat
npm run dev

# 5. Tarayıcıda aç
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## Önemli Notlar

- ⚠️ `.env` dosyasını asla git'e commit etme
- 🔒 OSMO cüzdan bağlantısı için Keplr/Leap gerekli
- 💾 MongoDB bağlantısını yapılandır
- 🔑 JWT_SECRET'ı güçlü tutun
- 📊 Binance API anahtarlarını ayarla

## Destek

Sorunuz veya öneriniz için:
- GitHub Issues açın
- Dokumentasyonu kontrol edin
- Geliştirme rehberine bakın
