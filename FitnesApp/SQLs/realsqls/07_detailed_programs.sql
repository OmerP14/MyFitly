-- ============================================
-- DETAYLI HAZIR PROGRAMLAR
-- Bu dosyayı 04.sql'den sonra çalıştırın
-- ============================================

-- NOT: Bu script programları sıralar: Başlangıç -> Orta -> İleri
-- Tüm seviye isimleri Türkçe: Başlangıç, Orta, İleri

-- Önce mevcut programları temizle (tablolar VARSA)
DO $$
BEGIN
  IF to_regclass('public.template_exercises') IS NOT NULL THEN
    DELETE FROM template_exercises;
  END IF;
  IF to_regclass('public.template_program_days') IS NOT NULL THEN
    DELETE FROM template_program_days;
  END IF;
  IF to_regclass('public.template_programs') IS NOT NULL THEN
    DELETE FROM template_programs;
  END IF;
END $$;

-- ============================================
-- BAŞLANGIÇ SEVİYESİ PROGRAMLAR (3 adet)
-- ============================================

-- PROGRAM 1: Full Body - Başlangıç
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES 
('Full Body - Başlangıç', 'Haftada 3 gün tüm vücut çalışan başlangıç seviyesi program. Yeni başlayanlar için ideal.', 'Başlangıç', 'Full Body', 3, 6, 300, '🔥', '#00D084');

-- Gün 1 (Monday)
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Full Body - Başlangıç' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Monday - Full Body A', 'Temel bileşik hareketler ile tüm vücut', 50, 300 FROM prog;

-- Gün 1 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Monday - Full Body A' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Goblet Squat', 3, '10-12', '12kg', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Dumbbell Bench Press', 3, '10-12', '12-15kg', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Lat Pulldown', 3, '10-12', '30kg', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Plank', 3, '30-45sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 2 (Wednesday)
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Full Body - Başlangıç' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 3, 'Wednesday - Full Body B', 'Temel hareketler ile tüm vücut', 45, 300 FROM prog;

-- Gün 2 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Wednesday - Full Body B' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Bodyweight Squat', 3, '12', 'Vücut Ağırlığı', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Push Up', 3, '10-12', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Seated Row', 3, '10-12', '25kg', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Crunch', 3, '15', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 3 (Friday)
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Full Body - Başlangıç' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 5, 'Friday - Full Body C', 'Temel hareketler ile tüm vücut', 45, 300 FROM prog;

-- Gün 3 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Friday - Full Body C' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Lunges', 3, '10', 'her bacak', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Dumbbell Shoulder Press', 3, '10-12', '10kg', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Back Extension', 3, '15', 'Vücut Ağırlığı', 'Alt Vücut', 3 FROM day
UNION ALL
SELECT id, 'Side Plank', 3, '30sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- ============================================

-- PROGRAM 2: Core & Cardio - Başlangıç
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES 
('Core & Cardio - Başlangıç', 'Haftada 3 gün kardiyovasküler sağlık ve core güçlendirme programı. Başlangıç seviyesi için ideal.', 'Başlangıç', 'Core & Cardio', 3, 4, 250, '💪', '#00D084');

-- Gün 1
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Core & Cardio - Başlangıç' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Monday - Core & Cardio', 'Kardiyo ve core hareketleri', 40, 250 FROM prog;

-- Gün 1 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 1 - Core & Cardio' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Jumping Jacks', 3, '30sn', 'Vücut Ağırlığı', 'Diğer', 1 FROM day
UNION ALL
SELECT id, 'Crunch', 3, '15', 'Vücut Ağırlığı', 'Diğer', 2 FROM day
UNION ALL
SELECT id, 'Leg Raises', 3, '12', 'Vücut Ağırlığı', 'Diğer', 3 FROM day
UNION ALL
SELECT id, 'Plank', 3, '30sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 2
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Core & Cardio - Başlangıç' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 3, 'Gün 2 - Core & Cardio', 'Kardiyo ve core hareketleri', 40, 250 FROM prog;

