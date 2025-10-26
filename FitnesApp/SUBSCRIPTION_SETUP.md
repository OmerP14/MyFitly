# ABONELİK SİSTEMİ KURULUM REHBERİ

## ✅ TAMAMLANAN İŞLEMLER

### 1. Paket Kurulumu
- ✅ `react-native-iap` paketi kuruldu
- ✅ Native modüller yüklendi

### 2. Veritabanı
- ✅ `SQLs/realsqls/17_subscription_system.sql` dosyası oluşturuldu
- ❗ **SUPABASE'DE ÇALIŞTIRIN**: SQL dosyasını Supabase Dashboard > SQL Editor'de çalıştırmanız gerekiyor
- Tablo: `entitlements` (abonelik durumları)
- View: `entitlements_effective` (otomatik süre kontrolü)

### 3. Kod Yapısı
- ✅ `SubscriptionContext` oluşturuldu (abonelik yönetimi)
- ✅ `Paywall` componenti oluşturuldu
- ✅ `DietScreen` abonelik kontrolü ile korundu
- ✅ `AdService` abonelik durumuna göre güncellendi
- ✅ `App.js` SubscriptionProvider ile sarmalandı

### 4. Platform Yapılandırması
- ✅ Android: `BILLING` izni eklendi
- ✅ iOS: Info.plist hazır (ek yapılandırma gerekebilir)

---

## ⚠️ YAPMANIZ GEREKEN İŞLEMLER

### 1. SUPABASE VERITABANINI GÜNCELLEYIN
```bash
# Dosya: SQLs/realsqls/17_subscription_system.sql
# Bu dosyayı Supabase Dashboard'dan çalıştırın:
# 1. Supabase Dashboard'a gidin
# 2. SQL Editor sekmesine tıklayın
# 3. 17_subscription_system.sql dosyasının içeriğini kopyalayıp yapıştırın
# 4. "Run" butonuna basın
```

### 2. iOS PODFILE GÜNCELLEMESİ
```bash
cd ios
pod install
cd ..
```

### 3. APP STORE CONNECT AYARLARI (iOS)

#### a) App Store Connect'te Abonelik Ürünü Oluşturun
1. https://appstoreconnect.apple.com adresine gidin
2. "My Apps" > Uygulamanızı seçin
3. "In-App Purchases" sekmesine gidin
4. "+" butonuna tıklayıp "Auto-Renewable Subscription" seçin
5. Bilgileri doldurun:
   - **Product ID**: `fitly.pro.monthly`
   - **Reference Name**: Fitly Pro Monthly
   - **Subscription Duration**: 1 month
   - **Price**: İstediğiniz fiyat (örn: ₺99,99)

#### b) Subscription Group Oluşturun
1. "Subscription Groups" sekmesine gidin
2. Yeni grup oluşturun (örn: "Fitly Pro")
3. Oluşturduğunuz ürünü bu gruba ekleyin

#### c) Sandbox Test Kullanıcısı Oluşturun
1. App Store Connect > "Users and Access" > "Sandbox Testers"
2. "+" butonuna tıklayıp test kullanıcısı oluşturun
3. Bu kullanıcıyı iPhone'da test için kullanın

### 4. GOOGLE PLAY CONSOLE AYARLARI (Android)

#### a) Google Play Console'da Abonelik Ürünü Oluşturun
1. https://play.google.com/console adresine gidin
2. Uygulamanızı seçin
3. "Monetization" > "In-app products" > "Subscriptions"
4. "Create subscription" butonuna tıklayın
5. Bilgileri doldurun:
   - **Product ID**: `fitly.pro.monthly`
   - **Name**: Fitly Pro - Monthly
   - **Duration**: 1 month
   - **Price**: İstediğiniz fiyat (örn: ₺99,99)
6. "Save" ve "Activate" butonlarına tıklayın

#### b) Licensing ve Testing
1. "Setup" > "License Testing" bölümüne gidin
2. Test email adresinizi ekleyin
3. "License test response": "RESPOND_NORMALLY" seçin

### 5. ÜRÜN ID'LERİNİ KONTROL EDİN

`src/context/SubscriptionContext.js` dosyasını açın ve ürün ID'lerini kontrol edin:

```javascript
const PRODUCT_IDS = Platform.select({
  ios: ['fitly.pro.monthly'],
  android: ['fitly.pro.monthly'],
});
```

**ÖNEMLİ**: Bu ID'ler App Store Connect ve Google Play Console'da oluşturduğunuz ID'lerle **TAM OLARAK AYNI** olmalı!

### 6. REKLAM ID'LERİNİ GÜNCELLEYİN (Opsiyonel)

`src/services/adService.js` dosyasını açın ve gerçek reklam ID'lerinizi ekleyin:

```javascript
const AD_UNIT_IDS = {
  // Şu anda test ID'leri kullanılıyor
  // Gerçek ID'ler için yorumları kaldırın ve kendi ID'lerinizi girin
  BANNER: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  INTERSTITIAL: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  REWARDED: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
};
```

iOS Info.plist ve Android AndroidManifest.xml'deki AdMob ID'lerini de güncelleyin.

---

## 🧪 TEST ETME

### iOS Test (Sandbox)
1. iPhone'u bilgisayara bağlayın
2. Xcode'u açın: `open ios/FitnesApp.xcworkspace`
3. Sandbox test kullanıcısı ile cihazdan çıkış yapın
4. Uygulamayı çalıştırın
5. Diyet ekranına gidin
6. "Pro'yu Aktif Et" butonuna tıklayın
7. Sandbox kullanıcısı ile giriş yapın
8. Satın alma işlemini tamamlayın

