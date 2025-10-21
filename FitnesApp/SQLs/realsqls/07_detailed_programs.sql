-- ============================================
-- YENİ HAZIR PROGRAMLAR - GÜNCELLENMİŞ VERSİYON
-- Tüm egzersizler detaylı ve düzenli
-- ============================================

-- Template tablolarını oluştur
CREATE TABLE IF NOT EXISTS template_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    level TEXT,
    program_type TEXT,
    days_per_week INTEGER,
    duration_weeks INTEGER,
    estimated_calories_per_session INTEGER,
    icon_emoji TEXT,
    color_hex TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mevcut template_programs tablosuna is_active sütunu ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'template_programs' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE template_programs ADD COLUMN is_active BOOLEAN DEFAULT true;
    RAISE NOTICE '✅ template_programs.is_active sütunu eklendi';
  ELSE
    RAISE NOTICE 'ℹ️ template_programs.is_active sütunu zaten mevcut';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS template_program_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_program_id UUID REFERENCES template_programs(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    day_name TEXT,
    description TEXT,
    estimated_duration_minutes INTEGER,
    estimated_calories INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS template_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_program_day_id UUID REFERENCES template_program_days(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sets INTEGER,
    reps TEXT,
    weight TEXT,
    category TEXT,
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 🟢 BAŞLANGIÇ SEVİYESİ (6 Program)
-- ============================================

-- PROGRAM 1: HIIT Starter Blaze
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('HIIT Starter Blaze', 'EN: Fat burning + cardio conditioning. TR: Yağ yakımı + kondisyon.', 'Başlangıç', 'HIIT', 3, 4, 280, '🔥', '#00D084');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'HIIT Starter Blaze' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Jumping Jacks, Bodyweight Squat, Mountain Climber, Plank. TR: Jumping Jacks, Vücut Ağırlığı Squat, Mountain Climber, Plank.', 35, 280 FROM prog
UNION ALL SELECT id, 2, 'Çarşamba', 'EN: High Knees, Lunges, Push Up (modifiye), Glute Bridge, Shoulder Tap. TR: High Knees, Lunges, Push Up (modifiye), Glute Bridge, Shoulder Tap.', 40, 280 FROM prog
UNION ALL SELECT id, 3, 'Cuma', 'EN: Jump Rope, Squat to Calf Raise, Mountain Climber, Side Plank. TR: İp Atlama, Squat to Calf Raise, Mountain Climber, Side Plank.', 35, 280 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'HIIT Starter Blaze' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Jumping Jacks', 3, '30 sn', 'bodyweight', 'Cardio', 1 FROM d1
UNION ALL SELECT id, 'Bodyweight Squat', 3, '15', '0 kg', 'Alt Vücut', 2 FROM d1
UNION ALL SELECT id, 'Mountain Climber', 3, '20 sn', 'bodyweight', 'Core', 3 FROM d1
UNION ALL SELECT id, 'Plank', 3, '20 sn', 'bodyweight', 'Core', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Çarşamba' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'HIIT Starter Blaze' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'High Knees', 3, '30 sn', 'bodyweight', 'Cardio', 1 FROM d2
UNION ALL SELECT id, 'Lunges', 3, '10/bacak', '0-4 kg', 'Alt Vücut', 2 FROM d2
UNION ALL SELECT id, 'Push Up (modifiye)', 3, '10', 'bodyweight', 'Üst Vücut', 3 FROM d2
UNION ALL SELECT id, 'Glute Bridge', 3, '12', 'bodyweight', 'Alt Vücut', 4 FROM d2
UNION ALL SELECT id, 'Shoulder Tap', 3, '20 sn', 'bodyweight', 'Core', 5 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'HIIT Starter Blaze' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Jump Rope', 3, '30 sn', 'bodyweight', 'Cardio', 1 FROM d3
UNION ALL SELECT id, 'Squat to Calf Raise', 3, '12', '0 kg', 'Alt Vücut', 2 FROM d3
UNION ALL SELECT id, 'Mountain Climber', 3, '30 sn', 'bodyweight', 'Core', 3 FROM d3
UNION ALL SELECT id, 'Side Plank', 3, '20 sn/taraf', 'bodyweight', 'Core', 4 FROM d3;

-- PROGRAM 2: Base Power Builder
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Base Power Builder', 'EN: Basic strength + form. TR: Temel kuvvet + form.', 'Başlangıç', 'Strength', 3, 4, 300, '💪', '#00D084');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Base Power Builder' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Full body strength. TR: Tüm vücut kuvvet.', 45, 300 FROM prog
UNION ALL SELECT id, 2, 'Çarşamba', 'EN: Basic compounds. TR: Temel hareketler.', 45, 300 FROM prog
UNION ALL SELECT id, 3, 'Cuma', 'EN: Lower + upper. TR: Alt + üst vücut.', 45, 300 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Base Power Builder' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Goblet Squat', 3, '12', '12 kg', 'Alt Vücut', 1 FROM d1
UNION ALL SELECT id, 'Dumbbell Bench Press', 3, '12', '10 kg × 2', 'Üst Vücut', 2 FROM d1
UNION ALL SELECT id, 'Lat Pulldown', 3, '12', '30 kg', 'Üst Vücut', 3 FROM d1
UNION ALL SELECT id, 'Plank', 3, '30 sn', 'bodyweight', 'Core', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Çarşamba' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Base Power Builder' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Bodyweight Squat', 3, '15', 'bodyweight', 'Alt Vücut', 1 FROM d2
UNION ALL SELECT id, 'Push Up', 3, '10', 'bodyweight', 'Üst Vücut', 2 FROM d2
UNION ALL SELECT id, 'Seated Row', 3, '12', '25 kg', 'Üst Vücut', 3 FROM d2
UNION ALL SELECT id, 'Crunch', 3, '15', 'bodyweight', 'Core', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Base Power Builder' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Lunges', 3, '12', '5 kg × 2', 'Alt Vücut', 1 FROM d3
UNION ALL SELECT id, 'Shoulder Press', 3, '12', '8 kg × 2', 'Üst Vücut', 2 FROM d3
UNION ALL SELECT id, 'Back Extension', 3, '15', 'bodyweight', 'Üst Vücut', 3 FROM d3
UNION ALL SELECT id, 'Side Plank', 3, '30 sn', 'bodyweight', 'Core', 4 FROM d3;

-- PROGRAM 3: Upper Sculpt Starter
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Upper Sculpt Starter', 'EN: Upper body strength. TR: Üst vücut güçlenmesi.', 'Başlangıç', 'Upper Body', 3, 4, 270, '🏋️', '#00D084');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Upper Sculpt Starter' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Push focused. TR: İtme odaklı.', 40, 270 FROM prog
UNION ALL SELECT id, 2, 'Çarşamba', 'EN: Pull focused. TR: Çekme odaklı.', 40, 270 FROM prog
UNION ALL SELECT id, 3, 'Cuma', 'EN: Upper + core. TR: Üst vücut + core.', 40, 270 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Upper Sculpt Starter' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Push Up', 3, '10', 'bodyweight', 'Üst Vücut', 1 FROM d1
UNION ALL SELECT id, 'Shoulder Press', 3, '12', '8 kg × 2', 'Üst Vücut', 2 FROM d1
UNION ALL SELECT id, 'Plank', 3, '30 sn', 'bodyweight', 'Core', 3 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Çarşamba' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Upper Sculpt Starter' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Dumbbell Row', 3, '12', '10 kg × 2', 'Üst Vücut', 1 FROM d2
UNION ALL SELECT id, 'Dumbbell Curl', 3, '12', '6-8 kg', 'Üst Vücut', 2 FROM d2
UNION ALL SELECT id, 'Side Plank', 3, '30 sn', 'bodyweight', 'Core', 3 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Upper Sculpt Starter' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Lat Pulldown', 3, '12', '30 kg', 'Üst Vücut', 1 FROM d3
UNION ALL SELECT id, 'Crunch', 3, '15', 'bodyweight', 'Core', 2 FROM d3
UNION ALL SELECT id, 'Superman Hold', 3, '30 sn', 'bodyweight', 'Core', 3 FROM d3
UNION ALL SELECT id, 'Mountain Climber', 3, '30 sn', 'bodyweight', 'Core', 4 FROM d3;

-- PROGRAM 4: Lower Shape Lite
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Lower Shape Lite', 'EN: Legs + glutes shaping. TR: Bacak + kalça şekillendirme.', 'Başlangıç', 'Lower Body', 3, 4, 290, '🦵', '#00D084');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Lower Shape Lite' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Basic lower body. TR: Temel alt vücut.', 45, 290 FROM prog
UNION ALL SELECT id, 2, 'Çarşamba', 'EN: Glute focused. TR: Kalça odaklı.', 45, 290 FROM prog
UNION ALL SELECT id, 3, 'Cuma', 'EN: Lower + cardio. TR: Alt vücut + kardiyo.', 45, 290 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Lower Shape Lite' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Bodyweight Squat', 3, '15', 'bodyweight', 'Alt Vücut', 1 FROM d1
UNION ALL SELECT id, 'Lunges', 3, '12', '0-5 kg', 'Alt Vücut', 2 FROM d1
UNION ALL SELECT id, 'Glute Bridge', 3, '12', 'bodyweight', 'Alt Vücut', 3 FROM d1
UNION ALL SELECT id, 'Calf Raise', 3, '15', 'bodyweight', 'Alt Vücut', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Çarşamba' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Lower Shape Lite' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Step Up', 3, '10/bacak', '0 kg', 'Alt Vücut', 1 FROM d2
UNION ALL SELECT id, 'Side Lunge', 3, '12', '0 kg', 'Alt Vücut', 2 FROM d2
UNION ALL SELECT id, 'Wall Sit', 3, '30 sn', 'bodyweight', 'Alt Vücut', 3 FROM d2
UNION ALL SELECT id, 'Plank', 3, '30 sn', 'bodyweight', 'Core', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Lower Shape Lite' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Sumo Squat', 3, '12', '8 kg', 'Alt Vücut', 1 FROM d3
UNION ALL SELECT id, 'Hip Thrust', 3, '12', '10 kg', 'Alt Vücut', 2 FROM d3
UNION ALL SELECT id, 'Jumping Jack', 3, '30 sn', 'bodyweight', 'Cardio', 3 FROM d3
UNION ALL SELECT id, 'Side Plank', 3, '20 sn', 'bodyweight', 'Core', 4 FROM d3;

-- PROGRAM 5: Core Burn Basic
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Core Burn Basic', 'EN: Core + cardio. TR: Core + kardiyo.', 'Başlangıç', 'Core', 3, 4, 250, '🧘', '#00D084');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Core Burn Basic' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Core + cardio mix. TR: Core + kardiyo karışımı.', 35, 250 FROM prog
UNION ALL SELECT id, 2, 'Çarşamba', 'EN: Core stability. TR: Core stabilite.', 35, 250 FROM prog
UNION ALL SELECT id, 3, 'Cuma', 'EN: Core endurance. TR: Core dayanıklılık.', 35, 250 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Core Burn Basic' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Jumping Jack', 3, '30 sn', 'bodyweight', 'Cardio', 1 FROM d1
UNION ALL SELECT id, 'Crunch', 3, '15', 'bodyweight', 'Core', 2 FROM d1
UNION ALL SELECT id, 'Leg Raise', 3, '12', 'bodyweight', 'Core', 3 FROM d1
UNION ALL SELECT id, 'Plank', 3, '30 sn', 'bodyweight', 'Core', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Çarşamba' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Core Burn Basic' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'March in Place', 3, '1 dk', 'bodyweight', 'Cardio', 1 FROM d2
UNION ALL SELECT id, 'Side Crunch', 3, '15', 'bodyweight', 'Core', 2 FROM d2
UNION ALL SELECT id, 'Glute Bridge', 3, '12', 'bodyweight', 'Alt Vücut', 3 FROM d2
UNION ALL SELECT id, 'Mountain Climber', 3, '20 sn', 'bodyweight', 'Core', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Core Burn Basic' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'High Knees', 3, '30 sn', 'bodyweight', 'Cardio', 1 FROM d3
UNION ALL SELECT id, 'Flutter Kicks', 3, '20 sn', 'bodyweight', 'Core', 2 FROM d3
UNION ALL SELECT id, 'Superman Hold', 3, '30 sn', 'bodyweight', 'Core', 3 FROM d3
UNION ALL SELECT id, 'Plank', 3, '30 sn', 'bodyweight', 'Core', 4 FROM d3;

-- PROGRAM 6: Flex Flow Start
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Flex Flow Start', 'EN: Mobility + flexibility. TR: Mobilite + esneklik.', 'Başlangıç', 'Mobility', 3, 4, 200, '🧘', '#00D084');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Flex Flow Start' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Hip mobility. TR: Kalça mobilitesi.', 30, 200 FROM prog
UNION ALL SELECT id, 2, 'Çarşamba', 'EN: Full body stretch. TR: Tüm vücut esneme.', 30, 200 FROM prog
UNION ALL SELECT id, 3, 'Cuma', 'EN: Deep stretch. TR: Derin esneme.', 30, 200 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Flex Flow Start' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Hip Opener Stretch', 3, '30 sn', 'bodyweight', 'Esneme', 1 FROM d1
UNION ALL SELECT id, 'Cat-Cow', 3, '30 sn', 'bodyweight', 'Esneme', 2 FROM d1
UNION ALL SELECT id, 'Side Bend', 3, '20 sn', 'bodyweight', 'Esneme', 3 FROM d1
UNION ALL SELECT id, 'Downward Dog', 3, '30 sn', 'bodyweight', 'Esneme', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Çarşamba' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Flex Flow Start' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Hip Flexor Stretch', 3, '30 sn', 'bodyweight', 'Esneme', 1 FROM d2
UNION ALL SELECT id, 'Shoulder Stretch', 3, '30 sn', 'bodyweight', 'Esneme', 2 FROM d2
UNION ALL SELECT id, 'Bird Dog', 3, '20 sn', 'bodyweight', 'Core', 3 FROM d2
UNION ALL SELECT id, 'Child''s Pose', 3, '30 sn', 'bodyweight', 'Esneme', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Flex Flow Start' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Standing Toe Touch', 3, '20 sn', 'bodyweight', 'Esneme', 1 FROM d3
UNION ALL SELECT id, 'Seated Twist', 3, '20 sn', 'bodyweight', 'Esneme', 2 FROM d3
UNION ALL SELECT id, 'Cobra Stretch', 3, '30 sn', 'bodyweight', 'Esneme', 3 FROM d3
UNION ALL SELECT id, 'Deep Lunge Stretch', 3, '30 sn', 'bodyweight', 'Esneme', 4 FROM d3;

-- Devam edecek... (Dosya boyutu nedeniyle parça 2'de devam)
-- ============================================
-- 🟡 ORTA SEVİYE (6 Program)
-- ============================================

-- PROGRAM 7: Hybrid Strength 1.0
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Hybrid Strength 1.0', 'EN: Full body strength. TR: Tüm vücut güç.', 'Orta', 'Strength', 4, 4, 400, '⚔️', '#FF7A00');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Hybrid Strength 1.0' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Compound lifts. TR: Çok eklemli hareketler.', 60, 400 FROM prog
UNION ALL SELECT id, 2, 'Salı', 'EN: Power day. TR: Güç günü.', 60, 400 FROM prog
UNION ALL SELECT id, 3, 'Perşembe', 'EN: Hypertrophy. TR: Hipertrofi.', 55, 400 FROM prog
UNION ALL SELECT id, 4, 'Cuma', 'EN: HIIT finisher. TR: HIIT bitirici.', 50, 400 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Hybrid Strength 1.0' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Barbell Squat', 4, '8', '50-70 kg', 'Alt Vücut', 1 FROM d1
UNION ALL SELECT id, 'Bench Press', 4, '8', '40-60 kg', 'Üst Vücut', 2 FROM d1
UNION ALL SELECT id, 'Lat Pulldown', 4, '10', '40 kg', 'Üst Vücut', 3 FROM d1
UNION ALL SELECT id, 'Plank', 4, '45 sn', 'bodyweight', 'Core', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Salı' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Hybrid Strength 1.0' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Deadlift', 4, '8', '60-80 kg', 'Alt Vücut', 1 FROM d2
UNION ALL SELECT id, 'Shoulder Press', 4, '10', '25 kg', 'Üst Vücut', 2 FROM d2
UNION ALL SELECT id, 'Seated Row', 4, '10', '35 kg', 'Üst Vücut', 3 FROM d2
UNION ALL SELECT id, 'Leg Raise', 3, '15', 'bodyweight', 'Core', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Perşembe' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Hybrid Strength 1.0' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Lunges', 4, '12', '10 kg × 2', 'Alt Vücut', 1 FROM d3
UNION ALL SELECT id, 'Push Up', 4, '15', 'bodyweight', 'Üst Vücut', 2 FROM d3
UNION ALL SELECT id, 'Dumbbell Curl', 4, '12', '10 kg', 'Üst Vücut', 3 FROM d3
UNION ALL SELECT id, 'Side Plank', 3, '45 sn', 'bodyweight', 'Core', 4 FROM d3;

WITH d4 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Hybrid Strength 1.0' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Jump Rope', 3, '1 dk', 'bodyweight', 'Cardio', 1 FROM d4
UNION ALL SELECT id, 'Burpees', 3, '15', 'bodyweight', 'Cardio', 2 FROM d4
UNION ALL SELECT id, 'Bicycle Crunch', 3, '20', 'bodyweight', 'Core', 3 FROM d4
UNION ALL SELECT id, 'Mountain Climber', 3, '30 sn', 'bodyweight', 'Core', 4 FROM d4;

-- PROGRAM 8: Push Pull Boost
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Push Pull Boost', 'EN: Push Pull Legs split. TR: Push Pull Legs bölünmesi.', 'Orta', 'PPL', 3, 4, 420, '💪', '#FF7A00');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Push Pull Boost' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi (Push)', 'EN: Push day. TR: İtme günü.', 60, 420 FROM prog
UNION ALL SELECT id, 2, 'Çarşamba (Pull)', 'EN: Pull day. TR: Çekme günü.', 60, 420 FROM prog
UNION ALL SELECT id, 3, 'Cuma (Legs)', 'EN: Legs day. TR: Bacak günü.', 60, 420 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi (Push)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Push Pull Boost' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Bench Press', 4, '8', '40-60 kg', 'Üst Vücut', 1 FROM d1
UNION ALL SELECT id, 'Shoulder Press', 4, '10', '20-30 kg', 'Üst Vücut', 2 FROM d1
UNION ALL SELECT id, 'Dips', 3, '12', 'bodyweight', 'Üst Vücut', 3 FROM d1
UNION ALL SELECT id, 'Push Up', 3, '15', 'bodyweight', 'Üst Vücut', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Çarşamba (Pull)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Push Pull Boost' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Deadlift', 4, '8', '60-80 kg', 'Alt Vücut', 1 FROM d2
UNION ALL SELECT id, 'Lat Pulldown', 4, '10', '40-50 kg', 'Üst Vücut', 2 FROM d2
UNION ALL SELECT id, 'Barbell Curl', 3, '12', '20 kg', 'Üst Vücut', 3 FROM d2
UNION ALL SELECT id, 'Face Pull', 3, '15', '25 kg', 'Üst Vücut', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma (Legs)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Push Pull Boost' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Squat', 4, '8', '50-70 kg', 'Alt Vücut', 1 FROM d3
UNION ALL SELECT id, 'Lunges', 3, '12', '10 kg × 2', 'Alt Vücut', 2 FROM d3
UNION ALL SELECT id, 'Leg Press', 4, '10', '90-120 kg', 'Alt Vücut', 3 FROM d3
UNION ALL SELECT id, 'Plank', 3, '45 sn', 'bodyweight', 'Core', 4 FROM d3;

-- PROGRAM 9: Upper Lower Pro
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Upper Lower Pro', 'EN: Upper lower split. TR: Üst alt bölünme.', 'Orta', 'Upper/Lower', 4, 4, 380, '🏋️', '#FF7A00');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Upper Lower Pro' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi (Upper)', 'EN: Upper body. TR: Üst vücut.', 55, 380 FROM prog
UNION ALL SELECT id, 2, 'Salı (Lower)', 'EN: Lower body. TR: Alt vücut.', 55, 380 FROM prog
UNION ALL SELECT id, 3, 'Perşembe (Upper)', 'EN: Upper body B. TR: Üst vücut B.', 55, 380 FROM prog
UNION ALL SELECT id, 4, 'Cuma (Lower)', 'EN: Lower body B. TR: Alt vücut B.', 55, 380 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi (Upper)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Upper Lower Pro' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Bench Press', 4, '8', '50 kg', 'Üst Vücut', 1 FROM d1
UNION ALL SELECT id, 'Seated Row', 4, '10', '40 kg', 'Üst Vücut', 2 FROM d1
UNION ALL SELECT id, 'Shoulder Press', 4, '10', '25 kg', 'Üst Vücut', 3 FROM d1
UNION ALL SELECT id, 'Plank', 3, '45 sn', 'bodyweight', 'Core', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Salı (Lower)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Upper Lower Pro' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Squat', 4, '8', '60 kg', 'Alt Vücut', 1 FROM d2
UNION ALL SELECT id, 'Leg Press', 4, '10', '100 kg', 'Alt Vücut', 2 FROM d2
UNION ALL SELECT id, 'Romanian Deadlift', 4, '10', '50 kg', 'Alt Vücut', 3 FROM d2
UNION ALL SELECT id, 'Calf Raise', 3, '15', 'bodyweight', 'Alt Vücut', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Perşembe (Upper)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Upper Lower Pro' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Incline Bench Press', 4, '8', '50 kg', 'Üst Vücut', 1 FROM d3
UNION ALL SELECT id, 'Lat Pulldown', 4, '10', '40 kg', 'Üst Vücut', 2 FROM d3
UNION ALL SELECT id, 'Dumbbell Curl', 3, '12', '10 kg', 'Üst Vücut', 3 FROM d3
UNION ALL SELECT id, 'Side Plank', 3, '30 sn', 'bodyweight', 'Core', 4 FROM d3;

WITH d4 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma (Lower)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Upper Lower Pro' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Lunges', 4, '12', '10 kg × 2', 'Alt Vücut', 1 FROM d4
UNION ALL SELECT id, 'Deadlift', 4, '8', '70 kg', 'Alt Vücut', 2 FROM d4
UNION ALL SELECT id, 'Leg Extension', 3, '15', '30 kg', 'Alt Vücut', 3 FROM d4
UNION ALL SELECT id, 'Jump Rope', 3, '1 dk', 'bodyweight', 'Cardio', 4 FROM d4;

-- PROGRAM 10: Cardio Core Storm
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Cardio Core Storm', 'EN: Cardio + core blast. TR: Kardiyo + core patlaması.', 'Orta', 'Cardio/Core', 3, 4, 350, '🔥', '#FF7A00');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Cardio Core Storm' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Cardio core mix. TR: Kardiyo core karışım.', 45, 350 FROM prog
UNION ALL SELECT id, 2, 'Çarşamba', 'EN: Core stability. TR: Core stabilite.', 45, 350 FROM prog
UNION ALL SELECT id, 3, 'Cuma', 'EN: HIIT core. TR: HIIT core.', 45, 350 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Cardio Core Storm' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Jump Rope', 3, '1 dk', 'bodyweight', 'Cardio', 1 FROM d1
UNION ALL SELECT id, 'Mountain Climber', 3, '30 sn', 'bodyweight', 'Core', 2 FROM d1
UNION ALL SELECT id, 'Plank', 4, '45 sn', 'bodyweight', 'Core', 3 FROM d1
UNION ALL SELECT id, 'Russian Twist', 3, '20', 'bodyweight', 'Core', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Çarşamba' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Cardio Core Storm' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'High Knees', 3, '45 sn', 'bodyweight', 'Cardio', 1 FROM d2
UNION ALL SELECT id, 'Leg Raise', 3, '15', 'bodyweight', 'Core', 2 FROM d2
UNION ALL SELECT id, 'Superman Hold', 3, '45 sn', 'bodyweight', 'Core', 3 FROM d2
UNION ALL SELECT id, 'Bicycle Crunch', 3, '20', 'bodyweight', 'Core', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Cardio Core Storm' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Burpees', 3, '15', 'bodyweight', 'Cardio', 1 FROM d3
UNION ALL SELECT id, 'Flutter Kicks', 3, '30 sn', 'bodyweight', 'Core', 2 FROM d3
UNION ALL SELECT id, 'Side Plank', 3, '45 sn', 'bodyweight', 'Core', 3 FROM d3
UNION ALL SELECT id, 'Plank', 3, '45 sn', 'bodyweight', 'Core', 4 FROM d3;

-- PROGRAM 11: Functional Warrior
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Functional Warrior', 'EN: Functional training. TR: Fonksiyonel antrenman.', 'Orta', 'Functional', 3, 4, 360, '⚔️', '#FF7A00');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Functional Warrior' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Power movements. TR: Güç hareketleri.', 50, 360 FROM prog
UNION ALL SELECT id, 2, 'Çarşamba', 'EN: Compound lifts. TR: Çok eklemli.', 50, 360 FROM prog
UNION ALL SELECT id, 3, 'Cuma', 'EN: Metabolic finisher. TR: Metabolik bitirici.', 50, 360 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Functional Warrior' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Kettlebell Swing', 3, '15', '12 kg', 'Alt Vücut', 1 FROM d1
UNION ALL SELECT id, 'Deadlift', 4, '8', '60 kg', 'Alt Vücut', 2 FROM d1
UNION ALL SELECT id, 'Overhead Press', 3, '10', '25 kg', 'Üst Vücut', 3 FROM d1
UNION ALL SELECT id, 'Plank', 4, '45 sn', 'bodyweight', 'Core', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Çarşamba' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Functional Warrior' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Goblet Squat', 4, '10', '16 kg', 'Alt Vücut', 1 FROM d2
UNION ALL SELECT id, 'Row', 4, '10', '30 kg', 'Üst Vücut', 2 FROM d2
UNION ALL SELECT id, 'Push Up', 3, '15', 'bodyweight', 'Üst Vücut', 3 FROM d2
UNION ALL SELECT id, 'Russian Twist', 3, '20', '5 kg', 'Core', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Functional Warrior' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Lunges', 4, '12', '10 kg × 2', 'Alt Vücut', 1 FROM d3
UNION ALL SELECT id, 'Shoulder Press', 4, '10', '20 kg × 2', 'Üst Vücut', 2 FROM d3
UNION ALL SELECT id, 'Mountain Climber', 3, '30 sn', 'bodyweight', 'Core', 3 FROM d3
UNION ALL SELECT id, 'Leg Raise', 3, '15', 'bodyweight', 'Core', 4 FROM d3;

-- PROGRAM 12: HIIT Blaze 2.0
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('HIIT Blaze 2.0', 'EN: Intense HIIT workout. TR: Yoğun HIIT antrenmanı.', 'Orta', 'HIIT', 3, 4, 400, '🔥', '#FF7A00');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'HIIT Blaze 2.0' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: HIIT explosion. TR: HIIT patlaması.', 40, 400 FROM prog
UNION ALL SELECT id, 2, 'Çarşamba', 'EN: Cardio strength. TR: Kardiyo güç.', 40, 400 FROM prog
UNION ALL SELECT id, 3, 'Cuma', 'EN: Full body burn. TR: Tüm vücut yakım.', 40, 400 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'HIIT Blaze 2.0' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Burpees', 3, '15', 'bodyweight', 'Cardio', 1 FROM d1
UNION ALL SELECT id, 'Squat Jump', 3, '15', 'bodyweight', 'Alt Vücut', 2 FROM d1
UNION ALL SELECT id, 'High Knees', 3, '30 sn', 'bodyweight', 'Cardio', 3 FROM d1
UNION ALL SELECT id, 'Plank', 3, '45 sn', 'bodyweight', 'Core', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Çarşamba' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'HIIT Blaze 2.0' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Jump Rope', 3, '1 dk', 'bodyweight', 'Cardio', 1 FROM d2
UNION ALL SELECT id, 'Lunges', 3, '12', '10 kg × 2', 'Alt Vücut', 2 FROM d2
UNION ALL SELECT id, 'Push Up', 3, '15', 'bodyweight', 'Üst Vücut', 3 FROM d2
UNION ALL SELECT id, 'Mountain Climber', 3, '30 sn', 'bodyweight', 'Core', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'HIIT Blaze 2.0' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Jumping Jack', 3, '30 sn', 'bodyweight', 'Cardio', 1 FROM d3
UNION ALL SELECT id, 'Squat', 3, '15', '20 kg', 'Alt Vücut', 2 FROM d3
UNION ALL SELECT id, 'Shoulder Tap', 3, '30 sn', 'bodyweight', 'Core', 3 FROM d3
UNION ALL SELECT id, 'Side Plank', 3, '30 sn', 'bodyweight', 'Core', 4 FROM d3;


-- ============================================
-- 🔴 İLERİ SEVİYE (6 Program)
-- ============================================

-- PROGRAM 13: PPL Intense
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('PPL Intense', 'EN: Advanced Push Pull Legs. TR: İleri seviye PPL.', 'İleri', 'PPL', 5, 4, 500, '💪', '#FF4757');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'PPL Intense' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi (Push)', 'EN: Heavy push. TR: Ağır itme.', 70, 500 FROM prog
UNION ALL SELECT id, 2, 'Salı (Pull)', 'EN: Heavy pull. TR: Ağır çekme.', 70, 500 FROM prog
UNION ALL SELECT id, 3, 'Çarşamba (Legs)', 'EN: Heavy legs. TR: Ağır bacak.', 70, 500 FROM prog
UNION ALL SELECT id, 4, 'Cuma (Push B)', 'EN: Push volume. TR: İtme hacmi.', 65, 500 FROM prog
UNION ALL SELECT id, 5, 'Cumartesi (Pull B)', 'EN: Pull volume. TR: Çekme hacmi.', 65, 500 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi (Push)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'PPL Intense' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Bench Press', 5, '6', '60-90 kg', 'Üst Vücut', 1 FROM d1
UNION ALL SELECT id, 'Overhead Press', 4, '8', '30-40 kg', 'Üst Vücut', 2 FROM d1
UNION ALL SELECT id, 'Dips', 4, '12', 'bodyweight', 'Üst Vücut', 3 FROM d1
UNION ALL SELECT id, 'Push Up', 3, '20', 'bodyweight', 'Üst Vücut', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Salı (Pull)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'PPL Intense' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Deadlift', 5, '5', '80-110 kg', 'Alt Vücut', 1 FROM d2
UNION ALL SELECT id, 'Pull Up', 4, '8', 'bodyweight', 'Üst Vücut', 2 FROM d2
UNION ALL SELECT id, 'Barbell Row', 4, '10', '50-60 kg', 'Üst Vücut', 3 FROM d2
UNION ALL SELECT id, 'Face Pull', 3, '15', '30 kg', 'Üst Vücut', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Çarşamba (Legs)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'PPL Intense' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Back Squat', 5, '6', '80-100 kg', 'Alt Vücut', 1 FROM d3
UNION ALL SELECT id, 'Leg Press', 4, '10', '140-180 kg', 'Alt Vücut', 2 FROM d3
UNION ALL SELECT id, 'Lunges', 3, '12', '15 kg × 2', 'Alt Vücut', 3 FROM d3
UNION ALL SELECT id, 'Calf Raise', 3, '20', 'bodyweight', 'Alt Vücut', 4 FROM d3;

WITH d4 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma (Push B)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'PPL Intense' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Incline Bench Press', 4, '8', '60-80 kg', 'Üst Vücut', 1 FROM d4
UNION ALL SELECT id, 'Dumbbell Shoulder Press', 4, '10', '20 kg × 2', 'Üst Vücut', 2 FROM d4
UNION ALL SELECT id, 'Dips', 3, '12', 'bodyweight', 'Üst Vücut', 3 FROM d4
UNION ALL SELECT id, 'Push Up', 3, '20', 'bodyweight', 'Üst Vücut', 4 FROM d4;

WITH d5 AS (SELECT id FROM template_program_days WHERE day_name = 'Cumartesi (Pull B)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'PPL Intense' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Romanian Deadlift', 5, '5', '90-110 kg', 'Alt Vücut', 1 FROM d5
UNION ALL SELECT id, 'Dumbbell Curl', 3, '12', '12 kg', 'Üst Vücut', 2 FROM d5
UNION ALL SELECT id, 'Pull Up', 4, '10', 'bodyweight', 'Üst Vücut', 3 FROM d5
UNION ALL SELECT id, 'Face Pull', 3, '15', '30 kg', 'Üst Vücut', 4 FROM d5;

-- PROGRAM 14: Iron Core Strength
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Iron Core Strength', 'EN: Strength + core power. TR: Güç + core kuvvet.', 'İleri', 'Strength', 4, 4, 480, '🏋️', '#FF4757');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Iron Core Strength' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Heavy compound. TR: Ağır çok eklemli.', 70, 480 FROM prog
UNION ALL SELECT id, 2, 'Salı', 'EN: Strength pull. TR: Güç çekme.', 70, 480 FROM prog
UNION ALL SELECT id, 3, 'Perşembe', 'EN: Power day. TR: Güç günü.', 65, 480 FROM prog
UNION ALL SELECT id, 4, 'Cuma', 'EN: HIIT core. TR: HIIT core.', 50, 480 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Iron Core Strength' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Squat', 5, '5', '90 kg', 'Alt Vücut', 1 FROM d1
UNION ALL SELECT id, 'Bench Press', 5, '5', '70 kg', 'Üst Vücut', 2 FROM d1
UNION ALL SELECT id, 'Deadlift', 5, '5', '100 kg', 'Alt Vücut', 3 FROM d1
UNION ALL SELECT id, 'Plank', 4, '60 sn', 'bodyweight', 'Core', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Salı' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Iron Core Strength' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Overhead Press', 4, '8', '35 kg', 'Üst Vücut', 1 FROM d2
UNION ALL SELECT id, 'Pull Up', 4, '10', 'bodyweight', 'Üst Vücut', 2 FROM d2
UNION ALL SELECT id, 'Barbell Row', 4, '8', '50 kg', 'Üst Vücut', 3 FROM d2
UNION ALL SELECT id, 'Side Plank', 3, '45 sn', 'bodyweight', 'Core', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Perşembe' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Iron Core Strength' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Front Squat', 4, '8', '70 kg', 'Alt Vücut', 1 FROM d3
UNION ALL SELECT id, 'Incline Bench Press', 4, '8', '60 kg', 'Üst Vücut', 2 FROM d3
UNION ALL SELECT id, 'Romanian Deadlift', 4, '10', '80 kg', 'Alt Vücut', 3 FROM d3
UNION ALL SELECT id, 'Mountain Climber', 3, '30 sn', 'bodyweight', 'Core', 4 FROM d3;

WITH d4 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Iron Core Strength' LIMIT 1) LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Burpees', 3, '20', 'bodyweight', 'Cardio', 1 FROM d4
UNION ALL SELECT id, 'Jump Rope', 4, '1 dk', 'bodyweight', 'Cardio', 2 FROM d4
UNION ALL SELECT id, 'Hanging Leg Raise', 3, '15', 'bodyweight', 'Core', 3 FROM d4
UNION ALL SELECT id, 'Core Circuit', 3, '1 tur', 'bodyweight', 'Core', 4 FROM d4;

-- PROGRAM 15: Power Engine
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Power Engine', 'EN: Explosive power. TR: Patlayıcı güç.', 'İleri', 'Power', 4, 4, 500, '⚡', '#FF4757');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Power Engine' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Explosive training. TR: Patlayıcı antrenman.', 65, 500 FROM prog
UNION ALL SELECT id, 2, 'Salı', 'EN: Power conditioning. TR: Güç kondisyon.', 65, 500 FROM prog
UNION ALL SELECT id, 3, 'Perşembe', 'EN: Strength power. TR: Güç kuvvet.', 65, 500 FROM prog
UNION ALL SELECT id, 4, 'Cuma', 'EN: Power finisher. TR: Güç bitirici.', 65, 500 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Power Engine') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Sprint', 10, '20 sn', 'bodyweight', 'Cardio', 1 FROM d1
UNION ALL SELECT id, 'Clean & Press', 4, '8', '40 kg', 'Üst Vücut', 2 FROM d1
UNION ALL SELECT id, 'Push Up', 4, '20', 'bodyweight', 'Üst Vücut', 3 FROM d1
UNION ALL SELECT id, 'Jump Rope', 4, '1 dk', 'bodyweight', 'Cardio', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Salı' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Power Engine') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Kettlebell Swing', 4, '15', '16 kg', 'Alt Vücut', 1 FROM d2
UNION ALL SELECT id, 'Burpees', 3, '15', 'bodyweight', 'Cardio', 2 FROM d2
UNION ALL SELECT id, 'High Knees', 3, '40 sn', 'bodyweight', 'Cardio', 3 FROM d2
UNION ALL SELECT id, 'Side Plank', 3, '45 sn', 'bodyweight', 'Core', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Perşembe' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Power Engine') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Barbell Row', 4, '8', '50 kg', 'Üst Vücut', 1 FROM d3
UNION ALL SELECT id, 'Squat', 4, '8', '80 kg', 'Alt Vücut', 2 FROM d3
UNION ALL SELECT id, 'Overhead Press', 4, '10', '30 kg', 'Üst Vücut', 3 FROM d3
UNION ALL SELECT id, 'Russian Twist', 3, '25', '10 kg', 'Core', 4 FROM d3;

WITH d4 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Power Engine') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Sprint', 10, '20 sn', 'bodyweight', 'Cardio', 1 FROM d4
UNION ALL SELECT id, 'Rope Slam', 4, '20 sn', 'bodyweight', 'Cardio', 2 FROM d4
UNION ALL SELECT id, 'Plank', 3, '60 sn', 'bodyweight', 'Core', 3 FROM d4
UNION ALL SELECT id, 'Core Finisher', 3, '1 tur', 'bodyweight', 'Core', 4 FROM d4;

-- PROGRAM 16: HIIT Inferno
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('HIIT Inferno', 'EN: Maximum intensity HIIT. TR: Maksimum yoğunluk HIIT.', 'İleri', 'HIIT', 3, 4, 520, '🔥', '#FF4757');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'HIIT Inferno' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Maximum burn. TR: Maksimum yakım.', 45, 520 FROM prog
UNION ALL SELECT id, 2, 'Çarşamba', 'EN: Power HIIT. TR: Güç HIIT.', 45, 520 FROM prog
UNION ALL SELECT id, 3, 'Cuma', 'EN: Inferno finish. TR: Cehennem bitirici.', 45, 520 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'HIIT Inferno') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Burpees', 4, '15', 'bodyweight', 'Cardio', 1 FROM d1
UNION ALL SELECT id, 'Jump Squat', 4, '15', 'bodyweight', 'Alt Vücut', 2 FROM d1
UNION ALL SELECT id, 'Sprint', 8, '20 sn', 'bodyweight', 'Cardio', 3 FROM d1
UNION ALL SELECT id, 'Push Up', 3, '20', 'bodyweight', 'Üst Vücut', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Çarşamba' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'HIIT Inferno') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Kettlebell Swing', 4, '15', '20 kg', 'Alt Vücut', 1 FROM d2
UNION ALL SELECT id, 'Lunges', 3, '12', '12 kg × 2', 'Alt Vücut', 2 FROM d2
UNION ALL SELECT id, 'Mountain Climber', 4, '30 sn', 'bodyweight', 'Core', 3 FROM d2
UNION ALL SELECT id, 'Side Plank', 3, '45 sn', 'bodyweight', 'Core', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'HIIT Inferno') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Jump Rope', 4, '1 dk', 'bodyweight', 'Cardio', 1 FROM d3
UNION ALL SELECT id, 'Plank Jacks', 3, '40 sn', 'bodyweight', 'Core', 2 FROM d3
UNION ALL SELECT id, 'Jump Squat', 4, '15', 'bodyweight', 'Alt Vücut', 3 FROM d3
UNION ALL SELECT id, 'Hanging Leg Raise', 3, '15', 'bodyweight', 'Core', 4 FROM d3;

