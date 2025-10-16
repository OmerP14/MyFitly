# 📱 AdMob Reklam Kurulum Rehberi

## ⚠️ ÖNEMLİ: Expo Go'da Reklamlar Çalışmaz!

AdMob reklamları için **Development Build** veya **Standalone Build** yapmalısınız.

---

## 🎯 Seçenek 1: Development Build (Önerilen - Test için)

Development Build, Expo Go gibi ama kendi native kodunuzu içerir.

### Adım 1: EAS CLI Yükle

```bash
npm install -g eas-cli
```

### Adım 2: EAS Login

```bash
eas login
```

### Adım 3: Development Build Oluştur

**Android için:**
```bash
cd FitnesApp
eas build --profile development --platform android
```

**iOS için (Mac gerekli):**
```bash
eas build --profile development --platform ios
```

### Adım 4: APK/IPA İndir ve Yükle

Build tamamlandığında:
1. EAS Dashboard'dan APK/IPA dosyasını indirin
2. Android: APK'yı telefonunuza yükleyin
3. iOS: TestFlight üzerinden yükleyin

### Adım 5: Uygulamayı Çalıştır

```bash
npx expo start --dev-client
```

**Development Build üzerinde:**
1. QR kodu Expo Go değil, kendi build'inizle okutun
2. Artık reklamlar çalışacak! 🎉

---

## 🚀 Seçenek 2: Production Build (Gerçek yayın için)

### Android (APK/AAB)

```bash
eas build --profile production --platform android
```

### iOS (IPA)

```bash
eas build --profile production --platform ios
```

---

## 🧪 Test Modu Nasıl Çalışır?

Şu anki kodunuz Expo Go'da test modu sunuyor:

```javascript
// useRewardedAd.js - satır 171-187
if (!adLoaded && !adLoading) {
  Alert.alert(
    '📱 Development Mod',
    'AdMob reklamları sadece production build\'de çalışır.\n\n' +
    'Test için bu butona tıklamaya devam edebilirsin - ödül direkt verilecek! 🎁'
  );
  return;
}
```

Bu sayede:
- ✅ Expo Go'da test edebilirsiniz
- ✅ Reklam akışını görebilirsiniz
- ❌ Ancak gerçek reklamlar göremezsiniz

---

## 📝 app.json Kontrol

AdMob ayarlarınız zaten doğru şekilde yapılmış:

```json
{
  "plugins": [
    [
      "react-native-google-mobile-ads",
      {
        "androidAppId": "ca-app-pub-3940256099942544~3347511713",
        "iosAppId": "ca-app-pub-3940256099942544~1458002511"
      }
    ]
  ]
}
```

**⚠️ DİKKAT:** Şu an TEST ID'leri kullanıyorsunuz!

---

## 🔑 Gerçek AdMob ID'leri Alma

### 1. Google AdMob Hesabı Oluştur

https://admob.google.com/

### 2. Uygulama Ekle

1. "Apps" → "Add App"
2. Platform seç (Android/iOS)
3. Uygulama adı: "FitnesApp"

### 3. Ad Unit Oluştur

1. "Ad units" → "Get started"
2. Format: "Rewarded"
3. Ad unit adı: "Ödüllü Reklam"

### 4. ID'leri Kopyala

**App ID:**
- Android: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`
- iOS: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`

**Ad Unit ID:**
- Rewarded: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`

### 5. Kodda Değiştir

**app.json:**
```json
{
  "plugins": [
    [
      "react-native-google-mobile-ads",
      {
        "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
        "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
      }
    ]
  ]
}
```

**useRewardedAd.js (satır 17):**
```javascript
// Test ID'sini gerçek ID ile değiştir
const adUnitId = __DEV__ 
  ? TestIds?.REWARDED  // Development'ta test ID
  : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'; // Production'da gerçek ID
```

---

## 🏗️ EAS Build Profilleri

`eas.json` dosyası oluşturun:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

---

## 📊 Build Süresi

| Build Tipi | Süre | Kullanım |
|------------|------|----------|
| Development | 10-15dk | Test için, native kod değişikliklerinde |
| Preview | 15-20dk | Internal test |
| Production | 20-30dk | Play Store/App Store yayını |

---

## 🐛 Sorun Giderme

### Hata: "eas: command not found"

```bash
npm install -g eas-cli
```

### Hata: "No EAS project ID found"

```bash
eas build:configure
```

### Hata: "Ad failed to load"

1. İnternet bağlantısını kontrol edin
2. AdMob hesabı onaylandı mı? (24 saat sürebilir)
3. Test ID kullanıyorsanız değiştirin

---

## ✅ Özet

1. **Expo Go'da:** Test modu (gerçek reklam yok)
2. **Development Build:** Gerçek reklamlar çalışır
3. **Production Build:** App Store/Play Store için

**Development Build yapmadan reklamları test edemezsiniz!**

---

## 📞 Yardım

Build yaparken sorun yaşarsanız:

```bash
# Build loglarını kontrol edin
eas build:list

# Build detaylarını görün
eas build:view BUILD_ID
```

---

## 🎉 Başarı!

Development Build yaptıktan sonra:
1. APK'yı telefonunuza yükleyin
2. `npx expo start --dev-client` ile çalıştırın
3. Motivasyon ekranında "Reklamı İzle" butonuna basın
4. Gerçek AdMob reklamları göreceksiniz! 🎬



