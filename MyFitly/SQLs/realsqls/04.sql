-- ============================================
-- HAZIR PROGRAMLAR TABLOLARI
-- Bu dosyayı 03.sql'den sonra çalıştırın
-- ============================================

-- 1. Hazır Program Şablonları Tablosu
CREATE TABLE IF NOT EXISTS template_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(50) NOT NULL, -- 'Başlangıç', 'Orta', 'İleri'
  program_type VARCHAR(50) NOT NULL, -- 'Push Pull Legs', 'Split', 'Full Body', 'Upper Lower'
  days_per_week INTEGER NOT NULL,
  duration_weeks INTEGER DEFAULT 4,
  estimated_calories_per_session INTEGER,
  icon_emoji VARCHAR(10) DEFAULT '💪',
  color_hex VARCHAR(7) DEFAULT '#FF7A00',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Program Günleri Tablosu (Her program için günlük detaylar)
CREATE TABLE IF NOT EXISTS template_program_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_program_id UUID NOT NULL REFERENCES template_programs(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL, -- Hangi gün (0-6: Pazar-Cumartesi)
  day_name VARCHAR(50) NOT NULL, -- 'Push Day', 'Pull Day', 'Leg Day', vb.
  description TEXT,
  estimated_duration_minutes INTEGER,
  estimated_calories INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Şablon Egzersizleri Tablosu
CREATE TABLE IF NOT EXISTS template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_program_day_id UUID NOT NULL REFERENCES template_program_days(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sets INTEGER NOT NULL,
  reps VARCHAR(50) NOT NULL, -- '8-12', '15-20', vb.
  weight VARCHAR(50), -- '20kg', 'Vücut Ağırlığı', vb.
  rest_seconds INTEGER DEFAULT 60,
  category VARCHAR(50) DEFAULT 'Genel', -- 'Üst Vücut', 'Alt Vücut', 'Diğer'
  order_index INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- İNDEKSLER (Performans için)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_template_program_days_program_id ON template_program_days(template_program_id);
CREATE INDEX IF NOT EXISTS idx_template_exercises_day_id ON template_exercises(template_program_day_id);
CREATE INDEX IF NOT EXISTS idx_template_programs_type ON template_programs(program_type);
CREATE INDEX IF NOT EXISTS idx_template_programs_level ON template_programs(level);

-- ============================================
-- RLS AKTIF ET
-- ============================================

ALTER TABLE template_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_exercises ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLİTİKALAR (Herkes okuyabilir)
-- ============================================

-- Template Programs politikası
DROP POLICY IF EXISTS "Herkes template programları görebilir" ON template_programs;
CREATE POLICY "Herkes template programları görebilir" ON template_programs
    FOR SELECT USING (true);

-- Template Program Days politikası
DROP POLICY IF EXISTS "Herkes template program günlerini görebilir" ON template_program_days;
CREATE POLICY "Herkes template program günlerini görebilir" ON template_program_days
    FOR SELECT USING (true);

-- Template Exercises politikası
DROP POLICY IF EXISTS "Herkes template egzersizleri görebilir" ON template_exercises;
CREATE POLICY "Herkes template egzersizleri görebilir" ON template_exercises
    FOR SELECT USING (true);

-- ============================================
-- ÖRNEK HAZIR PROGRAMLAR
-- ============================================

-- PROGRAM 1: PUSH PULL LEGS (İleri Seviye)
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES 
('Push Pull Legs - İleri', '3 günlük klasik Push-Pull-Legs programı. İtme, çekme ve bacak hareketleri odaklı profesyonel program.', 'İleri', 'Push Pull Legs', 3, 8, 450, '💪', '#FF7A00');

-- Push Day (Pazartesi - Gün 1)
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Push Pull Legs - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Push Day', 'Göğüs, omuz ve triceps odaklı itme hareketleri', 75, 450 FROM prog;

-- Push Day Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Push Day' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Bench Press', 4, '8-10', '60-80kg', 'Üst Vücut', 1 FROM day
UNION ALL
SELECT id, 'Incline Dumbbell Press', 4, '10-12', '25-30kg', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Shoulder Press', 3, '10-12', '20-25kg', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Lateral Raises', 3, '12-15', '10-12kg', 'Üst Vücut', 4 FROM day
UNION ALL
SELECT id, 'Triceps Pushdown', 3, '12-15', '30kg', 'Üst Vücut', 5 FROM day;

-- Pull Day (Çarşamba - Gün 3)
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Push Pull Legs - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 3, 'Pull Day', 'Sırt, biceps ve arka omuz odaklı çekme hareketleri', 70, 420 FROM prog;

-- Pull Day Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Pull Day' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Deadlift', 4, '6-8', '100-120kg', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Barbell Row', 4, '8-10', '60-70kg', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Pull-ups', 3, '8-12', 'Vücut Ağırlığı', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Face Pulls', 3, '15-20', '20kg', 'Üst Vücut', 4 FROM day
UNION ALL
SELECT id, 'Bicep Curls', 3, '10-12', '15kg', 'Üst Vücut', 5 FROM day;

-- Leg Day (Cuma - Gün 5)
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Push Pull Legs - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 5, 'Leg Day', 'Alt vücut ve bacak odaklı yoğun antrenman', 80, 500 FROM prog;

-- Leg Day Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Leg Day' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Squat', 4, '8-10', '80-100kg', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Leg Press', 4, '12-15', '150kg', 'Alt Vücut', 2 FROM day
UNION ALL
SELECT id, 'Romanian Deadlift', 3, '10-12', '60kg', 'Alt Vücut', 3 FROM day
UNION ALL
SELECT id, 'Leg Curl', 3, '12-15', '40kg', 'Alt Vücut', 4 FROM day
UNION ALL
SELECT id, 'Calf Raises', 4, '15-20', '50kg', 'Alt Vücut', 5 FROM day;

-- PROGRAM 2: FULL BODY (Başlangıç Seviyesi)
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES 
('Full Body - Başlangıç', 'Haftada 3 gün tüm vücut çalışan başlangıç seviyesi program. Yeni başlayanlar için ideal.', 'Başlangıç', 'Full Body', 3, 6, 300, '🔥', '#00D084');

-- Full Body Day 1 (Pazartesi)
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Full Body - Başlangıç' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Full Body A', 'Temel bileşik hareketler ile tüm vücut', 50, 300 FROM prog;

WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Full Body A' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Goblet Squat', 3, '10-12', '12kg', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Dumbbell Bench Press', 3, '10-12', '12-15kg', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Lat Pulldown', 3, '10-12', '30kg', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Plank', 3, '30-45sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Full Body Day 2 (Çarşamba)
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Full Body - Başlangıç' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 3, 'Full Body B', 'Farklı egzersizler ile tüm vücut', 50, 300 FROM prog;

WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Full Body B' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Bulgarian Split Squat', 3, '8-10', 'Vücut Ağırlığı', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Dumbbell Row', 3, '10-12', '12-15kg', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Overhead Press', 3, '8-10', '10-12kg', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Mountain Climbers', 3, '20-30', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Full Body Day 3 (Cuma)
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Full Body - Başlangıç' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 5, 'Full Body C', 'Kardiyo ve güç kombinasyonu', 45, 350 FROM prog;

WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Full Body C' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Walking Lunges', 3, '10-12', 'Vücut Ağırlığı', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Push-ups', 3, '8-15', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Russian Twists', 3, '20-30', 'Vücut Ağırlığı', 'Diğer', 3 FROM day
UNION ALL
SELECT id, 'Burpees', 3, '5-10', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- PROGRAM 3: UPPER LOWER SPLIT (Orta Seviye)
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES 
('Upper Lower Split - Orta', 'Haftada 4 gün üst vücut ve alt vücut ayrımı yapan orta seviye program.', 'Orta', 'Upper Lower', 4, 6, 400, '🏋️', '#8A2BE2');

-- Upper Day 1 (Pazartesi)
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Upper Lower Split - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Upper A', 'Göğüs, sırt ve omuz odaklı üst vücut', 65, 400 FROM prog;

WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Upper A' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Incline Bench Press', 4, '8-10', '50-70kg', 'Üst Vücut', 1 FROM day
UNION ALL
SELECT id, 'Bent Over Row', 4, '8-10', '40-50kg', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Military Press', 3, '8-10', '25-35kg', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Lat Pulldown', 3, '10-12', '35-45kg', 'Üst Vücut', 4 FROM day
UNION ALL
SELECT id, 'Dips', 3, '8-12', 'Vücut Ağırlığı', 'Üst Vücut', 5 FROM day;

-- Lower Day 1 (Salı)
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Upper Lower Split - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 2, 'Lower A', 'Squat ve deadlift odaklı alt vücut', 70, 450 FROM prog;

WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Lower A' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Back Squat', 4, '6-8', '70-90kg', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Romanian Deadlift', 4, '8-10', '60-80kg', 'Alt Vücut', 2 FROM day
UNION ALL
SELECT id, 'Walking Lunges', 3, '10-12', '20kg', 'Alt Vücut', 3 FROM day
UNION ALL
SELECT id, 'Leg Press', 3, '12-15', '120-150kg', 'Alt Vücut', 4 FROM day
UNION ALL
SELECT id, 'Standing Calf Raises', 4, '15-20', '40kg', 'Alt Vücut', 5 FROM day;

-- Upper Day 2 (Perşembe)
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Upper Lower Split - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 4, 'Upper B', 'Farklı açılar ve hareketler ile üst vücut', 65, 400 FROM prog;

WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Upper B' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Flat Dumbbell Press', 4, '10-12', '20-25kg', 'Üst Vücut', 1 FROM day
UNION ALL
SELECT id, 'Pull-ups', 4, '6-10', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Lateral Raises', 3, '12-15', '8-12kg', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Cable Rows', 3, '10-12', '30-40kg', 'Üst Vücut', 4 FROM day
UNION ALL
SELECT id, 'Hammer Curls', 3, '10-12', '12-15kg', 'Üst Vücut', 5 FROM day;

-- Lower Day 2 (Cuma)
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Upper Lower Split - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 5, 'Lower B', 'Hip thrust ve single leg odaklı alt vücut', 65, 400 FROM prog;

WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Lower B' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Hip Thrust', 4, '10-12', '40-60kg', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Bulgarian Split Squat', 3, '8-10', '15-20kg', 'Alt Vücut', 2 FROM day
UNION ALL
SELECT id, 'Leg Curl', 3, '12-15', '25-35kg', 'Alt Vücut', 3 FROM day
UNION ALL
SELECT id, 'Step-ups', 3, '10-12', '15-20kg', 'Alt Vücut', 4 FROM day
UNION ALL
SELECT id, 'Seated Calf Raises', 4, '15-20', '30kg', 'Alt Vücut', 5 FROM day;

-- ============================================
-- ✅ HAZIR PROGRAMLAR TAMAMLANDI!
-- ============================================




