-- PROGRAM 17: Mass Builder Pro
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Mass Builder Pro', 'EN: Advanced muscle building. TR: İleri seviye kas geliştirme.', 'İleri', 'Hypertrophy', 5, 4, 450, '💪', '#FF4757');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Mass Builder Pro' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi (Chest)', 'EN: Chest day. TR: Göğüs günü.', 65, 450 FROM prog
UNION ALL SELECT id, 2, 'Salı (Back)', 'EN: Back day. TR: Sırt günü.', 65, 450 FROM prog
UNION ALL SELECT id, 3, 'Çarşamba (Legs)', 'EN: Legs day. TR: Bacak günü.', 70, 450 FROM prog
UNION ALL SELECT id, 4, 'Perşembe (Arms)', 'EN: Arms day. TR: Kol günü.', 55, 450 FROM prog
UNION ALL SELECT id, 5, 'Cuma (Shoulders)', 'EN: Shoulders day. TR: Omuz günü.', 60, 450 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi (Chest)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Mass Builder Pro') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Bench Press', 4, '8', '70 kg', 'Üst Vücut', 1 FROM d1
UNION ALL SELECT id, 'Incline Dumbbell Press', 4, '10', '22 kg × 2', 'Üst Vücut', 2 FROM d1
UNION ALL SELECT id, 'Dumbbell Fly', 3, '12', '12 kg × 2', 'Üst Vücut', 3 FROM d1
UNION ALL SELECT id, 'Push Up', 3, '20', 'bodyweight', 'Üst Vücut', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Salı (Back)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Mass Builder Pro') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Deadlift', 5, '5', '100 kg', 'Alt Vücut', 1 FROM d2
UNION ALL SELECT id, 'Pull Up', 4, '10', 'bodyweight', 'Üst Vücut', 2 FROM d2
UNION ALL SELECT id, 'Barbell Row', 4, '8', '60 kg', 'Üst Vücut', 3 FROM d2
UNION ALL SELECT id, 'Lat Pulldown', 3, '12', '50 kg', 'Üst Vücut', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Çarşamba (Legs)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Mass Builder Pro') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Squat', 5, '6', '100 kg', 'Alt Vücut', 1 FROM d3
UNION ALL SELECT id, 'Leg Press', 4, '10', '160 kg', 'Alt Vücut', 2 FROM d3
UNION ALL SELECT id, 'Lunges', 3, '12', '15 kg × 2', 'Alt Vücut', 3 FROM d3
UNION ALL SELECT id, 'Calf Raise', 4, '20', 'bodyweight', 'Alt Vücut', 4 FROM d3;

