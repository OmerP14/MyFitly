# 🔍 Hazır Program Sorun Giderme

## Problem: Hazır programı ekledim ama egzersizler görünmüyor

### ✅ Kontrol Listesi

#### 1. SQL Dosyaları Çalıştırıldı mı?

Supabase Dashboard → SQL Editor'da:

```sql
-- Hazır programları kontrol et
SELECT * FROM template_programs;

-- Kaç program var?
SELECT COUNT(*) FROM template_programs;

-- Program günlerini kontrol et
SELECT COUNT(*) FROM template_program_days;

-- Egzersizleri kontrol et
SELECT COUNT(*) FROM template_exercises;
```

**Beklenen sonuçlar:**
- `template_programs`: 5 program
- `template_program_days`: 15-20 gün
- `template_exercises`: 100+ egzersiz

Eğer bu tablolar boşsa → `02_template_programs.sql` dosyasını çalıştırın!

---

#### 2. Program kopyalandı mı?

```sql
-- Kullanıcının programlarını kontrol et
SELECT * FROM workout_programs WHERE user_id = 'KULLANICI_ID_BURAYA';

-- Kullanıcının egzersizlerini kontrol et
SELECT * FROM exercises WHERE user_id = 'KULLANICI_ID_BURAYA';
```

**Not:** `KULLANICI_ID_BURAYA` yerine kendi user ID'nizi yazın.

User ID'nizi bulmak için:
```sql
SELECT id, email FROM auth.users;
```

---

#### 3. RLS (Row Level Security) Açık mı?

```sql
-- RLS politikalarını kontrol et
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('exercises', 'workout_programs');
```

RLS kapalıysa:
```sql
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
```

---

### 🐛 Debug Adımları

#### Adım 1: Test Butonuna Bas
1. WorkoutScreen'i aç
2. "Hazır Programlar" sekmesine geç
3. Sağ üstte 🧪 TEST butonuna bas
4. Console loglarına bak

**Beklenen log:**
```
📋 Yüklenen hazır programlar: 5
📋 İlk program: Push Pull Legs - İleri Seviye
📋 Program detayları: 3 gün
Test Başarılı! 5 program bulundu.
```

**Eğer "0 program" görüyorsanız** → SQL dosyası çalıştırılmamış!

---

#### Adım 2: Program Uygula
1. Bir hazır programa tıkla
2. "✨ Bu Programı Uygula" butonuna bas
3. Console loglarına bak

**Beklenen log:**
```
🚀 Program uygulanıyor: Push Pull Legs - İleri Seviye
📥 Program detayları getiriliyor...
📋 Program günleri: 3 gün
💾 Toplam eklenecek egzersiz sayısı: 15
✅ Eklenen egzersiz sayısı: 15
✅ Doğrulama: Veritabanında 15 egzersiz bulundu
```

**Eğer "0 egzersiz" ekleniyorsa** → template_exercises tablosu boş!

---

#### Adım 3: Program Sekmesinde Kontrol
1. Program sekmesine dön
2. Sağ üstte 🔄 yenileme butonuna bas
3. Takvimde egzersiz sayılarını kontrol et

**Beklenen:**
- Pazartesi: 5/5
- Çarşamba: 5/5
- Cuma: 5/5

---

### ❌ Sık Karşılaşılan Hatalar

#### Hata 1: "Hiç hazır program bulunamadı"
**Çözüm:**
```sql
-- 02_template_programs.sql dosyasını Supabase SQL Editor'da çalıştırın
```

---

#### Hata 2: "Program uygulandı ama egzersiz yok"
**Muhtemel sebepler:**
1. `template_program_days` tablosu boş
2. `template_exercises` tablosu boş
3. RLS politikaları yanlış

**Çözüm:**
```sql
-- Tüm tabloları kontrol et
SELECT 
  (SELECT COUNT(*) FROM template_programs) as programs,
  (SELECT COUNT(*) FROM template_program_days) as days,
  (SELECT COUNT(*) FROM template_exercises) as exercises;
```

Tüm sayılar 0'dan büyük olmalı!

---

#### Hata 3: "Egzersiz eklendi ama görünmüyor"
**Çözüm:**
1. 🔄 butonu ile yenile
2. Hala görmüyorsanız → `getWeeklyStats` fonksiyonu hatalı olabilir

```javascript
// programService.js içinde getWeeklyStats kontrolü
console.log('📊 Haftalık istatistikler:', weeklyStats);
```

---

### 🔧 Son Çare: Tüm Veritabanını Sıfırla

**⚠️ DİKKAT: Tüm verileriniz silinecek!**

```sql
-- 1. Önce 01_initial_setup.sql çalıştır
-- 2. Sonra 02_template_programs.sql çalıştır
```

---

### 📞 Hala Çalışmıyor mu?

Console loglarını paylaşın:
1. WorkoutScreen → TEST butonu
2. Program Uygula
3. Program sekmesi → 🔄 yenile

Logları kontrol edin ve hangi adımda hata aldığınızı belirleyin.



