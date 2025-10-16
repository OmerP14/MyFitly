# ✅ DOĞRU KULLANIM REHBERİ

## ⚠️ Karışıklığın Sebebi

Uygulamada **2 farklı yer**de "hazır program" kelimesi geçiyor:

### 1️⃣ **Program Sekmesi** → "📅 Aylık" Butonu
- ❌ Bu buton **ÇALIŞMIYOR!** (Sadece görüntü)
- Bu eski bir özelliktir, şimdilik kullanmayın
- **"Özel Program Oluştur"** ile kendi programınızı yapabilirsiniz

### 2️⃣ **Dashboard → Antrenman Başlat** → "📋 Hazır Programlar" Sekmesi
- ✅ Bu **ÇALIŞIYOR!** (Supabase'deki gerçek programlar)
- Burada Push-Pull-Legs, Full Body vs. var
- Buradan program uygulayınca takvime eklenir

---

## 🎯 DOĞRU ADIMLAR: Hazır Program Ekleme

### Adım 1: Dashboard'a Git
Ana ekranda (Dashboard sekmesi) olduğunuzdan emin olun

### Adım 2: "Antrenman Başlat" Kartına Tıkla
Büyük turuncu kart: **"🏋️ Antrenman Başlat"**

### Adım 3: "Hazır Programlar" Sekmesine Geç
WorkoutScreen açılır, üstte 2 sekme var:
- 💪 Aktif Programım
- **📋 Hazır Programlar** ← Buraya tıkla!

### Adım 4: TEST Butonuna Bas (Opsiyonel)
Sağ üstte **🧪 TEST** butonu var
- Bu butona basın
- "Test Başarılı! 5 program bulundu" mesajını göreceksiniz
- Eğer "0 program" diyor ise → SQL dosyalarını çalıştırın

### Adım 5: Bir Program Seç
Örnek: **"Push Pull Legs - İleri"**

Göreceğiniz bilgiler:
- 💪 Push Pull Legs - İleri
- İleri seviye rozeti
- 3 gün/hafta
- ~450 kcal
- 8 hafta

### Adım 6: Detayları İncele
Programa tıklayın, Modal açılır:

**Gördükleriniz:**
- Program açıklaması
- Pazartesi - Push Day (5 egzersiz)
- Çarşamba - Pull Day (5 egzersiz)
- Cuma - Leg Day (5 egzersiz)

### Adım 7: "✨ Bu Programı Uygula" Butonuna Bas

Konsol logları:
```
🚀 Program uygulanıyor: Push Pull Legs - İleri
📥 Program detayları getiriliyor...
📋 Program günleri: 3 gün
💾 Toplam eklenecek egzersiz sayısı: 15
✅ Eklenen egzersiz sayısı: 15
```

Alert:
```
Başarılı! 🎉
Push Pull Legs - İleri programı eklendi!

Program sekmesinde 🔄 butonuna basarak yenileyin ve egzersizlerinizi görün.
```

### Adım 8: Program Sekmesine Dön

**"Program"** sekmesine git (alt menü)

### Adım 9: Yenile Butonuna Bas

Sağ üstteki **🔄** (yeşil) butonuna tıkla

### Adım 10: Takvimde Kontrol Et

**Şimdi göreceksiniz:**
- Pazartesi: 5/5 egzersiz
- Çarşamba: 5/5 egzersiz  
- Cuma: 5/5 egzersiz

**Günlere tıklayın:**
- Bench Press (4 set x 8-10 tekrar)
- Incline Dumbbell Press
- Shoulder Press
- Lateral Raises
- Triceps Pushdown

---

## 🐛 Sorun Giderme

### Problem 1: "0 program bulundu" (TEST butonu)

**Çözüm:**
1. SQL dosyalarını çalıştırmadınız
2. `00_TEMIZLE_VE_BASLAT.sql` → `02_template_programs.sql` sırasıyla çalıştırın
3. TEST butonuna tekrar basın

---

### Problem 2: "Program eklendi ama takvimde yok"

**İki ihtimal:**

#### A) Yanlış yerden eklediniz
- ❌ Program sekmesi → Aylık → Push-Pull-Legs seçtiniz
- ✅ Dashboard → Antrenman Başlat → Hazır Programlar → Push-Pull-Legs seçmelisiniz

#### B) Yenileme yapmadınız
- Program sekmesinde **🔄** butonuna basın
- Konsol loglarını kontrol edin

---

### Problem 3: TEST butonu yok

**TEST butonu nerede:**
- ❌ Program sekmesinde değil!
- ✅ Dashboard → Antrenman Başlat → Hazır Programlar sekmesinde
- Sağ üstte kırmızı **🧪 TEST** butonu

Eğer burada da yoksa:
1. Uygulamayı kapatın
2. `npx expo start` ile yeniden başlatın
3. Tekrar deneyin

---

## 📍 EKRANLARDAKİ KONUMLAR

### Dashboard Ekranı (Ana Ekran)
```
┌─────────────────────────┐
│   📊 Dashboard          │
├─────────────────────────┤
│                         │
│   [Hoşgeldin Card]      │
│                         │
│   🏋️ Antrenman Başlat  │ ← Buraya tıkla!
│   ▶                     │
│                         │
│   [Diğer kartlar...]    │
│                         │
└─────────────────────────┘
```

### WorkoutScreen (Antrenman Başlat sonrası)
```
┌─────────────────────────┐
│ ← Bugünkü Antrenman  🧪│ ← TEST butonu burada!
├─────────────────────────┤
│ 💪 Aktif | 📋 Hazır    │ ← Hazır Programlar'a geç
├─────────────────────────┤
│                         │
│ 💪 Push Pull Legs       │ ← Bu tür programlar var
│ 🔥 Full Body           │
│ 🏋️ Upper Lower         │
│                         │
│ [Program kartları...]   │
│                         │
└─────────────────────────┘
```

### Program Ekranı (Takvim)
```
┌─────────────────────────┐
│ Antrenman Programı   🔄│ ← Yenileme butonu burada!
├─────────────────────────┤
│   [Haftalık Takvim]     │
│                         │
│ Pzt Sal Çar Per Cum Cmt │
│  0   0  5/5  0  5/5  0  │ ← Egzersizler burada görünür
│                         │
│ 💪 Bugünkü Egzersizler  │
│ [Egzersiz listesi...]   │
│                         │
│ ➕ Egzersiz Ekle        │
└─────────────────────────┘
```

---

## ✅ Özet: 10 Adım

1. Dashboard ekranına git
2. "🏋️ Antrenman Başlat" kartına tıkla
3. Üstte "📋 Hazır Programlar" sekmesine geç
4. (Opsiyonel) Sağ üstte 🧪 TEST butonuna bas
5. Bir program seç (örn: Push Pull Legs)
6. Detayları incele
7. "✨ Bu Programı Uygula" butonuna bas
8. "Program" sekmesine dön (alt menü)
9. Sağ üstte 🔄 yenileme butonuna bas
10. Takvimde egzersizleri gör!

---

## 🎉 Başarılı!

Artık Push-Pull-Legs programınız aktif ve takvimde görünüyor! 

**İlk antrenmanı başlatmak için:**
- Pazartesi gününe tıkla
- "▶ Antrenmanı Başlat" butonuna bas
- WorkoutScreen'de egzersizleri tamamla