WITH d4 AS (SELECT id FROM template_program_days WHERE day_name = 'Perşembe (Arms)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Mass Builder Pro') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Barbell Curl', 4, '12', '30 kg', 'Üst Vücut', 1 FROM d4
UNION ALL SELECT id, 'Skull Crusher', 4, '12', '25 kg', 'Üst Vücut', 2 FROM d4
UNION ALL SELECT id, 'Hammer Curl', 3, '12', '14 kg', 'Üst Vücut', 3 FROM d4
UNION ALL SELECT id, 'Triceps Dips', 3, '15', 'bodyweight', 'Üst Vücut', 4 FROM d4;

WITH d5 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma (Shoulders)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Mass Builder Pro') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Overhead Press', 4, '10', '35 kg', 'Üst Vücut', 1 FROM d5
UNION ALL SELECT id, 'Lateral Raise', 3, '15', '8 kg', 'Üst Vücut', 2 FROM d5
UNION ALL SELECT id, 'Front Raise', 3, '12', '8 kg', 'Üst Vücut', 3 FROM d5
UNION ALL SELECT id, 'Shrug', 3, '15', '30 kg × 2', 'Üst Vücut', 4 FROM d5;

-- PROGRAM 18: Hybrid Force
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Hybrid Force', 'EN: Strength + conditioning. TR: Güç + kondisyon.', 'İleri', 'Hybrid', 4, 4, 470, '⚔️', '#FF4757');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Hybrid Force' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Mixed training. TR: Karma antrenman.', 65, 470 FROM prog
UNION ALL SELECT id, 2, 'Salı', 'EN: Power conditioning. TR: Güç kondisyon.', 65, 470 FROM prog
UNION ALL SELECT id, 3, 'Perşembe', 'EN: Strength HIIT. TR: Güç HIIT.', 65, 470 FROM prog
UNION ALL SELECT id, 4, 'Cuma', 'EN: Force finisher. TR: Kuvvet bitirici.', 65, 470 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Hybrid Force') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Deadlift', 4, '6', '100 kg', 'Alt Vücut', 1 FROM d1
UNION ALL SELECT id, 'Sprint', 8, '20 sn', 'bodyweight', 'Cardio', 2 FROM d1
UNION ALL SELECT id, 'Push Up', 4, '20', 'bodyweight', 'Üst Vücut', 3 FROM d1
UNION ALL SELECT id, 'Rope Slam', 4, '20 sn', 'bodyweight', 'Cardio', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Salı' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Hybrid Force') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Kettlebell Swing', 4, '15', '20 kg', 'Alt Vücut', 1 FROM d2
UNION ALL SELECT id, 'Barbell Row', 4, '10', '50 kg', 'Üst Vücut', 2 FROM d2
UNION ALL SELECT id, 'Overhead Press', 4, '10', '30 kg', 'Üst Vücut', 3 FROM d2
UNION ALL SELECT id, 'Burpees', 3, '15', 'bodyweight', 'Cardio', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Perşembe' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Hybrid Force') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Squat', 4, '8', '90 kg', 'Alt Vücut', 1 FROM d3
UNION ALL SELECT id, 'High Knees', 3, '40 sn', 'bodyweight', 'Cardio', 2 FROM d3
UNION ALL SELECT id, 'Dumbbell Curl', 3, '12', '12 kg', 'Üst Vücut', 3 FROM d3
UNION ALL SELECT id, 'Core Circuit', 3, '1 tur', 'bodyweight', 'Core', 4 FROM d3;

