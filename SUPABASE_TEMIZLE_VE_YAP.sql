-- ============================================
-- ADIM 1: HER ŞEYİ TEMİZLE (ESKİ VERİLER GİDECEK!)
-- ============================================

-- Önce politikaları sil
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can manage own exercises" ON exercises;
DROP POLICY IF EXISTS "Users can manage own programs" ON workout_programs;
DROP POLICY IF EXISTS "Users can manage own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can manage own weight data" ON weight_tracking;
DROP POLICY IF EXISTS "Users can manage own strength data" ON strength_tracking;
DROP POLICY IF EXISTS "Users can manage own favorites" ON user_favorite_quotes;
DROP POLICY IF EXISTS "Anyone can read quotes" ON motivation_quotes;

-- Tabloları sil (sırayla, bağımlılıklar önemli)
DROP TABLE IF EXISTS user_favorite_quotes CASCADE;
DROP TABLE IF EXISTS workout_sessions CASCADE;
DROP TABLE IF EXISTS strength_tracking CASCADE;
DROP TABLE IF EXISTS weight_tracking CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS workout_programs CASCADE;
DROP TABLE IF EXISTS motivation_quotes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- ADIM 2: YENİDEN OLUŞTUR
-- ============================================

-- Users tablosu (Supabase Auth ile entegre)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT DEFAULT 'Kullanıcı',
  age INTEGER,
  height INTEGER,
  current_weight DECIMAL(5,2),
  target_weight DECIMAL(5,2),
  profile_photo_url TEXT,
  is_dark_mode BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises tablosu
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  program_id UUID,
  name TEXT NOT NULL,
  sets INTEGER DEFAULT 3,
  reps TEXT DEFAULT '10',
  weight TEXT DEFAULT '0',
  category TEXT DEFAULT 'Üst Vücut',
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Programs tablosu
CREATE TABLE workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_custom BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Sessions tablosu
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  sets_completed INTEGER DEFAULT 0,
  reps_completed INTEGER DEFAULT 0,
  weight_used DECIMAL(5,2) DEFAULT 0.0,
  duration_minutes INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weight Tracking tablosu
CREATE TABLE weight_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  measurement_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Strength Tracking tablosu
CREATE TABLE strength_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  max_weight DECIMAL(5,2) NOT NULL,
  max_reps INTEGER DEFAULT 1,
  measurement_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Motivation Quotes tablosu
CREATE TABLE motivation_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_text TEXT NOT NULL,
  author TEXT,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Favorite Quotes tablosu
CREATE TABLE user_favorite_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES motivation_quotes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quote_id)
);

-- ============================================
-- ADIM 3: INDEX'LER
-- ============================================

CREATE INDEX users_email_idx ON users(email);
CREATE INDEX exercises_user_id_idx ON exercises(user_id);
CREATE INDEX exercises_day_of_week_idx ON exercises(day_of_week);
CREATE INDEX exercises_user_day_idx ON exercises(user_id, day_of_week);
CREATE INDEX workout_programs_user_id_idx ON workout_programs(user_id);
CREATE INDEX workout_sessions_user_id_idx ON workout_sessions(user_id);
CREATE INDEX workout_sessions_date_idx ON workout_sessions(session_date);
CREATE INDEX weight_tracking_user_id_idx ON weight_tracking(user_id);
CREATE INDEX weight_tracking_date_idx ON weight_tracking(measurement_date);
CREATE INDEX strength_tracking_user_id_idx ON strength_tracking(user_id);
CREATE INDEX user_favorite_quotes_user_id_idx ON user_favorite_quotes(user_id);

-- ============================================
-- ADIM 4: RLS AKTIF ET
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE strength_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE motivation_quotes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ADIM 5: POLİTİKALAR
-- ============================================

-- Users politikaları
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Exercises politikası
CREATE POLICY "Users can manage own exercises" ON exercises
  FOR ALL USING (auth.uid() = user_id);

-- Workout Programs politikası
CREATE POLICY "Users can manage own programs" ON workout_programs
  FOR ALL USING (auth.uid() = user_id);

-- Workout Sessions politikası
CREATE POLICY "Users can manage own sessions" ON workout_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Weight Tracking politikası
CREATE POLICY "Users can manage own weight data" ON weight_tracking
  FOR ALL USING (auth.uid() = user_id);

-- Strength Tracking politikası
CREATE POLICY "Users can manage own strength data" ON strength_tracking
  FOR ALL USING (auth.uid() = user_id);

-- User Favorite Quotes politikası
CREATE POLICY "Users can manage own favorites" ON user_favorite_quotes
  FOR ALL USING (auth.uid() = user_id);

-- Motivation Quotes politikası (herkes okuyabilir)
CREATE POLICY "Anyone can read quotes" ON motivation_quotes
  FOR SELECT USING (true);

-- ============================================
-- ADIM 6: TRIGGER FONKSIYONLARI
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ları ekle
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_programs_updated_at
  BEFORE UPDATE ON workout_programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ADIM 7: ÖRNEK VERİLER
-- ============================================

INSERT INTO motivation_quotes (quote_text, author, category) VALUES
  ('Disiplin, motivasyondan daha güçlüdür.', 'Anonim', 'discipline'),
  ('Başarı, küçük çabaların tekrarından oluşur.', 'Robert Collier', 'success'),
  ('Vücudun yapabileceklerinin sınırını aklın belirler.', 'Arnold Schwarzenegger', 'mindset'),
  ('Bir yıl sonra başlamış olmayı dileyeceksin.', 'Karen Lamb', 'motivation'),
  ('Acı geçicidir, gurur sonsuzdur.', 'Anonim', 'strength');

-- ============================================
-- ✅ TEMİZ KURULUM TAMAMLANDI!
-- ============================================