-- Gün 2 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 2 - Core & Cardio' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'March in Place', 3, '1dk', 'Vücut Ağırlığı', 'Diğer', 1 FROM day
UNION ALL
SELECT id, 'Side Crunch', 3, '15', 'Vücut Ağırlığı', 'Diğer', 2 FROM day
UNION ALL
SELECT id, 'Glute Bridge', 3, '12', 'Vücut Ağırlığı', 'Alt Vücut', 3 FROM day
UNION ALL
SELECT id, 'Mountain Climber', 3, '20sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 3
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Core & Cardio - Başlangıç' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 5, 'Gün 3 - Core & Cardio', 'Kardiyo ve core hareketleri', 40, 250 FROM prog;

-- Gün 3 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 3 - Core & Cardio' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'High Knees', 3, '30sn', 'Vücut Ağırlığı', 'Diğer', 1 FROM day
UNION ALL
SELECT id, 'Flutter Kicks', 3, '20sn', 'Vücut Ağırlığı', 'Diğer', 2 FROM day
UNION ALL
SELECT id, 'Superman Hold', 3, '30sn', 'Vücut Ağırlığı', 'Alt Vücut', 3 FROM day
UNION ALL
SELECT id, 'Plank', 3, '30sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- ============================================

-- PROGRAM 3: Upper Body - Başlangıç
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES 
('Upper Body - Başlangıç', 'Haftada 2 gün üst vücut odaklı program. Omuz, göğüs, sırt ve kollar için ideal.', 'Başlangıç', 'Upper Body', 2, 6, 270, '💪', '#00D084');

-- Gün 1
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Upper Body - Başlangıç' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Gün 1 - Upper Body', 'Üst vücut güçlendirme', 45, 270 FROM prog;

-- Gün 1 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 1 - Upper Body' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Push Up', 3, '10', 'Vücut Ağırlığı', 'Üst Vücut', 1 FROM day
UNION ALL
SELECT id, 'Dumbbell Shoulder Press', 3, '10-12', '10kg', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Seated Row', 3, '10-12', '25kg', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Crunch', 3, '15', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 2
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Upper Body - Başlangıç' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 4, 'Gün 2 - Upper Body', 'Üst vücut güçlendirme', 45, 270 FROM prog;

-- Gün 2 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 2 - Upper Body' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Incline Push Up', 3, '12', 'Vücut Ağırlığı', 'Üst Vücut', 1 FROM day
UNION ALL
SELECT id, 'Dumbbell Curl', 3, '10-12', '8kg', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Lat Pulldown', 3, '10-12', '30kg', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Side Plank', 3, '30sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- ============================================
-- ORTA SEVİYESİ PROGRAMLAR (4 adet)
-- ============================================

-- PROGRAM 4: Full Body - Orta
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES 
('Full Body - Orta', 'Haftada 4 gün tüm vücut çalışan orta seviye program. Güç artırımı odaklı.', 'Orta', 'Full Body', 4, 8, 400, '🔥', '#FF7A00');

-- Gün 1
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Full Body - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Gün 1 - Full Body', 'Güç odaklı tüm vücut', 60, 400 FROM prog;

-- Gün 1 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 1 - Full Body' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Barbell Squat', 4, '8', '40kg', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Bench Press', 4, '8', '40kg', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Lat Pulldown', 4, '10', '40kg', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Plank', 4, '45sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 2
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Full Body - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 3, 'Gün 2 - Full Body', 'Güç odaklı tüm vücut', 60, 400 FROM prog;

-- Gün 2 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 2 - Full Body' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Deadlift', 4, '8', '50kg', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Dumbbell Shoulder Press', 4, '10', '12kg', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Seated Row', 4, '10', '35kg', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Leg Raise', 3, '15', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 3
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Full Body - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 5, 'Gün 3 - Full Body', 'Güç odaklı tüm vücut', 60, 400 FROM prog;

-- Gün 3 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 3 - Full Body' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Lunges', 4, '12', 'Vücut Ağırlığı', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Push Up', 4, '15', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Dumbbell Curl', 4, '12', 'Vücut Ağırlığı', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Side Plank', 3, '45sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 4
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Full Body - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 7, 'Gün 4 - Full Body', 'Kardiyo ve core', 45, 400 FROM prog;

-- Gün 4 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 4 - Full Body' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Jump Rope', 3, '1dk', 'Vücut Ağırlığı', 'Diğer', 1 FROM day
UNION ALL
SELECT id, 'Burpees', 3, '15', 'Vücut Ağırlığı', 'Diğer', 2 FROM day
UNION ALL
SELECT id, 'Bicycle Crunch', 3, '20', 'Vücut Ağırlığı', 'Diğer', 3 FROM day
UNION ALL
SELECT id, 'Mountain Climber', 3, '30sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- ============================================