WITH d4 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Hybrid Force') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Jump Rope', 4, '1 dk', 'bodyweight', 'Cardio', 1 FROM d4
UNION ALL SELECT id, 'Clean & Press', 4, '8', '50 kg', 'Üst Vücut', 2 FROM d4
UNION ALL SELECT id, 'Battle Rope', 3, '30 sn', 'bodyweight', 'Cardio', 3 FROM d4
UNION ALL SELECT id, 'Plank', 3, '60 sn', 'bodyweight', 'Core', 4 FROM d4;

-- ============================================
-- 🟣 ELITE SEVİYE (6 Program)
-- ============================================

-- PROGRAM 19: PPL Titan
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('PPL Titan', 'EN: Elite PPL program. TR: Elite PPL programı.', 'Elite', 'PPL', 6, 4, 600, '💪', '#9C27B0');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'PPL Titan' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Push A', 'EN: Heavy push. TR: Ağır itme.', 80, 600 FROM prog
UNION ALL SELECT id, 2, 'Pull A', 'EN: Heavy pull. TR: Ağır çekme.', 80, 600 FROM prog
UNION ALL SELECT id, 3, 'Legs A', 'EN: Heavy legs. TR: Ağır bacak.', 80, 600 FROM prog
UNION ALL SELECT id, 4, 'Push B', 'EN: Volume push. TR: Hacim itme.', 75, 600 FROM prog
UNION ALL SELECT id, 5, 'Pull B', 'EN: Volume pull. TR: Hacim çekme.', 75, 600 FROM prog
UNION ALL SELECT id, 6, 'Legs B', 'EN: Volume legs. TR: Hacim bacak.', 75, 600 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Push A' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'PPL Titan') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Bench Press', 5, '5', '90 kg', 'Üst Vücut', 1 FROM d1
UNION ALL SELECT id, 'Overhead Press', 4, '8', '40 kg', 'Üst Vücut', 2 FROM d1
UNION ALL SELECT id, 'Dips', 4, '12', 'bodyweight', 'Üst Vücut', 3 FROM d1
UNION ALL SELECT id, 'Push Up', 3, '25', 'bodyweight', 'Üst Vücut', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Pull A' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'PPL Titan') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Deadlift', 5, '5', '110 kg', 'Alt Vücut', 1 FROM d2
UNION ALL SELECT id, 'Weighted Pull Up', 4, '8', '+10 kg', 'Üst Vücut', 2 FROM d2
UNION ALL SELECT id, 'Barbell Row', 4, '10', '60 kg', 'Üst Vücut', 3 FROM d2
UNION ALL SELECT id, 'Face Pull', 3, '15', '35 kg', 'Üst Vücut', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Legs A' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'PPL Titan') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Squat', 5, '5', '110 kg', 'Alt Vücut', 1 FROM d3
UNION ALL SELECT id, 'Leg Press', 4, '10', '180 kg', 'Alt Vücut', 2 FROM d3
UNION ALL SELECT id, 'Lunges', 3, '12', '20 kg × 2', 'Alt Vücut', 3 FROM d3
UNION ALL SELECT id, 'Calf Raise', 4, '20', 'bodyweight', 'Alt Vücut', 4 FROM d3;

