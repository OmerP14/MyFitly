-- ============================================
-- EKSİK UUID İLİŞKİLERİNİ DÜZELTME
-- Bu dosya eksik user_id sütunlarını ekler ve ilişkileri kurar
-- ============================================

-- 1) FOODS TABLOSUNA USER_ID EKLE (eğer yoksa)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'foods') THEN
    -- user_id sütunu var mı kontrol et
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'user_id') THEN
      ALTER TABLE foods ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
      -- Mevcut besinleri genel besinler olarak işaretle (user_id NULL)
      UPDATE foods SET user_id = NULL WHERE user_id IS NULL;
    END IF;
  END IF;
END $$;

-- 2) TEMPLATE_PROGRAMS TABLOSUNA USER_ID EKLE (eğer yoksa)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_programs') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template_programs' AND column_name = 'user_id') THEN
      ALTER TABLE template_programs ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
      -- Template programları genel olarak işaretle
      UPDATE template_programs SET user_id = NULL WHERE user_id IS NULL;
    END IF;
  END IF;
END $$;

-- 3) TEMPLATE_EXERCISES TABLOSUNA USER_ID EKLE (eğer yoksa)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_exercises') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template_exercises' AND column_name = 'user_id') THEN
      ALTER TABLE template_exercises ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
      -- Template egzersizleri genel olarak işaretle
      UPDATE template_exercises SET user_id = NULL WHERE user_id IS NULL;
    END IF;
  END IF;
END $$;

-- 4) TEMPLATE_PROGRAM_DAYS TABLOSUNA USER_ID EKLE (eğer yoksa)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_program_days') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'template_program_days' AND column_name = 'user_id') THEN
      ALTER TABLE template_program_days ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
      -- Template program günlerini genel olarak işaretle
      UPDATE template_program_days SET user_id = NULL WHERE user_id IS NULL;
    END IF;
  END IF;
END $$;

-- 5) MEAL_PLANS TABLOSUNA USER_ID EKLE (eğer yoksa)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meal_plans') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meal_plans' AND column_name = 'user_id') THEN
      ALTER TABLE meal_plans ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
      -- Mevcut meal planları kullanıcıya bağla (kendi ortamınızdaki gerçek bir
      -- kullanıcı UUID'si ile değiştirin)
      UPDATE meal_plans SET user_id = '<YOUR_USER_UUID>' WHERE user_id IS NULL;
    END IF;
  END IF;
END $$;

-- 6) PLANNED_MEALS TABLOSUNA USER_ID EKLE (eğer yoksa)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'planned_meals') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'planned_meals' AND column_name = 'user_id') THEN
      ALTER TABLE planned_meals ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
      -- Mevcut planned meals'leri meal_plans üzerinden kullanıcıya bağla
      UPDATE planned_meals 
      SET user_id = mp.user_id 
      FROM meal_plans mp 
      WHERE planned_meals.meal_plan_id = mp.id 
      AND planned_meals.user_id IS NULL;
    END IF;
  END IF;
END $$;

-- 7) INDEX'LERİ EKLE
CREATE INDEX IF NOT EXISTS idx_foods_user_id ON foods(user_id);
CREATE INDEX IF NOT EXISTS idx_template_programs_user_id ON template_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_template_exercises_user_id ON template_exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_template_program_days_user_id ON template_program_days(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_meals_user_id ON planned_meals(user_id);

-- 8) ROW LEVEL SECURITY EKLE
DO $$
BEGIN
  -- Foods tablosu için RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'foods') THEN
    ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
    
    -- Foods politikası: Genel besinler (user_id NULL) herkes görebilir, özel besinler sadece sahibi
    DROP POLICY IF EXISTS "foods_policy" ON foods;
    CREATE POLICY "foods_policy" ON foods
      FOR ALL USING (
        user_id IS NULL OR auth.uid() = user_id
      );
  END IF;
  
  -- Template programs için RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_programs') THEN
    ALTER TABLE template_programs ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "template_programs_policy" ON template_programs;
    CREATE POLICY "template_programs_policy" ON template_programs
      FOR ALL USING (
        user_id IS NULL OR auth.uid() = user_id
      );
  END IF;
  
  -- Template exercises için RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_exercises') THEN
    ALTER TABLE template_exercises ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "template_exercises_policy" ON template_exercises;
    CREATE POLICY "template_exercises_policy" ON template_exercises
      FOR ALL USING (
        user_id IS NULL OR auth.uid() = user_id
      );
  END IF;
  
  -- Template program days için RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_program_days') THEN
    ALTER TABLE template_program_days ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "template_program_days_policy" ON template_program_days;
    CREATE POLICY "template_program_days_policy" ON template_program_days
      FOR ALL USING (
        user_id IS NULL OR auth.uid() = user_id
      );
  END IF;
  
  -- Meal plans için RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meal_plans') THEN
    ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "meal_plans_policy" ON meal_plans;
    CREATE POLICY "meal_plans_policy" ON meal_plans
      FOR ALL USING (auth.uid() = user_id);
  END IF;
  
  -- Planned meals için RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'planned_meals') THEN
    ALTER TABLE planned_meals ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "planned_meals_policy" ON planned_meals;
    CREATE POLICY "planned_meals_policy" ON planned_meals
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 9) İSTATİSTİKLER
SELECT 
  'UUID İlişkileri Eklendi' as durum,
  'Tüm tablolar kullanıcıyla ilişkilendirildi' as aciklama;

-- 10) TABLO DURUMU KONTROLÜ
SELECT 
  table_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t.table_name AND column_name = 'user_id') 
    THEN '✅ user_id var'
    ELSE '❌ user_id yok'
  END as user_id_durumu
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('foods', 'template_programs', 'template_exercises', 'template_program_days', 'meal_plans', 'planned_meals')
ORDER BY table_name;

-- ============================================
-- SONUÇ
-- ============================================
-- ✅ Tüm tablolar kullanıcıyla ilişkilendirildi
-- ✅ UUID foreign key'ler eklendi
-- ✅ RLS politikaları kuruldu
-- ✅ Index'ler eklendi
-- ✅ Genel veriler (user_id NULL) korundu