-- PROGRAM 5: Push Pull Legs - Orta
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES 
('Push Pull Legs - Orta', 'Haftada 3 gün Push-Pull-Legs programı. İtme, çekme ve bacak günleri ayrımı ile profesyonel program.', 'Orta', 'Push Pull Legs', 3, 8, 420, '💪', '#FF7A00');

-- Push Day
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Push Pull Legs - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Push Day', 'İtme hareketleri odaklı', 70, 420 FROM prog;

-- Push Day Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Push Day' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Bench Press', 4, '8', '40kg', 'Üst Vücut', 1 FROM day
UNION ALL
SELECT id, 'Overhead Press', 4, '10', '20kg', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Triceps Dips', 3, '12', 'Vücut Ağırlığı', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Push Up', 3, '15', 'Vücut Ağırlığı', 'Üst Vücut', 4 FROM day;

-- Pull Day
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Push Pull Legs - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 3, 'Pull Day', 'Çekme hareketleri odaklı', 70, 420 FROM prog;

-- Pull Day Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Pull Day' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Deadlift', 4, '8', '50kg', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Lat Pulldown', 4, '10', '40kg', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Barbell Curl', 3, '12', '20kg', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Face Pull', 3, '15', 'Vücut Ağırlığı', 'Üst Vücut', 4 FROM day;

-- Legs Day
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Push Pull Legs - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 5, 'Legs Day', 'Bacak hareketleri odaklı', 70, 420 FROM prog;

-- Legs Day Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Legs Day' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Barbell Squat', 4, '8', '50kg', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Lunges', 3, '12', 'Vücut Ağırlığı', 'Alt Vücut', 2 FROM day
UNION ALL
SELECT id, 'Leg Press', 4, '10', 'Vücut Ağırlığı', 'Alt Vücut', 3 FROM day
UNION ALL
SELECT id, 'Plank', 3, '45sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- ============================================

-- PROGRAM 6: Upper Lower Split - Orta
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES 
('Upper Lower Split - Orta', 'Haftada 4 gün üst vücut ve alt vücut ayrımı yapan orta seviye program.', 'Orta', 'Upper Lower Split', 4, 8, 380, '🏋️', '#FF7A00');

-- Upper A
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Upper Lower Split - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Upper A', 'Üst vücut çalışması', 60, 380 FROM prog;

-- Upper A Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Upper A' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Bench Press', 4, '8', 'Vücut Ağırlığı', 'Üst Vücut', 1 FROM day
UNION ALL
SELECT id, 'Seated Row', 4, '10', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Shoulder Press', 4, '10', 'Vücut Ağırlığı', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Plank', 3, '45sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Lower A
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Upper Lower Split - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 3, 'Lower A', 'Alt vücut çalışması', 60, 380 FROM prog;

-- Lower A Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Lower A' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Squat', 4, '8', 'Vücut Ağırlığı', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Leg Press', 4, '10', 'Vücut Ağırlığı', 'Alt Vücut', 2 FROM day
UNION ALL
SELECT id, 'Romanian Deadlift', 4, '10', 'Vücut Ağırlığı', 'Alt Vücut', 3 FROM day
UNION ALL
SELECT id, 'Calf Raise', 3, '15', 'Vücut Ağırlığı', 'Alt Vücut', 4 FROM day;

-- Upper B
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Upper Lower Split - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 5, 'Upper B', 'Üst vücut çalışması', 60, 380 FROM prog;

-- Upper B Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Upper B' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Incline Bench Press', 4, '8', 'Vücut Ağırlığı', 'Üst Vücut', 1 FROM day
UNION ALL
SELECT id, 'Lat Pulldown', 4, '10', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Dumbbell Curl', 3, '12', 'Vücut Ağırlığı', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Side Plank', 3, '30sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Lower B
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Upper Lower Split - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 7, 'Lower B', 'Alt vücut çalışması', 60, 380 FROM prog;

-- Lower B Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Lower B' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Lunges', 4, '12', 'Vücut Ağırlığı', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Deadlift', 4, '8', 'Vücut Ağırlığı', 'Alt Vücut', 2 FROM day
UNION ALL
SELECT id, 'Leg Extension', 3, '15', 'Vücut Ağırlığı', 'Alt Vücut', 3 FROM day
UNION ALL
SELECT id, 'Jump Rope', 3, '1dk', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- ============================================

