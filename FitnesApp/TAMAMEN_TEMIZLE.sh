#!/bin/bash

# Uygulamayı tamamen temizle ve yeniden başlat

echo "🧹 Uygulama temizleniyor..."

cd /Users/omerpehriz/Desktop/Project/FitnesApp

# 1. Expo cache'i temizle
rm -rf .expo .expo-shared node_modules/.cache

# 2. Metro bundler cache'i temizle
watchman watch-del-all 2>/dev/null || true

# 3. iOS Simulator cache'i temizle (eğer iOS kullanıyorsan)
xcrun simctl erase all 2>/dev/null || true

# 4. Yeniden başlat
echo "✅ Temizlik tamamlandı!"
echo "🚀 Şimdi şunu çalıştır: npx expo start -c"