### Android Test (License Testing)
1. Android cihazı bilgisayara bağlayın
2. Test email adresinizle Google Play'e giriş yapın
3. Uygulamayı çalıştırın: `npx expo run:android`
4. Diyet ekranına gidin
5. "Pro'yu Aktif Et" butonuna tıklayın
6. Satın alma işlemini tamamlayın

### Test Kontrol Listesi
- [ ] Uygulama başlatıldığında abonelik durumu kontrol ediliyor
- [ ] Abonelik yoksa Diyet ekranı kilitli
- [ ] Paywall gösteriliyor
- [ ] Satın alma işlemi çalışıyor
- [ ] Satın alma sonrası Diyet ekranı açılıyor
- [ ] Reklamlar kayboldu (Pro kullanıcı için)
- [ ] "Satın Almaları Geri Yükle" çalışıyor
- [ ] Abonelik süresi dolunca Diyet kilitleniyor
- [ ] Reklamlar geri geliyor (süre bitince)

---

## 🔧 SORUN GİDERME

### Abonelik Durumu Kontrol Edilmiyor
- Supabase SQL dosyasının çalıştırıldığından emin olun
- Supabase connection bilgilerini kontrol edin
- Console log'larda hata mesajlarını kontrol edin

### Satın Alma Çalışmıyor (iOS)
- App Store Connect'te ürün ID'sinin doğru olduğundan emin olun
- Sandbox test kullanıcısı ile giriş yaptığınızdan emin olun
- Xcode'da "Signing & Capabilities" > "In-App Purchase" capability'si eklenmiş mi kontrol edin

### Satın Alma Çalışmıyor (Android)
- Google Play Console'da ürün ID'sinin doğru olduğundan emin olun
- License tester email adresinizin eklendiğinden emin olun
- Uygulamanın en az bir kere "Internal Testing" track'ine yüklenmiş olması gerekiyor

### Reklamlar Hala Görünüyor (Pro Kullanıcı)
- `AdBanner` componentinde `isPro` prop'unun geçildiğinden emin olun
- Dashboard ve diğer ekranlarda AdBanner kullanımını güncelleyin:
  ```javascript
  import { useSubscription } from '../context/SubscriptionContext';
  const { isPro } = useSubscription();
  
  <AdBanner isPro={isPro} />
  ```

---

## 📱 PRODUCTION'A ALMA

### iOS Production Checklist
- [ ] App Store Connect'te ürünler onaylandı
- [ ] Gerçek AdMob ID'leri eklendi
- [ ] Privacy Policy ve Terms linki eklendi
- [ ] "In-App Purchase" capability Xcode'da eklendi
- [ ] TestFlight'ta test edildi

### Android Production Checklist
- [ ] Google Play Console'da ürünler aktif
- [ ] Gerçek AdMob ID'leri eklendi
- [ ] Privacy Policy ve Terms linki eklendi
- [ ] BILLING izni AndroidManifest.xml'de
- [ ] Internal Testing'de test edildi

### Server-Side Receipt Validation (İsteğe Bağlı - Önerilen)

Daha güvenli bir sistem için sunucu taraflı makbuz doğrulaması ekleyebilirsiniz:

1. Backend endpoint oluşturun (Node.js örneği):
   ```javascript
   // POST /api/iap/verify
   async function verifyPurchase(req, res) {
     const { userId, platform, receipt } = req.body;
     
     // Apple/Google API ile doğrula
     const verified = await verifyWithStore(platform, receipt);
     
     if (verified) {
       // Supabase'e kaydet
       await supabase.from('entitlements').upsert({
         user_id: userId,
         is_active: true,
         expires_at: verified.expiresAt,
       });
     }
     
     res.json({ success: verified.success });
   }
   ```

2. `SubscriptionContext.js` içinde `verifyPurchase` fonksiyonunu backend'e bağlayın.

---

## 📞 DESTEK

Sorun yaşarsanız:
1. Console log'ları kontrol edin
2. Supabase Dashboard'da table'ları kontrol edin
3. App Store Connect / Google Play Console'da ürün durumlarını kontrol edin
4. Test kullanıcıları ile giriş yaptığınızdan emin olun

---

## 🎯 ÖZETİN ÖZETİ

1. **Supabase**: `17_subscription_system.sql` dosyasını çalıştırın
2. **iOS Pod**: `cd ios && pod install`
3. **App Store Connect**: `fitly.pro.monthly` ürünü oluşturun
4. **Google Play Console**: `fitly.pro.monthly` ürünü oluşturun
5. **Test**: Sandbox/License Testing ile test edin
6. **Production**: Gerçek ID'leri güncelleyin ve yayınlayın

---

## 🔐 GÜVENLİK NOTLARI

- ✅ Abonelik durumu veritabanında saklanıyor
- ✅ Row Level Security (RLS) aktif
- ✅ Kullanıcılar sadece kendi aboneliklerini görebilir
- ⚠️ Server-side validation eklemek daha güvenli (opsiyonel)
- ⚠️ Receipt doğrulaması client-side yapılıyor (temel güvenlik)

---

**SON KONTROL**: Diyet ekranı abonelik olmadan **ASLA** açılmamalı! ✅