-- PROGRAM 7: Core & Cardio - Orta
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES 
('Core & Cardio - Orta', 'Haftada 3 gün yoğun kardiyovasküler sağlık ve core güçlendirme programı.', 'Orta', 'Core & Cardio', 3, 6, 350, '💪', '#FF7A00');

-- Gün 1
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Core & Cardio - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Gün 1 - Core & Cardio', 'Yoğun kardiyo ve core', 50, 350 FROM prog;

-- Gün 1 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 1 - Core & Cardio' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Jump Rope', 3, '1dk', 'Vücut Ağırlığı', 'Diğer', 1 FROM day
UNION ALL
SELECT id, 'Mountain Climber', 3, '30sn', 'Vücut Ağırlığı', 'Diğer', 2 FROM day
UNION ALL
SELECT id, 'Plank', 4, '45sn', 'Vücut Ağırlığı', 'Diğer', 3 FROM day
UNION ALL
SELECT id, 'Russian Twist', 3, '20', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 2
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Core & Cardio - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 3, 'Gün 2 - Core & Cardio', 'Yoğun kardiyo ve core', 50, 350 FROM prog;

-- Gün 2 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 2 - Core & Cardio' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'High Knees', 3, '45sn', 'Vücut Ağırlığı', 'Diğer', 1 FROM day
UNION ALL
SELECT id, 'Leg Raises', 3, '15', 'Vücut Ağırlığı', 'Diğer', 2 FROM day
UNION ALL
SELECT id, 'Superman Hold', 3, '45sn', 'Vücut Ağırlığı', 'Alt Vücut', 3 FROM day
UNION ALL
SELECT id, 'Bicycle Crunch', 3, '20', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 3
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Core & Cardio - Orta' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 5, 'Gün 3 - Core & Cardio', 'Yoğun kardiyo ve core', 50, 350 FROM prog;

-- Gün 3 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 3 - Core & Cardio' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Burpees', 3, '15', 'Vücut Ağırlığı', 'Diğer', 1 FROM day
UNION ALL
SELECT id, 'Flutter Kicks', 3, '30sn', 'Vücut Ağırlığı', 'Diğer', 2 FROM day
UNION ALL
SELECT id, 'Side Plank', 3, '45sn', 'Vücut Ağırlığı', 'Diğer', 3 FROM day
UNION ALL
SELECT id, 'Plank', 3, '45sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- ============================================
-- İLERİ SEVİYESİ PROGRAMLAR (3 adet)
-- ============================================

-- PROGRAM 8: Push Pull Legs - İleri
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES 
('Push Pull Legs - İleri', 'Haftada 5 gün yoğun Push-Pull-Legs programı. İleri seviye güç ve kas gelişimi için ideal.', 'İleri', 'Push Pull Legs', 5, 10, 500, '💪', '#FF4757');

-- Push A
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Push Pull Legs - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Push A', 'İtme hareketleri odaklı', 80, 500 FROM prog;

-- Push A Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Push A' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Bench Press', 5, '5', 'Vücut Ağırlığı', 'Üst Vücut', 1 FROM day
UNION ALL
SELECT id, 'Overhead Press', 4, '8', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Triceps Dips', 4, '12', 'Vücut Ağırlığı', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Push Up', 4, '15', 'Vücut Ağırlığı', 'Üst Vücut', 4 FROM day;

-- Pull A
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Push Pull Legs - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 2, 'Pull A', 'Çekme hareketleri odaklı', 80, 500 FROM prog;

-- Pull A Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Pull A' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Deadlift', 5, '5', 'Vücut Ağırlığı', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Barbell Row', 4, '8', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Pull Up', 4, '10', 'Vücut Ağırlığı', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Face Pull', 3, '15', 'Vücut Ağırlığı', 'Üst Vücut', 4 FROM day;

-- Legs A
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Push Pull Legs - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 3, 'Legs A', 'Bacak hareketleri odaklı', 80, 500 FROM prog;

-- Legs A Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Legs A' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Barbell Squat', 5, '5', 'Vücut Ağırlığı', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Leg Press', 4, '10', 'Vücut Ağırlığı', 'Alt Vücut', 2 FROM day
UNION ALL
SELECT id, 'Lunges', 4, '12', 'Vücut Ağırlığı', 'Alt Vücut', 3 FROM day
UNION ALL
SELECT id, 'Calf Raise', 4, '15', 'Vücut Ağırlığı', 'Alt Vücut', 4 FROM day;

