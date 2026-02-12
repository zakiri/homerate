# Geliştirme Rehberi

## Proje Başlama

### 1. Geliştirme Ortamı Kurulumu

```bash
# Depoyu klonla
git clone https://github.com/zakiri/homerate.git
cd homerate

# Bağımlılıkları yükle
npm install

# Ortam dosyasını oluştur
cp .env.example .env
```

### 2. Ortam Değişkenlerini Ayarla

`.env` dosyasında şunları kaydet:

```env
MONGODB_URI=mongodb://localhost:27017/homerate
JWT_SECRET=your-development-secret-key
REACT_APP_OSMO_RPC_URL=https://rpc.osmosis.zone
REACT_APP_OSMO_REST_URL=https://lcd.osmosis.zone
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### 3. Geliştirme Sunucularını Başlat

```bash
# Backend ve Frontend'i aynı anda başlat
npm run dev

# Veya ayrı ayrı
npm run dev:backend   # Terminal 1 - Port 5000
npm run dev:frontend  # Terminal 2 - Port 3000
```

## Proje Yapısı

```
src/
├── backend/
│   ├── index.js                 # Ana server dosyası
│   ├── models/                  # MongoDB şemaları
│   ├── controllers/             # İş mantığı
│   ├── routes/                  # API rotaları
│   ├── middleware/              # Express middleware
│   ├── services/                # Harici servis entegrasyonları
│   ├── config/                  # Yapılandırma ayarları
│   ├── utils/                   # Yardımcı fonksiyonlar
│   └── migrations/              # Veritabanı göçleri
└── frontend/
    ├── pages/                   # Route sayfaları
    ├── components/              # React bileşenleri
    ├── hooks/                   # Custom React hooks
    ├── utils/                   # Yardımcı fonksiyonlar
    └── styles/                  # CSS dosyaları
```

## Kodlama Standartları

### JavaScript/React

```javascript
// ✅ Doğru
const getUserById = (id) => {
  return User.findById(id);
};

// ❌ Yanlış
function GetUserById(id){
return User.findById(id)
}
```

### Adlandırma Kuralları

- **Değişkenler**: camelCase
  ```javascript
  const userName = 'John';
  const userEmail = 'john@example.com';
  ```

- **Sabitler**: UPPER_SNAKE_CASE
  ```javascript
  const MAX_USERS = 100;
  const API_TIMEOUT = 5000;
  ```

- **Sınıflar/Komponentler**: PascalCase
  ```javascript
  class UserService {}
  function UserCard() {}
  ```

- **Dosyalar**: kebab-case (bileşenler) veya camelCase (diğer)
  ```
  src/components/user-card.js
  src/utils/helpers.js
  src/controllers/userController.js
  ```

## Backend Geliştirme

### Yeni API Endpoint Ekleme

1. **Model Oluştur** (`src/backend/models/`)
2. **Controller Oluştur** (`src/backend/controllers/`)
3. **Route Tanımla** (`src/backend/routes/`)
4. **Ana Sunucuya Ekle** (`src/backend/index.js`)

Örnek:

```javascript
// 1. Model
const schema = new mongoose.Schema({ ... });
export default mongoose.model('Item', schema);

// 2. Controller
export const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Route
const router = express.Router();
router.get('/:id', getItem);
export default router;

// 4. Main server
import itemRoutes from './routes/items.js';
app.use('/api/items', itemRoutes);
```

### Middleware Oluşturma

```javascript
// src/backend/middleware/customMiddleware.js
export const myMiddleware = (req, res, next) => {
  // İşlem yap
  console.log('Request:', req.method, req.path);
  next();
};

// Ana sunucuda kullan
app.use(myMiddleware);
```

## Frontend Geliştirme

### Yeni Sayfa Ekleme

Next.js `pages/` klasörünü kullanır:

```javascript
// src/frontend/pages/mypage.js
export default function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
    </div>
  );
}
```

URL: `http://localhost:3000/mypage`

### Custom Hook Oluşturma

```javascript
// src/frontend/hooks/useFetch.js
import { useState, useEffect } from 'react';

export const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
};
```

## Hata Yönetimi

### Backend

```javascript
// Good practice
try {
  const item = await Item.findById(id);
  if (!item) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(item);
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Server error' });
}
```

### Frontend

```javascript
try {
  const response = await fetch('/api/items');
  if (!response.ok) {
    throw new Error('Network error');
  }
  const data = await response.json();
  setItems(data);
} catch (error) {
  console.error('Error:', error);
  setError('Failed to fetch items');
}
```

## Testing

```bash
# Jest testleri
npm run test

# Belirli dosya
npm run test -- authController.test.js

# Coverage raporu
npm run test -- --coverage
```

## Git Workflow

```bash
# Yeni feature branch
git checkout -b feature/new-feature

# Değişiklikleri ekle
git add .

# Commit yap
git commit -m "Add: New feature description"

# Push yap
git push origin feature/new-feature

# Pull request aç
# GitHub'da PR oluştur ve birleştir
```

### Commit Mesajları

```
Add: Yeni özellik ekledim
Fix: Hatasını düzelttim
Refactor: Kodu düzenledim
Docs: Dokümantasyon güncelledim
Style: Kod stilini düzelttim
Test: Test ekleme/güncelledim
```

## Performance Optimizasyonu

### Frontend

```javascript
// Memoization kullan
import { memo } from 'react';

const UserCard = memo(({ user }) => {
  return <div>{user.name}</div>;
});

// Lazy loading
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <p>Loading...</p>
});
```

### Backend

```javascript
// Index oluştur
const schema = new mongoose.Schema({
  email: { type: String, index: true },
  userId: { type: ObjectId, index: true }
});

// Pagination
const page = parseInt(req.query.page) || 1;
const limit = 20;
const items = await Item.find()
  .limit(limit)
  .skip((page - 1) * limit);
```

## Debugging

### Backend

```bash
# Node debugger
node --inspect src/backend/index.js

# VSCode launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/backend/index.js",
      "restart": true,
      "console": "integratedTerminal"
    }
  ]
}
```

### Frontend

```javascript
// Console
console.log('Debug:', value);
console.error('Error:', error);
console.table(data);

// React DevTools Chrome extension
// Redux DevTools Chrome extension
```

## Deployment

```bash
# Production build
npm run build

# Start production
npm run start

# Docker
docker build -t homerate .
docker run -p 3000:3000 homerate
```

## Kaynaklar

- [Express.js Docs](https://expressjs.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://docs.mongodb.com/)
- [CosmJS Docs](https://docs.cosmjs.readonly.zone/)
- [Osmosis Chain](https://osmosis.zone/)