WITH d4 AS (SELECT id FROM template_program_days WHERE day_name = 'Push B' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'PPL Titan') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Incline Bench Press', 5, '5', '80 kg', 'Üst Vücut', 1 FROM d4
UNION ALL SELECT id, 'Arnold Press', 4, '10', '25 kg × 2', 'Üst Vücut', 2 FROM d4
UNION ALL SELECT id, 'Dips', 4, '12', 'bodyweight', 'Üst Vücut', 3 FROM d4
UNION ALL SELECT id, 'Push Up', 3, '25', 'bodyweight', 'Üst Vücut', 4 FROM d4;

WITH d5 AS (SELECT id FROM template_program_days WHERE day_name = 'Pull B' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'PPL Titan') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Romanian Deadlift', 5, '5', '100 kg', 'Alt Vücut', 1 FROM d5
UNION ALL SELECT id, 'Dumbbell Curl', 3, '12', '14 kg', 'Üst Vücut', 2 FROM d5
UNION ALL SELECT id, 'Pull Up', 4, '10', 'bodyweight', 'Üst Vücut', 3 FROM d5
UNION ALL SELECT id, 'Face Pull', 3, '15', 'bodyweight', 'Üst Vücut', 4 FROM d5;

WITH d6 AS (SELECT id FROM template_program_days WHERE day_name = 'Legs B' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'PPL Titan') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Front Squat', 5, '5', '100 kg', 'Alt Vücut', 1 FROM d6
UNION ALL SELECT id, 'Leg Extension', 4, '12', '45 kg', 'Alt Vücut', 2 FROM d6
UNION ALL SELECT id, 'Leg Curl', 4, '12', '45 kg', 'Alt Vücut', 3 FROM d6
UNION ALL SELECT id, 'Calf Raise', 4, '20', 'bodyweight', 'Alt Vücut', 4 FROM d6;

