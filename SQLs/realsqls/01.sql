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
-- Favoriler ve motivasyon sozleri icin kosullu DROP (tablo yoksa hata verme)
DO $$
BEGIN
  IF to_regclass('public.user_favorite_quotes') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Users can manage own favorites" ON user_favorite_quotes;
    DROP TABLE IF EXISTS user_favorite_quotes CASCADE;
  END IF;
  IF to_regclass('public.motivation_quotes') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Anyone can read quotes" ON motivation_quotes;
    DROP TABLE IF EXISTS motivation_quotes CASCADE;
  END IF;
END $$;

-- Tabloları sil (sırayla, bağımlılıklar önemli)
DROP TABLE IF EXISTS workout_sessions CASCADE;
DROP TABLE IF EXISTS strength_tracking CASCADE;
DROP TABLE IF EXISTS weight_tracking CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS workout_programs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- ADIM 2: YENİDEN OLUŞTUR
-- ============================================

-- Users tablosu (Supabase Auth ile entegre)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT DEFAULT 'Kullanıcı',
  display_name TEXT DEFAULT 'Kullanıcı',
  age INTEGER,
  height INTEGER,
  current_weight DECIMAL(5,2),
  target_weight DECIMAL(5,2),
  profile_photo_url TEXT,
  preferred_language VARCHAR(5) DEFAULT 'tr',
  is_dark_mode BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mevcut users tablosuna display_name sütunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'display_name'
  ) THEN
    ALTER TABLE users ADD COLUMN display_name TEXT DEFAULT 'Kullanıcı';
    RAISE NOTICE '✅ display_name sütunu eklendi';
  ELSE
    RAISE NOTICE 'ℹ️ display_name sütunu zaten mevcut';
  END IF;
END $$;

-- Mevcut kayıtlarda display_name'i name ile doldur
UPDATE users 
SET display_name = name 
WHERE display_name IS NULL OR display_name = 'Kullanıcı';

