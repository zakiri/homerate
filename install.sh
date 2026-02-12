#!/bin/bash

# HomeRate Installation Script

echo "🚀 HomeRate Sentetik Emtia Borsası Kurulumu Başladı..."

# Check Node.js version
if ! command -v node &> /dev/null
then
    echo "❌ Node.js bulunamadı. Lütfen Node.js 18+ yükleyin."
    exit 1
fi

echo "✅ Node.js kurulu: $(node -v)"

# Check npm version
if ! command -v npm &> /dev/null
then
    echo "❌ npm bulunamadı."
    exit 1
fi

echo "✅ npm kurulu: $(npm -v)"

# Install dependencies
echo ""
echo "📦 Bağımlılıklar yükleniyor..."
npm install

# Create .env file
echo ""
echo "⚙️  .env dosyası oluşturuluyor..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env dosyası oluşturuldu. Lütfen düzenleyin."
else
    echo "ℹ️  .env dosyası zaten mevcut."
fi

# Build the project
echo ""
echo "🏗️  Proje derleniyor..."
npm run build

echo ""
echo "✅ Kurulum tamamlandı!"
echo ""
echo "Başlamak için:"
echo "  - Geliştirme: npm run dev"
echo "  - Production: npm run start"
