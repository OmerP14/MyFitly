-- ============================================
-- KESİN ÇÖZÜM: PROGRAM SİLME SİSTEMİ
-- is_deleted kolonları + RLS politikaları
-- ============================================

-- 1. is_deleted kolonlarını ekle
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

ALTER TABLE workout_programs 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- 2. Mevcut verileri güncelle
UPDATE exercises SET is_deleted = false WHERE is_deleted IS NULL;
UPDATE workout_programs SET is_deleted = false WHERE is_deleted IS NULL;

-- 3. Index'ler ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_exercises_user_deleted ON exercises(user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_workout_programs_user_deleted ON workout_programs(user_id, is_deleted);

-- 4. TÜM RLS POLİTİKALARINI SİL
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can manage own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can view own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can insert own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can update own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can delete own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can manage own programs" ON workout_programs;
DROP POLICY IF EXISTS "Users can view own programs" ON workout_programs;
DROP POLICY IF EXISTS "Users can insert own programs" ON workout_programs;
DROP POLICY IF EXISTS "Users can update own programs" ON workout_programs;
DROP POLICY IF EXISTS "Users can delete own programs" ON workout_programs;
DROP POLICY IF EXISTS "Users can manage own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can manage own weight data" ON weight_tracking;
DROP POLICY IF EXISTS "Users can manage own strength data" ON strength_tracking;

-- 5. YENİ RLS POLİTİKALARI OLUŞTUR
-- Users tablosu
CREATE POLICY "Users can manage own data" ON users
FOR ALL USING (auth.uid() = id);

-- Exercises tablosu - TÜM İŞLEMLER İÇİN
CREATE POLICY "Users can manage own exercises" ON exercises
FOR ALL USING (auth.uid() = user_id);

-- Workout Programs tablosu - TÜM İŞLEMLER İÇİN
CREATE POLICY "Users can manage own programs" ON workout_programs
FOR ALL USING (auth.uid() = user_id);

-- Workout Sessions tablosu
CREATE POLICY "Users can manage own sessions" ON workout_sessions
FOR ALL USING (auth.uid() = user_id);

-- Weight Tracking tablosu
CREATE POLICY "Users can manage own weight data" ON weight_tracking
FOR ALL USING (auth.uid() = user_id);

-- Strength Tracking tablosu
CREATE POLICY "Users can manage own strength data" ON strength_tracking
FOR ALL USING (auth.uid() = user_id);

-- 6. RLS'İ AKTİF ET
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE strength_tracking ENABLE ROW LEVEL SECURITY;

-- 7. BAŞARI MESAJI
DO $$
BEGIN
  RAISE NOTICE '✅ KESİN ÇÖZÜM UYGULANDI!';
  RAISE NOTICE '✅ is_deleted kolonları eklendi!';
  RAISE NOTICE '✅ RLS politikaları yeniden oluşturuldu!';
  RAISE NOTICE '✅ Program silme işlemi artık çalışacak!';
  RAISE NOTICE '✅ Soft delete sistemi aktif!';
END $$;