-- Push B
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Push Pull Legs - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 4, 'Push B', 'İtme hareketleri odaklı', 80, 500 FROM prog;

-- Push B Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Push B' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Incline Bench Press', 5, '5', 'Vücut Ağırlığı', 'Üst Vücut', 1 FROM day
UNION ALL
SELECT id, 'Dumbbell Shoulder Press', 4, '8', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Triceps Extension', 4, '12', 'Vücut Ağırlığı', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Diamond Push Up', 4, '15', 'Vücut Ağırlığı', 'Üst Vücut', 4 FROM day;

-- Pull B
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Push Pull Legs - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 5, 'Pull B', 'Çekme hareketleri odaklı', 80, 500 FROM prog;

-- Pull B Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Pull B' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Romanian Deadlift', 5, '5', 'Vücut Ağırlığı', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Lat Pulldown', 4, '8', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Seated Row', 4, '10', 'Vücut Ağırlığı', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Hammer Curl', 3, '15', 'Vücut Ağırlığı', 'Üst Vücut', 4 FROM day;

-- ============================================

-- PROGRAM 9: Full Body Strength - İleri
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES 
('Full Body Strength - İleri', 'Haftada 4 gün yoğun güç odaklı tüm vücut programı. İleri seviye güç artırımı için ideal.', 'İleri', 'Full Body', 4, 8, 480, '🔥', '#FF4757');

-- Gün 1
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Full Body Strength - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Gün 1 - Strength', 'Yoğun güç çalışması', 90, 480 FROM prog;

-- Gün 1 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 1 - Strength' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Squat', 5, '5', 'Vücut Ağırlığı', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Bench Press', 5, '5', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Deadlift', 5, '5', 'Vücut Ağırlığı', 'Alt Vücut', 3 FROM day
UNION ALL
SELECT id, 'Plank', 4, '1dk', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 2
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Full Body Strength - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 3, 'Gün 2 - Strength', 'Yoğun güç çalışması', 90, 480 FROM prog;

-- Gün 2 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 2 - Strength' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Overhead Press', 5, '5', 'Vücut Ağırlığı', 'Üst Vücut', 1 FROM day
UNION ALL
SELECT id, 'Pull Up', 4, '10', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Barbell Row', 4, '8', 'Vücut Ağırlığı', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Side Plank', 4, '45sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 3
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Full Body Strength - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 5, 'Gün 3 - Strength', 'Yoğun güç çalışması', 90, 480 FROM prog;

-- Gün 3 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 3 - Strength' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Front Squat', 5, '5', 'Vücut Ağırlığı', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Incline Bench Press', 5, '5', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Romanian Deadlift', 4, '8', 'Vücut Ağırlığı', 'Alt Vücut', 3 FROM day
UNION ALL
SELECT id, 'Mountain Climber', 3, '30sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 4
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Full Body Strength - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 7, 'Gün 4 - Strength', 'Kardiyo ve core', 60, 480 FROM prog;

-- Gün 4 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 4 - Strength' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Burpees', 4, '20', 'Vücut Ağırlığı', 'Diğer', 1 FROM day
UNION ALL
SELECT id, 'Jump Rope', 3, '1dk', 'Vücut Ağırlığı', 'Diğer', 2 FROM day
UNION ALL
SELECT id, 'Core Circuit', 3, '3 tur', 'Vücut Ağırlığı', 'Diğer', 3 FROM day
UNION ALL
SELECT id, 'Stretching', 1, '10dk', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- ============================================

-- PROGRAM 10: Hybrid HIIT & Strength - İleri
INSERT INTO template_programs (name, description, level, program_type, days_per_week, duration_weeks, estimated_calories_per_session, icon_emoji, color_hex)
VALUES 
('Hybrid HIIT & Strength - İleri', 'Haftada 4 gün HIIT ve güç antrenmanı kombinasyonu. İleri seviye kondisyon ve güç için ideal.', 'İleri', 'Hybrid', 4, 6, 550, '⚡', '#FF4757');

-- Gün 1
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Hybrid HIIT & Strength - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 1, 'Gün 1 - Hybrid', 'HIIT ve güç kombinasyonu', 70, 550 FROM prog;

