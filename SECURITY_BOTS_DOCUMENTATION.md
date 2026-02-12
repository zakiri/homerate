# 🔒 HomeRate Güvenlik Botları Sistemi

## Genel Açıklama

HomeRate sentetik emtia borsası, 4 ana güvenlik botu ile korunmaktadır. Bu botlar gerçek zamanlı olarak borsa işlemlerini izleyerek, hack'ler, saldırılar ve kötü niyetli aktiviteleri tespit ve engeller.

---

## 🤖 4 Ana Güvenlik Botu

### 1️⃣ **Anomaly Detection Bot** (Anomali Tespit Botu)
Anormal işlem davranışlarını tespit eden yapay zeka tabanlı bot.

**Tespit Ettiği Tehditler:**
- 🎯 İstatistiksel anomaliler (Z-score > 2.5)
- 🎯 Anormal işlem sıklığı (Saatlik ortalamanın 5 katından fazla)
- 🎯 Yeni symbol kullanımı (Birden fazla sembol kullanımı)
- 🎯 Gece saatleri aktivitesi
- 🎯 Benzer işlem clusterleri (Bot ağı işareti)
- 🎯 Tekrarlayan tutar desenleri

**Risk Seviyeleri:**
```
⭕ LOW (10 puan)
🟡 MEDIUM (25 puan)  
🟠 HIGH (50 puan)
🔴 CRITICAL (100 puan)
```

**API Endpoints:**
- `POST /api/security/bots/anomaly-detection/start` - Botu başlat
- `POST /api/security/bots/anomaly-detection/stop` - Botu durdur
- `GET /api/security/bots/anomaly-detection/stats` - İstatistikleri getir

---

### 2️⃣ **Price Manipulation Bot** (Fiyat Manipülasyonu Tespit Botu)
Piyasa manipülasyonu, pump&dump ve ağ saldırılarını tespit eden bot.

**Tespit Ettiği Tehditler:**
- 💰 **Pump & Dump:** Koordineli hızlı fiyat yükselişi/düşüşü
- 💰 **Wash Trading:** Aynı cüzdandan tekrarlanan işlemler (5+ dakikada)
- 💰 **Volatilite Spiği:** %10'dan fazla hızlı fiyat değişimi
- 💰 **Slippage Manipülasyonu:** Farklı tutarlar için farklı fiyatlandırma
- 💰 **Volume Spike:** Normal hacminin 5 katından fazla işlem

**Algılama Algoritması:**
```javascript
// Pump & Dump tespiti
if (priceRange > 15% && uniqueWallets < expectedCount) {
  ALERT: Pump & Dump Pattern Detected
}

// Wash Trading tespiti
if (sameWallet.transactionsIn(5min) >= 5) {
  ALERT: Wash Trading Detected
}

// Volatilite spiği
if (percentChange > 10% && timeDifference < 30s) {
  ALERT: Price Volatility Spike
}
```

**API Endpoints:**
- `POST /api/security/bots/price-manipulation/start`
- `POST /api/security/bots/price-manipulation/stop`
- `GET /api/security/bots/price-manipulation/stats`

---

### 3️⃣ **Fraud Detection Bot** (Sahtekarl\u0131k/Hırsızlık Botu)
Hesap ele geçirilmesi, yetkisiz erişim ve hırsızlık modellerini tespit eder.

**Tespit Ettiği Tehditler:**
- 🚨 **Brute Force Saldırısı:** 15 dakikada 5+ başarısız giriş
- 🚨 **Yeni Cihaz Girişi:** Bilinmeyen cihaz/IP kombinasyonları
- 🚨 **Şifre Değişimi + İşlem:** Şifre değiştirildikten hemen sonra işlem yapılması
- 🚨 **2FA Devre Dışı:** 2FA kaldırılıp işlem yapılması
- 🚨 **Hızlı Ardışık İşlemler:** 10 saniyede 3+ işlem (Bot işareti)
- 🚨 **Rug Pull Hazırlığı:** Aynı hedefe 1 dakikada 5+ transfer
- 🚨 **Bot Ağı:** Aynı işlem deseni 20+ kez tekrarlanması

**Hesap Ele Geçirilme Tespiti:**
```javascript
if (passwordChanged && transactions > 5 && newDeviceCount >= 2) {
  CRITICAL_ALERT: Account Takeover Suspected
}

if (2FADisabled && transactionsAfter > 3) {
  CRITICAL_ALERT: Account Compromise
}
```

