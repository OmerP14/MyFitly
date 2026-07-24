-- ============================================
-- SADECE KULLANICILARI VE ONLARA AİT VERİLERİ SİL
-- ============================================
-- Bu dosya sadece kullanıcıları ve onlara ait kişisel verileri siler.
-- Genel programlar, besinler ve template'ler korunur.

DO $$
DECLARE
  tbl_name TEXT;
  col_name TEXT;
BEGIN
  RAISE NOTICE '🧹 Kullanıcılar ve kişisel veriler temizleniyor...';

  -- ============================================
  -- ADIM 1: KULLANICILARA AİT KİŞİSEL VERİLERİ SİL
  -- ============================================
  -- Sadece user_id ile ilişkili verileri sil

  -- workout_sessions
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_sessions' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> workout_sessions tablosu temizleniyor...';
    DELETE FROM workout_sessions;
  END IF;

  -- strength_tracking
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'strength_tracking' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> strength_tracking tablosu temizleniyor...';
    DELETE FROM strength_tracking;
  END IF;

  -- weight_tracking
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weight_tracking' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> weight_tracking tablosu temizleniyor...';
    DELETE FROM weight_tracking;
  END IF;

  -- exercises (sadece kullanıcıya ait olanlar)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercises' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> exercises tablosu temizleniyor (sadece kullanıcıya ait olanlar)...';
    DELETE FROM exercises WHERE user_id IS NOT NULL;
  END IF;

  -- workout_programs (sadece kullanıcıya ait olanlar)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workout_programs' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> workout_programs tablosu temizleniyor (sadece kullanıcıya ait olanlar)...';
    DELETE FROM workout_programs WHERE user_id IS NOT NULL;
  END IF;

  -- diet_profiles
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diet_profiles' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> diet_profiles tablosu temizleniyor...';
    DELETE FROM diet_profiles;
  END IF;

  -- Trigger'ı geçici olarak devre dışı bırak (sadece bizim trigger'ımızı)
  IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name LIKE '%daily_summary%' AND event_object_table = 'food_logs') THEN
    RAISE NOTICE '  -> daily_summary trigger''ı geçici olarak devre dışı bırakılıyor...';
    -- Tüm daily_summary ile ilgili trigger'ları bul ve devre dışı bırak
    FOR tbl_name IN 
      SELECT DISTINCT trigger_name 
      FROM information_schema.triggers 
      WHERE trigger_name LIKE '%daily_summary%' AND event_object_table = 'food_logs'
    LOOP
      EXECUTE format('ALTER TABLE food_logs DISABLE TRIGGER %I', tbl_name);
      RAISE NOTICE '    -> % trigger''ı devre dışı bırakıldı', tbl_name;
    END LOOP;
  END IF;

  -- food_logs (trigger devre dışı)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_logs' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> food_logs tablosu temizleniyor...';
    DELETE FROM food_logs;
  END IF;

  -- daily_summaries (trigger sorunu için önce temizle)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_summaries' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> daily_summaries tablosu temizleniyor (trigger sorunu için)...';
    DELETE FROM daily_summaries;
  END IF;

  -- water_logs
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'water_logs' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> water_logs tablosu temizleniyor...';
    DELETE FROM water_logs;
  END IF;

  -- meal_plans
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meal_plans' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> meal_plans tablosu temizleniyor...';
    DELETE FROM meal_plans;
  END IF;

  -- planned_meals
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planned_meals' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> planned_meals tablosu temizleniyor...';
    DELETE FROM planned_meals;
  END IF;

  -- entitlements
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entitlements' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> entitlements tablosu temizleniyor...';
    DELETE FROM entitlements;
  END IF;

  -- template_programs (sadece kullanıcıya ait olanlar - genel olanlar korunur)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template_programs' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> template_programs tablosu temizleniyor (sadece kullanıcıya ait olanlar)...';
    DELETE FROM template_programs WHERE user_id IS NOT NULL;
  END IF;

  -- template_exercises (sadece kullanıcıya ait olanlar - genel olanlar korunur)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template_exercises' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> template_exercises tablosu temizleniyor (sadece kullanıcıya ait olanlar)...';
    DELETE FROM template_exercises WHERE user_id IS NOT NULL;
  END IF;

  -- template_program_days (sadece kullanıcıya ait olanlar - genel olanlar korunur)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template_program_days' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> template_program_days tablosu temizleniyor (sadece kullanıcıya ait olanlar)...';
    DELETE FROM template_program_days WHERE user_id IS NOT NULL;
  END IF;

  -- foods (sadece kullanıcıya ait olanlar - genel besinler korunur)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> foods tablosu temizleniyor (sadece kullanıcıya ait olanlar)...';
    DELETE FROM foods WHERE user_id IS NOT NULL;
  END IF;

  -- user_favorite_quotes (eğer varsa)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_favorite_quotes' AND column_name = 'user_id') THEN
    RAISE NOTICE '  -> user_favorite_quotes tablosu temizleniyor...';
    DELETE FROM user_favorite_quotes;
  END IF;

  -- ============================================
  -- ADIM 2: KULLANICILAR TABLOSUNDAN TÜM KULLANICILARI SİL
  -- ============================================
  RAISE NOTICE '  -> users tablosu temizleniyor...';
  DELETE FROM users;

  -- ============================================
  -- ADIM 3: AUTH.USERS TABLOSUNDAN TÜM KULLANICILARI SİL
  -- ============================================
  -- Bu işlem sadece Supabase admin yetkileriyle yapılabilir.
  -- Eğer bu scripti Supabase SQL Editor'da çalıştırıyorsanız,
  -- auth.users tablosuna doğrudan erişiminiz olmayabilir.
  -- Gerekirse Supabase Dashboard'dan manuel olarak silin.
  RAISE NOTICE '  -> auth.users tablosu temizleniyor (manuel kontrol gerekebilir)...';
  DELETE FROM auth.users;

  -- ============================================
  -- ADIM 4: TRIGGER'LARI TEKRAR AKTİF HALE GETİR
  -- ============================================
  RAISE NOTICE '  -> daily_summary trigger''ları tekrar aktif hale getiriliyor...';
  
  -- Tüm daily_summary ile ilgili trigger'ları tekrar aktif et
  IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name LIKE '%daily_summary%' AND event_object_table = 'food_logs') THEN
    FOR tbl_name IN 
      SELECT DISTINCT trigger_name 
      FROM information_schema.triggers 
      WHERE trigger_name LIKE '%daily_summary%' AND event_object_table = 'food_logs'
    LOOP
      EXECUTE format('ALTER TABLE food_logs ENABLE TRIGGER %I', tbl_name);
      RAISE NOTICE '    -> % trigger''ı tekrar aktif edildi', tbl_name;
    END LOOP;
  END IF;

  RAISE NOTICE '✅ Kullanıcılar ve kişisel veriler temizlendi.';