-- PROGRAM 20: Olympic Power Flow
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Olympic Power Flow', 'EN: Olympic lifting. TR: Olimpik kaldırış.', 'Elite', 'Olympic', 5, 4, 650, '🏋️', '#9C27B0');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Olympic Power Flow' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Olympic lifts. TR: Olimpik kaldırışlar.', 90, 650 FROM prog
UNION ALL SELECT id, 2, 'Salı', 'EN: Power development. TR: Güç geliştirme.', 90, 650 FROM prog
UNION ALL SELECT id, 3, 'Perşembe', 'EN: Technique day. TR: Teknik günü.', 90, 650 FROM prog
UNION ALL SELECT id, 4, 'Cuma', 'EN: Conditioning. TR: Kondisyon.', 75, 650 FROM prog
UNION ALL SELECT id, 5, 'Cumartesi', 'EN: Complex training. TR: Kompleks antrenman.', 90, 650 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Olympic Power Flow') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Snatch', 5, '3', '40 kg', 'Diğer', 1 FROM d1
UNION ALL SELECT id, 'Clean & Jerk', 5, '3', '50 kg', 'Diğer', 2 FROM d1
UNION ALL SELECT id, 'Front Squat', 4, '6', '90 kg', 'Alt Vücut', 3 FROM d1
UNION ALL SELECT id, 'Core Circuit', 3, '1 tur', 'bodyweight', 'Core', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Salı' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Olympic Power Flow') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Deadlift', 5, '5', '110 kg', 'Alt Vücut', 1 FROM d2
UNION ALL SELECT id, 'Pull Up', 4, '8', 'bodyweight+', 'Üst Vücut', 2 FROM d2
UNION ALL SELECT id, 'Push Press', 4, '8', '40 kg', 'Üst Vücut', 3 FROM d2
UNION ALL SELECT id, 'Hanging Leg Raise', 3, '15', 'bodyweight', 'Core', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Perşembe' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Olympic Power Flow') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Overhead Squat', 4, '5', '60 kg', 'Alt Vücut', 1 FROM d3
UNION ALL SELECT id, 'Clean Pull', 4, '4', '90 kg', 'Diğer', 2 FROM d3
UNION ALL SELECT id, 'Burpees', 3, '20', 'bodyweight', 'Cardio', 3 FROM d3
UNION ALL SELECT id, 'Plank', 3, '60 sn', 'bodyweight', 'Core', 4 FROM d3;