**API Endpoints:**
- `POST /api/security/bots/fraud-detection/start`
- `POST /api/security/bots/fraud-detection/stop`
- `GET /api/security/bots/fraud-detection/stats`

---

### 4️⃣ **DDoS & Attack Prevention Bot** (Saldırı Önleme Botu)
Ağ saldırılarını, injection ve brute force saldırılarını engeller.

**Tespit Ettiği Tehditler:**
- ⚔️ **DDoS Saldırıları:** 1 dakikada 100+ request (IP başına)
- ⚔️ **Endpoint DDoS:** Tek endpoint'e 1 dakikada 30+ request
- ⚔️ **Port Scanner:** Tek IP'den 20+ farklı endpoint taraması
- ⚔️ **SQL Injection:** Kötü amaçlı SQL kodları (`UNION SELECT`, `DROP TABLE`, vb.)
- ⚔️ **XSS Saldırısı:** JavaScript kodu enjeksiyonu (`<script>`, `javascript:`, vb.)
- ⚔️ **Command Injection:** Sistem komut enjeksiyonu
- ⚔️ **Excessive Payload:** Özel karakterler yüzdesinin %20'den fazla olması

**Rate Limiting:**
```
Global Limit: 100 istek/dakika per IP
Endpoint Limit: 30 istek/dakika per endpoint
Block Duration: 1 saat (otomatik kalkış)
```

**IP Blokla Listesi:**
Otomatik olarak şüpheli IP'ler bloklanır ve 1 saat sonra otomatik kaldırılır.

**API Endpoints:**
- `POST /api/security/bots/ddos-protection/start`
- `POST /api/security/bots/ddos-protection/stop`
- `GET /api/security/bots/ddos-protection/stats`
- `GET /api/security/blocked-ips` - Bloklanmış IP'leri getir
- `POST /api/security/unblock-ip` - IP'yi unblock et (Admin)

---

## 📊 Güvenlik Dashboard

### Ana Dashboard
```bash
GET /api/security/dashboard
```

**Döndürülen Bilgiler:**
- Toplam uyarı sayısı ve seviyeleri
- Tüm botların çalışma durumu
- Son 10 uyarı
- Bot istatistikleri

**Örnek Yanıt:**
```json
{
  "totalAlerts": 45,
  "criticalAlerts": 2,
  "highAlerts": 12,
  "mediumAlerts": 18,
  "lowAlerts": 13,
  
  "botStatus": {
    "anomalyDetection": {
      "isRunning": true,
      "stats": {
        "usersMonitored": 28,
        "alertsGenerated": 15
      }
    },
    "priceManipulation": {
      "isRunning": true,
      "stats": {
        "symbolPairsMonitored": 89,
        "alertsGenerated": 12
      }
    },
    "fraudDetection": {
      "isRunning": true,
      "stats": {
        "usersMonitored": 45,
        "fraudAlertsGenerated": 8
      }
    },
    "ddosProtection": {
      "isRunning": true,
      "stats": {
        "blockedIPsCount": 5,
        "totalAttackAlertsGenerated": 10
      }
    }
  },
  
  "recentAlerts": [
    {
      "id": "ALERT_...",
      "type": "PUMP_AND_DUMP_PATTERN",
      "severity": "HIGH",
      "message": "...",
      "timestamp": "2024-02-11T..."
    }
  ],
  
  "lastUpdated": "2024-02-11T..."
}
```

### Uyarıları Getir
```bash
GET /api/security/alerts?limit=100
GET /api/security/alerts/critical (Sadece kritik uyarılar)
```

---

## 🛡️ Entegrasyon

### 1. Otomatik Başlatma
Server başlatıldığında tüm botlar otomatik olarak başlatılır:
```
🚀 Starting Security Bots...
✅ All security bots initialized and running
```

### 2. Transaction Validation (İşlem Doğrulama)
Her new transaction oluşturulduğunda securityMonitoringService tarafından doğrulanır:

```javascript
const securityValidation = await securityMonitoringService.validateTransaction(transaction);

if (!securityValidation.isValid) {
  if (securityValidation.riskScore > 80) {
    // İşlemi reddet
    return res.status(403).json({ error: '...' });
  }
}
```

### 3. DDoS Middleware
Tüm HTTP requestler DDoS prevention bot tarafından kontrol edilir:
```javascript
app.use((req, res, next) => {
  ddosPreventionBot.checkRequest(req, res, next);
});
```

---

