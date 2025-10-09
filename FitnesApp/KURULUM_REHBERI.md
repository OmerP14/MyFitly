# 🚀 FİTNESS APP KURULUM REHBERİ

## 📋 Yapman Gerekenler (Adım Adım)

### 1️⃣ SUPABASE PROJESİ OLUŞTUR

1. **Supabase'e Git**
   - [https://supabase.com](https://supabase.com) adresine git
   - Hesabın yoksa kayıt ol (GitHub ile giriş yapabilirsin)

2. **Yeni Proje Oluştur**
   - Dashboard'da "New Project" butonuna tıkla
   - Proje adı: `fitness-app` (veya istediğin isim)
   - Database şifresi: Güçlü bir şifre belirle (KAYDET BU ŞİFREYİ!)
   - Region: `Europe (Frankfurt)` seç (en yakın bölge)
   - "Create new project" tıkla
   - ⏳ 2-3 dakika bekle (proje oluşturuluyor)

---

### 2️⃣ AUTHENTICATION AYARLARI

1. **Authentication'ı Aktif Et**
   - Sol menüden **Authentication** → **Providers** tıkla
   - **Email** provider'ı bul
   - **Enable Email provider** toggle'ını AÇ ✅
   - **Confirm email** seçeneğini KAPAT ❌ (test için)
   - "Save" butonuna tıkla

2. **Site URL Ayarla** (opsiyonel, local test için gerekmiyor)
   - Authentication → URL Configuration
   - Site URL: `http://localhost:19000` (Expo default)

---

### 3️⃣ SQL KOMUTLARINI ÇALIŞTIR

1. **SQL Editor'ü Aç**
   - Sol menüden **SQL Editor** tıkla
   - "New query" butonuna tıkla

2. **SQL Dosyasını Kopyala**
   - Proje klasöründeki `SUPABASE_SQL_COMMANDS.sql` dosyasını aç
   - **TÜM İÇERİĞİ KOPYALA** (Ctrl+A → Ctrl+C)

3. **SQL'i Çalıştır**
   - Supabase SQL Editor'e yapıştır (Ctrl+V)
   - Sağ üstteki **"Run"** butonuna tıkla
   - ✅ "Success" mesajını göreceksin

4. **Tabloları Kontrol Et**
   - Sol menüden **Table Editor** tıkla
   - Şu tabloları göreceksin:
     - ✅ users
     - ✅ exercises
     - ✅ workout_programs
     - ✅ workout_sessions
     - ✅ weight_tracking
     - ✅ strength_tracking
     - ✅ motivation_quotes
     - ✅ user_favorite_quotes

---

### 4️⃣ API ANAHTARLARINI AL

1. **Project Settings'e Git**
   - Sol menüden en altta **Settings (⚙️)** tıkla
   - **API** sekmesine tıkla

2. **Anahtarları Kopyala**
   - **Project URL**: `https://xxxxx.supabase.co` gibi bir URL
   - **anon public key**: `eyJhbG...` gibi uzun bir key

   📋 **Bu iki değeri bir yere not et!**

---

### 5️⃣ REACT NATIVE UYGULAMASINI YAPILANDIR

1. **Supabase Config Dosyasını Aç**
   ```bash
   # Proje klasöründe:
   FitnesApp/src/config/supabase.js
   ```

2. **Anahtarları Yapıştır**
   - Dosyayı aç
   - `supabaseUrl` yerine **Project URL**'ini yapıştır
   - `supabaseKey` yerine **anon public key**'ini yapıştır

   **Örnek:**
   ```javascript
   const supabaseUrl = 'https://xxxxxxxxxx.supabase.co';
   const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

3. **Dosyayı Kaydet** (Ctrl+S / Cmd+S)

---

### 6️⃣ UYGULAMAYI ÇALIŞTIR

1. **Terminalde:**
   ```bash
   cd /Users/omerpehriz/Desktop/Project/FitnesApp
   npm start
   ```

2. **Expo Developer Tools açılacak**
   - Telefonunda Expo Go uygulamasını aç
   - QR kodu tara
   - Veya emulator kullan

---

## 🎯 İLK KULLANIM

### Kayıt Ol
1. Uygulama açılınca **"Kayıt Ol"** butonuna tıkla
2. Bilgilerini gir:
   - Ad Soyad
   - E-posta
   - Şifre (minimum 6 karakter)
   - Şifre tekrar
3. **"Kayıt Ol"** tıkla

### Profili Tamamla
1. Zorunlu bilgileri gir:
   - Adın
   - Yaşın
   - Boyun (cm)
   - Mevcut kilom (kg)
   - Hedef kilom (kg)
2. **"Başlayalım! 🚀"** tıkla

### Hazırsın! 🎉
- Ana ekran açılacak
- Program oluşturabilirsin
- Egzersiz ekleyebilirsin
- Kilo takibi yapabilirsin

---

## ⚙️ SUPABASE CONFIG DOSYASI

Şu dosyayı kontrol et ve güncelle:

```javascript
// FitnesApp/src/config/supabase.js

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⬇️ BURAYA SUPABASE BİLGİLERİNİ YAZ
const supabaseUrl = 'BURAYA_PROJECT_URL_YAZ';  // Örn: https://xxxxx.supabase.co
const supabaseKey = 'BURAYA_ANON_KEY_YAZ';     // Örn: eyJhbGciOiJIUzI...

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## 🔍 TEST ET

### Kayıt ve Giriş Testi
```
1. Uygulamayı aç
2. Kayıt ol (örn: test@example.com / 123456)
3. Profili doldur
4. Ana ekrana git
5. Profil → Çıkış Yap
6. Tekrar giriş yap (aynı mail ve şifre)
7. ✅ Veriler gelmeli!
```

### Veri Testi
```
1. Program sekmesine git
2. Egzersiz ekle
3. Ana ekrana dön
4. ✅ "Bugünkü Antrenman"da görünmeli
```

### Supabase Dashboard'da Kontrol
```
1. Supabase → Table Editor → users
2. ✅ Kaydolduğun kullanıcıyı göreceksin
3. Exercises tablosuna bak
4. ✅ Eklediğin egzersizleri göreceksin
```

---

## 🚨 SORUN ÇÖZME

### "Invalid API key" Hatası
- ✅ supabase.js dosyasındaki URL ve Key'i kontrol et
- ✅ Tırnak işaretlerini kontrol et
- ✅ Boşluk veya fazladan karakter var mı bak

### "Invalid login credentials" Hatası
- ✅ Email ve şifreyi doğru girdiğinden emin ol
- ✅ Önce kayıt ol, sonra giriş yap

### "Table does not exist" Hatası
- ✅ SQL komutlarını çalıştırdın mı?
- ✅ Supabase → Table Editor'de tabloları gör

### "Auth session missing" Hatası
- ✅ Authentication Provider'ı aktif et
- ✅ Email provider enabled olmalı

---

## 📱 PAKET KURULUMU

Eğer package hataları alıyorsan:

```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

---

## 🎊 TAMAMDIR!

Artık fitness uygulamanı kullanabilirsin! 

**Özellikler:**
- ✅ Giriş/Kayıt sistemi
- ✅ Profil yönetimi
- ✅ Egzersiz programları
- ✅ Kilo takibi
- ✅ Güç takibi
- ✅ Motivasyon sözleri
- ✅ Tüm veriler cloud'da güvenle saklanıyor

**Sorular:**
- Discord: [supabase.com/discord](https://supabase.com/discord)
- Docs: [supabase.com/docs](https://supabase.com/docs)

---

## 📊 VERİ YEDEĞİ

Supabase otomatik yedekleme yapıyor ama yine de:

**Manuel Yedek Almak İçin:**
1. Supabase → Database → Backups
2. "Create backup" tıkla

**Veriyi İndirmek İçin:**
1. Table Editor → users (veya herhangi bir tablo)
2. Sağ üstte "..." → Download as CSV

Kolay gelsin! 🚀💪