-- Gün 1 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 1 - Hybrid' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Barbell Complex', 5, '5', 'Vücut Ağırlığı', 'Diğer', 1 FROM day
UNION ALL
SELECT id, 'Jump Rope', 3, '1dk', 'Vücut Ağırlığı', 'Diğer', 2 FROM day
UNION ALL
SELECT id, 'Plank', 4, '1dk', 'Vücut Ağırlığı', 'Diğer', 3 FROM day
UNION ALL
SELECT id, 'Burpees', 3, '20', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 2
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Hybrid HIIT & Strength - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 3, 'Gün 2 - Hybrid', 'HIIT ve güç kombinasyonu', 70, 550 FROM prog;

-- Gün 2 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 2 - Hybrid' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Kettlebell Swing', 4, '15', 'Vücut Ağırlığı', 'Diğer', 1 FROM day
UNION ALL
SELECT id, 'Push Up', 4, '20', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Mountain Climber', 4, '30sn', 'Vücut Ağırlığı', 'Diğer', 3 FROM day
UNION ALL
SELECT id, 'Russian Twist', 3, '20', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 3
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Hybrid HIIT & Strength - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 5, 'Gün 3 - Hybrid', 'HIIT ve güç kombinasyonu', 70, 550 FROM prog;

-- Gün 3 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 3 - Hybrid' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Sprint Interval', 10, '20sn', 'Vücut Ağırlığı', 'Diğer', 1 FROM day
UNION ALL
SELECT id, 'Squat Jump', 3, '20', 'Vücut Ağırlığı', 'Alt Vücut', 2 FROM day
UNION ALL
SELECT id, 'Pull Up', 4, '10', 'Vücut Ağırlığı', 'Üst Vücut', 3 FROM day
UNION ALL
SELECT id, 'Side Plank', 3, '45sn', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- Gün 4
WITH prog AS (SELECT id FROM template_programs WHERE name = 'Hybrid HIIT & Strength - İleri' LIMIT 1)
INSERT INTO template_program_days (template_program_id, day_number, day_name, description, estimated_duration_minutes, estimated_calories)
SELECT id, 7, 'Gün 4 - Hybrid', 'HIIT ve güç kombinasyonu', 70, 550 FROM prog;

-- Gün 4 Egzersizleri
WITH day AS (SELECT id FROM template_program_days WHERE day_name = 'Gün 4 - Hybrid' LIMIT 1)
INSERT INTO template_exercises (template_program_day_id, name, sets, reps, weight, category, order_index)
SELECT id, 'Deadlift', 5, '5', 'Vücut Ağırlığı', 'Alt Vücut', 1 FROM day
UNION ALL
SELECT id, 'Bench Press', 5, '5', 'Vücut Ağırlığı', 'Üst Vücut', 2 FROM day
UNION ALL
SELECT id, 'Core Finisher', 3, '3 tur', 'Vücut Ağırlığı', 'Diğer', 3 FROM day
UNION ALL
SELECT id, 'Stretching', 1, '10dk', 'Vücut Ağırlığı', 'Diğer', 4 FROM day;

-- ============================================
-- NOT: Programlar Sıralandı ve Tutarlı Hale Getirildi
-- ============================================
-- 
-- ✅ Seviye isimleri: Başlangıç, Orta, İleri (hepsi Türkçe)
-- ✅ Program sırası: Başlangıç -> Orta -> İleri
-- ✅ Açıklamalar: Türkçe (frontend'de İngilizce'ye çevrilecek)
-- ✅ Egzersiz isimleri: İngilizce (orijinal haliyle)
-- ✅ Gün açıklamaları: Türkçe
--
-- Frontend'de translateProgramDescription() ile İngilizce'ye otomatik çevrilir.
-- Egzersiz isimleri hiç çevrilmez (orijinal kalır).
--

-- ============================================
-- BAŞARILI MESAJI
-- ============================================

SELECT '✅ Detaylı hazır programlar başarıyla eklendi!' as message;
SELECT '📊 Toplam Program Sayısı: ' || COUNT(*) as program_count FROM template_programs;
SELECT '📊 Toplam Gün Sayısı: ' || COUNT(*) as day_count FROM template_program_days;
SELECT '📊 Toplam Egzersiz Sayısı: ' || COUNT(*) as exercise_count FROM template_exercises;