## 📈 Performans & Scaling

### Bot Kontrol Aralıkları:
- **Anomaly Detection:** 5 saniyede bir
- **Price Manipulation:** 10 saniyede bir
- **Fraud Detection:** 15 saniyede bir
- **DDoS Prevention:** 10 saniyede bir + gerçek zamanlı

### Hafıza Yönetimi:
- Max 1000 alert'i bellekte tut (eski olanlar otomatik sil)
- Max 100 işlem history per symbol (Saatliklik)
- Max 50 cihaz profile per user

### Veritabanı Sorguları:
- Son N işlemi fetch et (limit karşılaştırması için)
- Indexed queries: userId, walletAddress, fromSymbol, createdAt

---

## 🔧 Admin Komutları

### Botları Yönet
```bash
# Anomaly Detection
curl -X POST http://localhost:5000/api/security/bots/anomaly-detection/start
curl -X POST http://localhost:5000/api/security/bots/anomaly-detection/stop

# Price Manipulation
curl -X POST http://localhost:5000/api/security/bots/price-manipulation/start
curl -X POST http://localhost:5000/api/security/bots/price-manipulation/stop

# Fraud Detection
curl -X POST http://localhost:5000/api/security/bots/fraud-detection/start
curl -X POST http://localhost:5000/api/security/bots/fraud-detection/stop

# DDoS Protection
curl -X POST http://localhost:5000/api/security/bots/ddos-protection/start
curl -X POST http://localhost:5000/api/security/bots/ddos-protection/stop
```

### IP Yönetimi
```bash
# Bloklanmış IP'leri getir
curl http://localhost:5000/api/security/blocked-ips

# IP'yi unblock et
curl -X POST http://localhost:5000/api/security/unblock-ip \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.1"}'
```

### Uyarıları Temizle
```bash
curl -X POST http://localhost:5000/api/security/alerts/clear
```

---

## 📝 Log Örnekleri

### Anomaly Detection
```
⚠️  ANOMALY DETECTED: STATISTICAL_AMOUNT_ANOMALY - Z-score anomalisi: 3.2 (Eşik: 2.5)
⚠️  ANOMALY DETECTED: FREQUENCY_ANOMALY - Anormal işlem sıklığı tespit edildi: 12 işlem son 30 dakikada
```

### Price Manipulation
```
⚠️  PRICE SPIKE: GOLD/USD - 15.50% değişim 12.00s
🚨 PUMP ALERT: BTC/USDT - 9 consecutive upswings
🚨 DUMP ALERT: ETH/USDT - 8 consecutive downswings
🚨 PUMP & DUMP DETECTED: ADA/USDT - 22.50% volatility
```

### Fraud Detection
```
🚨 BRUTE FORCE ATTACK: User 64a... - 5 failed attempts
🚨 ACCOUNT TAKEOVER ALERT: User 64a... changed password and made 8 transactions
🚨 CRITICAL: User 64a... disabled 2FA with active transactions
🚨 BOT NETWORK: Pattern repeated 25 times - GOLD:USD:1000
```

### DDoS Prevention
```
🚫 IP BLOCKED: 192.168.1.100 - Possible DDoS Attack
🚨 DDoS ALERT: IP 192.168.1.101 - 145 requests in 1 minute
🚨 SCANNER ALERT: IP 192.168.1.102 scanning 35 endpoints
✅ IP UNBLOCKED: 192.168.1.100 (after 1 hour block)
```

---

## 🚀 Gelecek İyileştirmeler

- [ ] Machine Learning tabanlı daha akıllı anomali tespiti
- [ ] IP Geolocation kontrolleri
- [ ] Kullanıcı davranış profilleme
- [ ] Wallet risk scoring
- [ ] Blockchain transaction verification
- [ ] Multi-chain support
- [ ] Real-time alerting (Email, SMS, WebSocket)
- [ ] Security events API
- [ ] Audit logging ve compliance reports

---

## 📞 Destek

Security botu ile ilgili sorunlar için:
1. Dashboard'u kontrol et: `/api/security/dashboard`
2. Spesifik bot stats'ını kontrol et: `/api/security/bots/{bot-name}/stats`
3. Son uyarıları kontrol et: `/api/security/alerts`
4. Bloklanmış IP'leri kontrol et: `/api/security/blocked-ips`

---

**Last Updated:** 11 Şubat 2026
**Bot System Version:** 1.0.0
**Security Level:** 🟢 MAXIMUM