END $$;

-- ============================================
-- TEMİZLİK SONRASI İSTATİSTİKLER
-- ============================================
SELECT 
  'Kalan Kullanıcılar' as tablo,
  COUNT(*) as sayi
FROM users
UNION ALL
SELECT 
  'Kalan Abonelikler' as tablo,
  COUNT(*) as sayi
FROM entitlements
UNION ALL
SELECT 
  'Kalan Diyet Profilleri' as tablo,
  COUNT(*) as sayi
FROM diet_profiles
UNION ALL
SELECT 
  'Kalan Besin Kayıtları' as tablo,
  COUNT(*) as sayi
FROM food_logs
UNION ALL
SELECT 
  'Kalan Daily Summaries' as tablo,
  COUNT(*) as sayi
FROM daily_summaries
UNION ALL
SELECT 
  'Kalan Su Kayıtları' as tablo,
  COUNT(*) as sayi
FROM water_logs
UNION ALL
SELECT 
  'Kalan Meal Plans' as tablo,
  COUNT(*) as sayi
FROM meal_plans
UNION ALL
SELECT 
  'Kalan Planned Meals' as tablo,
  COUNT(*) as sayi
FROM planned_meals
UNION ALL
SELECT 
  'Kalan Antrenman Programları' as tablo,
  COUNT(*) as sayi
FROM workout_programs
UNION ALL
SELECT 
  'Kalan Egzersizler' as tablo,
  COUNT(*) as sayi
FROM exercises
UNION ALL
SELECT 
  'Kalan Antrenman Seansları' as tablo,
  COUNT(*) as sayi
FROM workout_sessions
UNION ALL
SELECT 
  'Kalan Kilo Kayıtları' as tablo,
  COUNT(*) as sayi
FROM weight_tracking
UNION ALL
SELECT 
  'Kalan Güç Kayıtları' as tablo,
  COUNT(*) as sayi
FROM strength_tracking
UNION ALL
SELECT 
  'Kalan Template Programs' as tablo,
  COUNT(*) as sayi
FROM template_programs
UNION ALL
SELECT 
  'Kalan Template Exercises' as tablo,
  COUNT(*) as sayi
FROM template_exercises
UNION ALL
SELECT 
  'Kalan Template Program Days' as tablo,
  COUNT(*) as sayi
FROM template_program_days
UNION ALL
SELECT 
  'Kalan Foods (Özel)' as tablo,
  COUNT(*) as sayi
FROM foods WHERE user_id IS NOT NULL;

-- ============================================
-- KORUNAN GENEL VERİLERİN DURUMU
-- ============================================
SELECT 
  'Genel Besinler' as tablo,
  COUNT(*) as sayi
FROM foods WHERE user_id IS NULL
UNION ALL
SELECT 
  'Genel Template Programs' as tablo,
  COUNT(*) as sayi
FROM template_programs WHERE user_id IS NULL
UNION ALL
SELECT 
  'Genel Template Exercises' as tablo,
  COUNT(*) as sayi
FROM template_exercises WHERE user_id IS NULL
UNION ALL
SELECT 
  'Genel Template Program Days' as tablo,
  COUNT(*) as sayi
FROM template_program_days WHERE user_id IS NULL;

-- ============================================
-- SONUÇ
-- ============================================
-- ✅ Sadece kullanıcılar ve kişisel veriler silindi
-- ✅ Genel programlar korundu (user_id = NULL)
-- ✅ Genel besinler korundu (user_id = NULL)
-- ✅ Template'ler korundu (user_id = NULL)
-- ✅ Veritabanı yayına hazır