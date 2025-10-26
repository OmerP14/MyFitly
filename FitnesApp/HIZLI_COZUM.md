# 🚨 HIZLI ÇÖZÜM REHBERİ

## 1. USER TABLOSU BİLGİLERİNİ DOLDURMA

### Supabase'de SQL Çalıştırın:
```sql
-- 1) Mevcut kullanıcıları kontrol edin
SELECT id, email, name, age, height, current_weight, target_weight 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2) Test kullanıcısı için profil bilgilerini doldurun
-- (USER_ID_BURAYA kısmını gerçek kullanıcı ID'si ile değiştirin)
UPDATE users 
SET 
  age = 25,
  height = 175,
  current_weight = 70,
  target_weight = 65,
  body_fat_percentage = 15.5,
  diet_preferences = '{"goal": "weight_loss", "preferred_cuisine": "mediterranean"}',
  allergies = ARRAY['nuts'],
  dietary_restrictions = ARRAY['vegetarian'],
  updated_at = NOW()
WHERE id = 'USER_ID_BURAYA'; -- Gerçek kullanıcı ID'sini yazın
```

### Premium Kullanıcı Kontrolü:
```sql
-- Premium kullanıcıları kontrol edin
SELECT 
  u.id,
  u.email,
  u.name,
  e.is_active,
  e.expires_at,
  CASE 
    WHEN e.is_active = true AND e.expires_at > NOW() 
    THEN 'Premium Aktif' 
    ELSE 'Free Kullanıcı' 
  END as subscription_status
FROM users u
LEFT JOIN entitlements e ON u.id = e.user_id
ORDER BY u.created_at DESC;
```

---

## 2. IAP HATASINI ÇÖZME

### Geçici Çözüm (Şu An Çalışıyor):
✅ **SubscriptionContext güncellendi** - IAP modülü yoksa test modunda çalışıyor
✅ **Test abonelik** - "Test Et" butonu ile manuel abonelik eklenebiliyor

### Kalıcı Çözüm (iOS için):

#### Terminal'de şu komutları çalıştırın:
```bash
# 1) Encoding sorununu çöz
export LANG=en_US.UTF-8

# 2) iOS dizinine git
cd ios

# 3) Pod install yap
pod install

# 4) Geri dön
cd ..
```

#### Eğer hala hata alırsanız:
```bash
# Alternatif çözüm
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Android için:
```bash
# Android için temizlik
npx expo run:android
```

---

## 3. TEST ETME

### Şu An Çalışan Özellikler:
✅ **Diyet ekranı kilitli** (abonelik yoksa)
✅ **Paywall görünüyor**
✅ **Test abonelik** eklenebiliyor
✅ **Reklamlar** abonelik durumuna göre açılıp kapanıyor

### Test Adımları:
1. **Uygulamayı başlatın**: `npx expo start`
2. **Diyet ekranına gidin** - Paywall görmelisiniz
3. **"Pro'yu Aktif Et"** butonuna tıklayın
4. **"Test Et"** butonuna tıklayın (IAP modülü yoksa)
5. **Diyet ekranı açılmalı** ve reklamlar kaybolmalı ✅

---

## 4. PRODUCTION İÇİN YAPILACAKLAR

### iOS:
1. **App Store Connect**'te ürün oluşturun (`fitly.pro.monthly`)
2. **Sandbox tester** ekleyin
3. **Pod install** yapın (encoding sorunu çözülmeli)
4. **TestFlight**'ta test edin

### Android:
1. **Google Play Console**'da ürün oluşturun (`fitly.pro.monthly`)
2. **License testing** ekleyin
3. **Internal testing**'e yükleyin

### Supabase:
1. **17_subscription_system.sql** dosyasını çalıştırın
2. **Gerçek AdMob ID'leri** ekleyin
3. **Server-side validation** ekleyin (opsiyonel)

---

## 🎯 ÖZET

### ✅ Şu An Çalışan:
- Diyet ekranı abonelik kontrolü ile korunuyor
- Test modunda abonelik eklenebiliyor
- Reklamlar abonelik durumuna göre çalışıyor
- Paywall güzel görünüyor

### ⚠️ Yapılması Gereken:
- Supabase SQL dosyasını çalıştırın
- iOS pod install yapın (encoding sorunu çözülmeli)
- App Store Connect / Google Play Console'da ürün oluşturun

### 🧪 Test:
- Diyet ekranına gidin
- Paywall'u görün
- "Test Et" ile abonelik ekleyin
- Diyet ekranı açılsın ✅

---

## 📞 SORUN GİDERME

### "Entitlements table not found"
➡️ Supabase'de SQL dosyasını çalıştırın

### "IAP başlatma hatası"
➡️ Normal - test modunda çalışıyor. Pod install yapın.

### "Test Et butonu çalışmıyor"
➡️ Supabase bağlantısını kontrol edin

### Diyet ekranı açılıyor (abonelik yokken)
➡️ SubscriptionContext doğru çalışmıyor - kodu kontrol edin

---

**SONUÇ**: Sistem çalışıyor! Sadece Supabase SQL'ini çalıştırın ve pod install yapın. 🚀