WITH d4 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Olympic Power Flow') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Jump Rope', 4, '1 dk', 'bodyweight', 'Cardio', 1 FROM d4
UNION ALL SELECT id, 'Kettlebell Swing', 4, '15', '20 kg', 'Alt Vücut', 2 FROM d4
UNION ALL SELECT id, 'Russian Twist', 3, '25', '10 kg', 'Core', 3 FROM d4
UNION ALL SELECT id, 'Mobility Flow', 1, '10 dk', 'bodyweight', 'Esneme', 4 FROM d4;

WITH d5 AS (SELECT id FROM template_program_days WHERE day_name = 'Cumartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Olympic Power Flow') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Complex Circuit', 3, '1 tur', '40 kg', 'Diğer', 1 FROM d5
UNION ALL SELECT id, 'Sprint', 8, '20 sn', 'bodyweight', 'Cardio', 2 FROM d5
UNION ALL SELECT id, 'Rope Slam', 3, '30 sn', 'bodyweight', 'Cardio', 3 FROM d5
UNION ALL SELECT id, 'Core Finisher', 1, '1 tur', 'bodyweight', 'Core', 4 FROM d5;

-- PROGRAM 21: Athlete Engine Max
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Athlete Engine Max', 'EN: Elite athletic training. TR: Elite atletik antrenman.', 'Elite', 'Athletic', 6, 4, 650, '⚡', '#9C27B0');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Athlete Engine Max' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, '1. Gün (Power)', 'EN: Power development. TR: Güç geliştirme.', 80, 650 FROM prog
UNION ALL SELECT id, 2, '2. Gün (Strength)', 'EN: Strength training. TR: Güç antrenmanı.', 80, 650 FROM prog
UNION ALL SELECT id, 3, '3. Gün (Speed)', 'EN: Speed training. TR: Hız antrenmanı.', 80, 650 FROM prog
UNION ALL SELECT id, 4, '4. Gün (Endurance)', 'EN: Endurance training. TR: Dayanıklılık antrenmanı.', 75, 650 FROM prog
UNION ALL SELECT id, 5, '5. Gün (Plyometric)', 'EN: Plyometric training. TR: Plyometrik antrenman.', 75, 650 FROM prog
UNION ALL SELECT id, 6, '6. Gün (Mobility)', 'EN: Mobility & core. TR: Mobilite & core.', 60, 650 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = '1. Gün (Power)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Athlete Engine Max') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Sprint', 8, '30 sn', 'bodyweight', 'Cardio', 1 FROM d1
UNION ALL SELECT id, 'Box Jump', 4, '10', 'bodyweight', 'Alt Vücut', 2 FROM d1
UNION ALL SELECT id, 'Power Clean', 4, '5', '60 kg', 'Diğer', 3 FROM d1
UNION ALL SELECT id, 'Push Up', 3, '25', 'bodyweight', 'Üst Vücut', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = '2. Gün (Strength)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Athlete Engine Max') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Squat', 5, '5', '110 kg', 'Alt Vücut', 1 FROM d2
UNION ALL SELECT id, 'Bench Press', 5, '5', '90 kg', 'Üst Vücut', 2 FROM d2
UNION ALL SELECT id, 'Deadlift', 5, '5', '120 kg', 'Alt Vücut', 3 FROM d2
UNION ALL SELECT id, 'Plank', 3, '60 sn', 'bodyweight', 'Core', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = '3. Gün (Speed)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Athlete Engine Max') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Sled Push', 4, '30 m', 'bodyweight', 'Alt Vücut', 1 FROM d3
UNION ALL SELECT id, 'Sprint', 6, '40 m', 'bodyweight', 'Cardio', 2 FROM d3
UNION ALL SELECT id, 'Lateral Hop', 3, '20', 'bodyweight', 'Alt Vücut', 3 FROM d3
UNION ALL SELECT id, 'Core Circuit', 3, '1 tur', 'bodyweight', 'Core', 4 FROM d3;