-- Exercises tablosu
CREATE TABLE IF NOT EXISTS exercises (
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
  is_deleted BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mevcut exercises tablosuna is_deleted sütunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exercises' 
    AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE exercises ADD COLUMN is_deleted BOOLEAN DEFAULT false;
    RAISE NOTICE '✅ exercises.is_deleted sütunu eklendi';
  ELSE
    RAISE NOTICE 'ℹ️ exercises.is_deleted sütunu zaten mevcut';
  END IF;
END $$;

-- Workout Programs tablosu
CREATE TABLE IF NOT EXISTS workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_custom BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mevcut workout_programs tablosuna is_deleted sütunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workout_programs' 
    AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE workout_programs ADD COLUMN is_deleted BOOLEAN DEFAULT false;
    RAISE NOTICE '✅ workout_programs.is_deleted sütunu eklendi';
  ELSE
    RAISE NOTICE 'ℹ️ workout_programs.is_deleted sütunu zaten mevcut';
  END IF;
END $$;

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
-- CREATE INDEX user_favorite_quotes_user_id_idx ON user_favorite_quotes(user_id);

-- ============================================
-- ADIM 4: RLS AKTIF ET
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE strength_tracking ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_favorite_quotes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE motivation_quotes ENABLE ROW LEVEL SECURITY;

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
-- CREATE POLICY "Users can manage own favorites" ON user_favorite_quotes
--   FOR ALL USING (auth.uid() = user_id);

-- Motivation Quotes politikası (herkes okuyabilir)
-- CREATE POLICY "Anyone can read quotes" ON motivation_quotes
--   FOR SELECT USING (true);

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

-- Ornek motivasyon sozleri eklendi (KALDIRILDI)
-- INSERT INTO motivation_quotes (quote_text, author, category) VALUES
--   ('Disiplin, motivasyondan daha güçlüdür.', 'Anonim', 'discipline'),
--   ('Başarı, küçük çabaların tekrarından oluşur.', 'Robert Collier', 'success'),
--   ('Vücudun yapabileceklerinin sınırını aklın belirler.', 'Arnold Schwarzenegger', 'mindset'),
--   ('Bir yıl sonra başlamış olmayı dileyeceksin.', 'Karen Lamb', 'motivation'),
--   ('Acı geçicidir, gurur sonsuzdur.', 'Anonim', 'strength'),
--   ('Bugün yapmadığın antrenmanı yarın da yapmayacaksın.', 'Anonim', 'discipline'),
--   ('Kas acısı, başarının yükselen sesidir.', 'Anonim', 'strength'),
--   ('İmkansız diye bir şey yoktur, sadece hazır olmayan zihinler vardır.', 'Bruce Lee', 'mindset');

-- ============================================
-- ADIM 8: TRACKING RPC FONKSİYONLARI
-- ============================================

-- Kilo verisi ekleme fonksiyonu
CREATE OR REPLACE FUNCTION add_weight_entry(
  user_id_param UUID,
  weight_param DECIMAL(5,2),
  measurement_date_param DATE DEFAULT NULL,
  notes_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  entry_id UUID;
BEGIN
  -- Kilo verisi ekle
  INSERT INTO weight_tracking (
    user_id,
    weight,
    measurement_date,
    notes
  ) VALUES (
    user_id_param,
    weight_param,
    COALESCE(measurement_date_param, CURRENT_DATE),
    notes_param
  ) RETURNING id INTO entry_id;

  -- Başarılı sonuç döndür
  result := json_build_object(
    'success', true,
    'entry_id', entry_id,
    'message', 'Weight entry added successfully'
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Hata durumunda
    result := json_build_object(
      'success', false,
      'message', SQLERRM
    );
    RETURN result;
END;
$$;

-- Kilo verisi güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_weight_entry(
  entry_id_param UUID,
  user_id_param UUID,
  weight_param DECIMAL(5,2) DEFAULT NULL,
  measurement_date_param DATE DEFAULT NULL,
  notes_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  updated_rows INTEGER;
BEGIN
  -- Kilo verisini güncelle
  UPDATE weight_tracking 
  SET 
    weight = COALESCE(weight_param, weight),
    measurement_date = COALESCE(measurement_date_param, measurement_date),
    notes = COALESCE(notes_param, notes),
    updated_at = NOW()
  WHERE id = entry_id_param 
    AND user_id = user_id_param;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;

  IF updated_rows > 0 THEN
    result := json_build_object(
      'success', true,
      'message', 'Weight entry updated successfully'
    );
  ELSE
    result := json_build_object(
      'success', false,
      'message', 'Weight entry not found or not authorized'
    );
  END IF;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'message', SQLERRM
    );
    RETURN result;
END;
$$;

-- Kilo verisi silme fonksiyonu
CREATE OR REPLACE FUNCTION delete_weight_entry(
  entry_id_param UUID,
  user_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  deleted_rows INTEGER;
BEGIN
  -- Kilo verisini sil
  DELETE FROM weight_tracking 
  WHERE id = entry_id_param 
    AND user_id = user_id_param;

  GET DIAGNOSTICS deleted_rows = ROW_COUNT;

  IF deleted_rows > 0 THEN
    result := json_build_object(
      'success', true,
      'message', 'Weight entry deleted successfully'
    );
  ELSE
    result := json_build_object(
      'success', false,
      'message', 'Weight entry not found or not authorized'
    );
  END IF;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'message', SQLERRM
    );
    RETURN result;
END;
$$;

-- Ağırlık verisi ekleme fonksiyonu
CREATE OR REPLACE FUNCTION add_strength_entry(
  user_id_param UUID,
  exercise_name_param TEXT,
  max_weight_param DECIMAL(5,2),
  max_reps_param INTEGER DEFAULT 1,
  measurement_date_param DATE DEFAULT NULL,
  notes_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  entry_id UUID;
BEGIN
  -- Ağırlık verisi ekle
  INSERT INTO strength_tracking (
    user_id,
    exercise_name,
    max_weight,
    max_reps,
    measurement_date,
    notes
  ) VALUES (
    user_id_param,
    exercise_name_param,
    max_weight_param,
    max_reps_param,
    COALESCE(measurement_date_param, CURRENT_DATE),
    notes_param
  ) RETURNING id INTO entry_id;

  -- Başarılı sonuç döndür
  result := json_build_object(
    'success', true,
    'entry_id', entry_id,
    'message', 'Strength entry added successfully'
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Hata durumunda
    result := json_build_object(
      'success', false,
      'message', SQLERRM
    );
    RETURN result;
END;
$$;

-- Ağırlık verilerini getirme fonksiyonu
CREATE OR REPLACE FUNCTION get_strength_data(
  user_id_param UUID,
  period_type TEXT DEFAULT 'monthly',
  exercise_name_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  start_date DATE;
  end_date DATE;
  strength_data RECORD;
  data_array JSON[];
BEGIN
  -- Tarih aralığını hesapla
  end_date := CURRENT_DATE;
  
  CASE period_type
    WHEN 'weekly' THEN
      start_date := end_date - INTERVAL '7 days';
    WHEN 'monthly' THEN
      start_date := end_date - INTERVAL '30 days';
    WHEN 'yearly' THEN
      start_date := end_date - INTERVAL '1 year';
    ELSE
      start_date := end_date - INTERVAL '30 days';
  END CASE;

  -- Verileri topla
  data_array := ARRAY[]::JSON[];
  
  FOR strength_data IN
    SELECT 
      id,
      exercise_name,
      max_weight,
      max_reps,
      measurement_date,
      notes,
      created_at
    FROM strength_tracking
    WHERE user_id = user_id_param
      AND measurement_date >= start_date
      AND measurement_date <= end_date
      AND (exercise_name_param IS NULL OR exercise_name = exercise_name_param)
    ORDER BY measurement_date DESC, created_at DESC
  LOOP
    data_array := data_array || json_build_object(
      'id', strength_data.id,
      'exercise_name', strength_data.exercise_name,
      'max_weight', strength_data.max_weight,
      'max_reps', strength_data.max_reps,
      'measurement_date', strength_data.measurement_date,
      'notes', strength_data.notes,
      'created_at', strength_data.created_at
    );
  END LOOP;

  result := json_build_object(
    'success', true,
    'data', data_array,
    'period_type', period_type,
    'start_date', start_date,
    'end_date', end_date,
    'count', array_length(data_array, 1)
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'message', SQLERRM,
      'data', '[]'::JSON
    );
    RETURN result;
END;
$$;

-- Egzersiz bazlı maksimum ağırlıkları getirme fonksiyonu
CREATE OR REPLACE FUNCTION get_exercise_max_weights(
  user_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  exercise_data RECORD;
  data_array JSON[];
BEGIN
  -- Her egzersiz için maksimum ağırlığı bul
  data_array := ARRAY[]::JSON[];
  
  FOR exercise_data IN
    SELECT 
      exercise_name,
      MAX(max_weight) as max_weight,
      MAX(measurement_date) as last_measurement_date,
      COUNT(*) as total_entries
    FROM strength_tracking
    WHERE user_id = user_id_param
    GROUP BY exercise_name
    ORDER BY exercise_name
  LOOP
    data_array := data_array || json_build_object(
      'exercise_name', exercise_data.exercise_name,
      'max_weight', exercise_data.max_weight,
      'last_measurement_date', exercise_data.last_measurement_date,
      'total_entries', exercise_data.total_entries
    );
  END LOOP;

  result := json_build_object(
    'success', true,
    'data', data_array,
    'count', array_length(data_array, 1)
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'message', SQLERRM,
      'data', '[]'::JSON
    );
    RETURN result;
END;
$$;

-- Ağırlık verisi güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_strength_entry(
  entry_id_param UUID,
  user_id_param UUID,
  exercise_name_param TEXT DEFAULT NULL,
  max_weight_param DECIMAL(5,2) DEFAULT NULL,
  max_reps_param INTEGER DEFAULT NULL,
  measurement_date_param DATE DEFAULT NULL,
  notes_param TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  updated_rows INTEGER;
BEGIN
  -- Ağırlık verisini güncelle
  UPDATE strength_tracking 
  SET 
    exercise_name = COALESCE(exercise_name_param, exercise_name),
    max_weight = COALESCE(max_weight_param, max_weight),
    max_reps = COALESCE(max_reps_param, max_reps),
    measurement_date = COALESCE(measurement_date_param, measurement_date),
    notes = COALESCE(notes_param, notes),
    updated_at = NOW()
  WHERE id = entry_id_param 
    AND user_id = user_id_param;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;

  IF updated_rows > 0 THEN
    result := json_build_object(
      'success', true,
      'message', 'Strength entry updated successfully'
    );
  ELSE
    result := json_build_object(
      'success', false,
      'message', 'Strength entry not found or not authorized'
    );
  END IF;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'message', SQLERRM
    );
    RETURN result;
END;
$$;

-- Ağırlık verisi silme fonksiyonu
CREATE OR REPLACE FUNCTION delete_strength_entry(
  entry_id_param UUID,
  user_id_param UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  deleted_rows INTEGER;
BEGIN
  -- Ağırlık verisini sil
  DELETE FROM strength_tracking 
  WHERE id = entry_id_param 
    AND user_id = user_id_param;

  GET DIAGNOSTICS deleted_rows = ROW_COUNT;

  IF deleted_rows > 0 THEN
    result := json_build_object(
      'success', true,
      'message', 'Strength entry deleted successfully'
    );
  ELSE
    result := json_build_object(
      'success', false,
      'message', 'Strength entry not found or not authorized'
    );
  END IF;

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'message', SQLERRM
    );
    RETURN result;
END;
$$;

-- Toplu kilo verisi ekleme fonksiyonu
CREATE OR REPLACE FUNCTION bulk_add_weight_entries(
  user_id_param UUID,
  entries TEXT -- JSON string olarak gelecek
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  entry JSON;
  entry_id UUID;
  added_count INTEGER := 0;
  entries_array JSON[];
BEGIN
  -- JSON string'i parse et
  entries_array := entries::JSON[];
  
  -- Her entry için insert yap
  FOR entry IN SELECT * FROM json_array_elements(entries_array)
  LOOP
    INSERT INTO weight_tracking (
      user_id,
      weight,
      measurement_date,
      notes
    ) VALUES (
      user_id_param,
      (entry->>'weight')::DECIMAL(5,2),
      COALESCE((entry->>'measurement_date')::DATE, CURRENT_DATE),
      entry->>'notes'
    ) RETURNING id INTO entry_id;
    
    added_count := added_count + 1;
  END LOOP;

  result := json_build_object(
    'success', true,
    'added_count', added_count,
    'message', 'Bulk weight entries added successfully'
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'message', SQLERRM,
      'added_count', added_count
    );
    RETURN result;
END;
$$;

-- Toplu ağırlık verisi ekleme fonksiyonu
CREATE OR REPLACE FUNCTION bulk_add_strength_entries(
  user_id_param UUID,
  entries TEXT -- JSON string olarak gelecek
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  entry JSON;
  entry_id UUID;
  added_count INTEGER := 0;
  entries_array JSON[];
BEGIN
  -- JSON string'i parse et
  entries_array := entries::JSON[];
  
  -- Her entry için insert yap
  FOR entry IN SELECT * FROM json_array_elements(entries_array)
  LOOP
    INSERT INTO strength_tracking (
      user_id,
      exercise_name,
      max_weight,
      max_reps,
      measurement_date,
      notes
    ) VALUES (
      user_id_param,
      entry->>'exercise_name',
      (entry->>'max_weight')::DECIMAL(5,2),
      COALESCE((entry->>'max_reps')::INTEGER, 1),
      COALESCE((entry->>'measurement_date')::DATE, CURRENT_DATE),
      entry->>'notes'
    ) RETURNING id INTO entry_id;
    
    added_count := added_count + 1;
  END LOOP;

  result := json_build_object(
    'success', true,
    'added_count', added_count,
    'message', 'Bulk strength entries added successfully'
  );

  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'message', SQLERRM,
      'added_count', added_count
    );
    RETURN result;
END;
$$;

-- ============================================
-- ✅ TEMİZ KURULUM + RPC FONKSİYONLARI TAMAMLANDI!
-- ============================================

SELECT '✅ Ana kurulum ve tracking RPC fonksiyonları başarıyla oluşturuldu!' as message;
SELECT '📊 Oluşturulan RPC Fonksiyon Sayısı: 8' as function_count;
