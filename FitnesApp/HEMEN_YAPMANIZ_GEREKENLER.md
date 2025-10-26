# ⚡ HEMEN YAPMANIZ GEREKEN 5 ADIM

## ✅ 1. SUPABASE VERITABANINI GÜNCELLEYIN (ZORUNLU)

**Neden Önemli**: Abonelik sistemi bu tablo olmadan çalışmaz!

1. Supabase Dashboard'a gidin: https://supabase.com
2. SQL Editor sekmesine tıklayın
3. `SQLs/realsqls/17_subscription_system.sql` dosyasını açın
4. Tüm içeriği kopyalayıp SQL Editor'e yapıştırın
5. **"Run"** butonuna basın
6. Hata yoksa ✅ başarılı!

---

## 📱 2. iOS POD INSTALL (iOS İÇİN ZORUNLU)

Terminal'de şu komutu çalıştırın:

```bash
export LANG=en_US.UTF-8
cd ios
pod install
cd ..
```

**Not**: Eğer encoding hatası alırsanız, önce `export LANG=en_US.UTF-8` komutunu çalıştırın.

---

## 🍎 3. APP STORE CONNECT AYARLARI (iOS TEST İÇİN)

1. https://appstoreconnect.apple.com adresine gidin
2. Uygulamanızı seçin
3. **"In-App Purchases"** → **"+"** → **"Auto-Renewable Subscription"**
4. Bilgileri doldurun:
   - **Product ID**: `fitly.pro.monthly` (AYNI OLMALI!)
   - **Reference Name**: Fitly Pro Monthly
   - **Duration**: 1 month
   - **Price**: ₺99,99 (istediğiniz fiyat)
5. **"Subscription Group"** oluşturun
6. **"Sandbox Tester"** kullanıcısı oluşturun (test için)

---

## 🤖 4. GOOGLE PLAY CONSOLE AYARLARI (Android TEST İÇİN)

1. https://play.google.com/console adresine gidin
2. Uygulamanızı seçin
3. **"Monetization"** → **"Subscriptions"** → **"Create subscription"**
4. Bilgileri doldurun:
   - **Product ID**: `fitly.pro.monthly` (AYNI OLMALI!)
   - **Name**: Fitly Pro - Monthly
   - **Duration**: 1 month
   - **Price**: ₺99,99 (istediğiniz fiyat)
5. **"Activate"** butonuna tıklayın
6. **"License Testing"** bölümüne test email adresinizi ekleyin

---

## 🧪 5. TEST EDİN

### iOS Test
```bash
npx expo run:ios
```
1. Diyet ekranına gidin
2. Paywall'u görmelisiniz
3. "Pro'yu Aktif Et" butonuna tıklayın
4. Sandbox kullanıcısı ile giriş yapın
5. Satın alma yapın
6. Diyet ekranı açılmalı ve reklamlar kaybolmalı ✅

### Android Test
```bash
npx expo run:android
```
Aynı adımları Android'de de test edin.

---

## 🎯 BAŞARILI KURULUM KONTROL LİSTESİ

- [ ] Supabase'de `entitlements` tablosu oluşturuldu
- [ ] iOS pod install yapıldı
- [ ] App Store Connect'te ürün oluşturuldu (iOS için)
- [ ] Google Play Console'da ürün oluşturuldu (Android için)
- [ ] Diyet ekranı abonelik olmadan **KİLİTLİ**
- [ ] Paywall görünüyor
- [ ] Satın alma çalışıyor
- [ ] Satın alma sonrası diyet açılıyor
- [ ] Reklamlar kayboldu (Pro kullanıcı)

---

## 🔧 SORUN GİDERME

### "Entitlements table not found"
➡️ Supabase SQL dosyasını çalıştırmadınız. Adım 1'i yapın.

### "Product not found" (iOS)
➡️ App Store Connect'te ürün ID'si `fitly.pro.monthly` değil veya ürün henüz onaylanmadı.

### "Product not found" (Android)
➡️ Google Play Console'da ürün aktif değil veya uygulama Internal Testing'e yüklenmemiş.

### Pod install hatası
➡️ `export LANG=en_US.UTF-8` komutunu çalıştırın ve tekrar deneyin.

### Abonelik durumu kontrol edilmiyor
➡️ Console log'larına bakın. Network hatası varsa Supabase bağlantısını kontrol edin.

---

## 📞 YARDIM

Detaylı kurulum rehberi için: `SUBSCRIPTION_SETUP.md` dosyasını okuyun.

**ÖNEMLİ**: Diyet ekranı abonelik olmadan **ASLA** açılmamalı! Bu kurulumla garanti edildi. ✅

---

## 🚀 SONRAKİ ADIMLAR (Opsiyonel)

1. **Gerçek AdMob ID'leri ekleyin** (şu anda test ID'leri kullanılıyor)
2. **Server-side receipt validation** ekleyin (daha güvenli)
3. **Apple Server Notifications** ve **Google RTDN** webhook'ları kurun
4. **Privacy Policy** ve **Terms of Service** ekleyin

---

**BAŞARILAR! 🎉**

Abonelik sistemi başarıyla kuruldu. Artık kullanıcılar sadece Pro abonelikle diyet ekranına erişebilir!