WITH d4 AS (SELECT id FROM template_program_days WHERE day_name = '4. Gün (Endurance)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Athlete Engine Max') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Jump Rope', 4, '1 dk', 'bodyweight', 'Cardio', 1 FROM d4
UNION ALL SELECT id, 'High Knees', 4, '45 sn', 'bodyweight', 'Cardio', 2 FROM d4
UNION ALL SELECT id, 'Burpees', 4, '15', 'bodyweight', 'Cardio', 3 FROM d4
UNION ALL SELECT id, 'Mountain Climber', 3, '30 sn', 'bodyweight', 'Core', 4 FROM d4;

WITH d5 AS (SELECT id FROM template_program_days WHERE day_name = '5. Gün (Plyometric)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Athlete Engine Max') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Box Jump', 4, '10', 'bodyweight', 'Alt Vücut', 1 FROM d5
UNION ALL SELECT id, 'Depth Jump', 4, '10', 'bodyweight', 'Alt Vücut', 2 FROM d5
UNION ALL SELECT id, 'Broad Jump', 3, '12', 'bodyweight', 'Alt Vücut', 3 FROM d5
UNION ALL SELECT id, 'Core Stability', 3, '1 tur', 'bodyweight', 'Core', 4 FROM d5;

WITH d6 AS (SELECT id FROM template_program_days WHERE day_name = '6. Gün (Mobility)' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Athlete Engine Max') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Mobility Flow', 1, '10 dk', 'bodyweight', 'Esneme', 1 FROM d6
UNION ALL SELECT id, 'Bird Dog', 3, '20', 'bodyweight', 'Core', 2 FROM d6
UNION ALL SELECT id, 'Side Plank', 3, '45 sn', 'bodyweight', 'Core', 3 FROM d6
UNION ALL SELECT id, 'Hanging Leg Raise', 3, '15', 'bodyweight', 'Core', 4 FROM d6;

-- PROGRAM 22: Hybrid Monster
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Hybrid Monster', 'EN: Elite hybrid training. TR: Elite hibrit antrenman.', 'Elite', 'Hybrid', 5, 4, 600, '🔥', '#9C27B0');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Hybrid Monster' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Pazartesi', 'EN: Deadlift power. TR: Deadlift gücü.', 75, 600 FROM prog
UNION ALL SELECT id, 2, 'Salı', 'EN: Clean & press. TR: Clean & press.', 75, 600 FROM prog
UNION ALL SELECT id, 3, 'Perşembe', 'EN: Squat power. TR: Squat gücü.', 75, 600 FROM prog
UNION ALL SELECT id, 4, 'Cuma', 'EN: Kettlebell power. TR: Kettlebell gücü.', 75, 600 FROM prog
UNION ALL SELECT id, 5, 'Cumartesi', 'EN: EMOM challenge. TR: EMOM meydan okuma.', 75, 600 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Pazartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Hybrid Monster') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Deadlift', 5, '5', '120 kg', 'Alt Vücut', 1 FROM d1
UNION ALL SELECT id, 'Sprint', 8, '20 sn', 'bodyweight', 'Cardio', 2 FROM d1
UNION ALL SELECT id, 'Push Up', 4, '25', 'bodyweight', 'Üst Vücut', 3 FROM d1
UNION ALL SELECT id, 'Rope Slam', 4, '20 sn', 'bodyweight', 'Cardio', 4 FROM d1;

WITH d2 AS (SELECT id FROM template_program_days WHERE day_name = 'Salı' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Hybrid Monster') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Clean & Press', 5, '5', '60 kg', 'Üst Vücut', 1 FROM d2
UNION ALL SELECT id, 'Pull Up', 4, '10', 'bodyweight', 'Üst Vücut', 2 FROM d2
UNION ALL SELECT id, 'Burpees', 4, '15', 'bodyweight', 'Cardio', 3 FROM d2
UNION ALL SELECT id, 'Core Circuit', 3, '1 tur', 'bodyweight', 'Core', 4 FROM d2;

WITH d3 AS (SELECT id FROM template_program_days WHERE day_name = 'Perşembe' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Hybrid Monster') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Squat', 5, '5', '120 kg', 'Alt Vücut', 1 FROM d3
UNION ALL SELECT id, 'High Knees', 4, '30 sn', 'bodyweight', 'Cardio', 2 FROM d3
UNION ALL SELECT id, 'Dumbbell Curl', 4, '12', '15 kg', 'Üst Vücut', 3 FROM d3
UNION ALL SELECT id, 'Battle Rope', 4, '30 sn', 'bodyweight', 'Cardio', 4 FROM d3;

WITH d4 AS (SELECT id FROM template_program_days WHERE day_name = 'Cuma' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Hybrid Monster') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Kettlebell Swing', 5, '20', '24 kg', 'Alt Vücut', 1 FROM d4
UNION ALL SELECT id, 'Row', 4, '10', '60 kg', 'Üst Vücut', 2 FROM d4
UNION ALL SELECT id, 'Overhead Press', 4, '10', '40 kg', 'Üst Vücut', 3 FROM d4
UNION ALL SELECT id, 'Side Plank', 3, '60 sn', 'bodyweight', 'Core', 4 FROM d4;

WITH d5 AS (SELECT id FROM template_program_days WHERE day_name = 'Cumartesi' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Hybrid Monster') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'EMOM', 20, '1 dk', 'bodyweight', 'Diğer', 1 FROM d5;

-- PROGRAM 23: Cross Titan
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Cross Titan', 'EN: CrossFit style elite. TR: CrossFit tarzı elit.', 'Elite', 'CrossFit', 5, 4, 630, '⚔️', '#9C27B0');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Cross Titan' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Cross Day', 'EN: WOD style. TR: WOD tarzı.', 75, 630 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Cross Day' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Cross Titan') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Barbell Complex', 4, '5', '40 kg', 'Diğer', 1 FROM d1
UNION ALL SELECT id, 'Sprint', 8, '20 sn', 'bodyweight', 'Cardio', 2 FROM d1
UNION ALL SELECT id, 'Kettlebell Swing', 4, '15', '20 kg', 'Alt Vücut', 3 FROM d1
UNION ALL SELECT id, 'Rope Slam', 4, '20 sn', 'bodyweight', 'Cardio', 4 FROM d1
UNION ALL SELECT id, 'Push Press', 4, '8', '40 kg', 'Üst Vücut', 5 FROM d1;

-- PROGRAM 24: Endurance King
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES ('Endurance King', 'EN: Elite endurance + strength. TR: Elite dayanıklılık + güç.', 'Elite', 'Endurance', 6, 4, 700, '👑', '#9C27B0');

WITH prog AS (SELECT id FROM template_programs WHERE name = 'Endurance King' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Endurance Day', 'EN: Maximum endurance. TR: Maksimum dayanıklılık.', 90, 700 FROM prog;

WITH d1 AS (SELECT id FROM template_program_days WHERE day_name = 'Endurance Day' AND template_program_id = (SELECT id FROM template_programs WHERE name = 'Endurance King') LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Heavy Squat', 5, '5', '110 kg', 'Alt Vücut', 1 FROM d1
UNION ALL SELECT id, 'Deadlift', 5, '5', '120 kg', 'Alt Vücut', 2 FROM d1
UNION ALL SELECT id, 'Sprint Interval', 10, '20 sn', 'bodyweight', 'Cardio', 3 FROM d1
UNION ALL SELECT id, 'EMOM', 20, '1 dk', 'bodyweight', 'Diğer', 4 FROM d1
UNION ALL SELECT id, 'Farmer Carry', 4, '40 m', '24 kg × 2', 'Alt Vücut', 5 FROM d1
UNION ALL SELECT id, 'Core Finisher', 1, '1 tur', 'bodyweight', 'Core', 6 FROM d1;

-- ============================================
-- ✅ TAMAMLANDI - 24 PROGRAM EKLENDİ
-- ============================================

-- Kontrol sorguları
SELECT 'TOPLAM PROGRAM' as durum, COUNT(*) as adet FROM template_programs;
SELECT level, COUNT(*) as adet FROM template_programs GROUP BY level ORDER BY CASE level WHEN 'Başlangıç' THEN 1 WHEN 'Orta' THEN 2 WHEN 'İleri' THEN 3 WHEN 'Elite' THEN 4 END;

