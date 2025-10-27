-- ============================================
-- PROGRAM DETAYLARI DÜZELTMELERİ
-- Bu dosyayı 07_detailed_programs.sql'den sonra çalıştırın
-- ============================================

-- ============================================
-- GÜN İSİMLERİNİ DÜZELT
-- ============================================

-- Core & Cardio - Başlangıç gün isimlerini düzelt
UPDATE template_program_days 
SET day_name = 'Monday - Core & Cardio'
WHERE day_name = 'Gün 1 - Core & Cardio';

UPDATE template_program_days 
SET day_name = 'Wednesday - Core & Cardio'
WHERE day_name = 'Gün 2 - Core & Cardio';

UPDATE template_program_days 
SET day_name = 'Friday - Core & Cardio'
WHERE day_name = 'Gün 3 - Core & Cardio';

-- Upper Body - Başlangıç gün isimlerini düzelt
UPDATE template_program_days 
SET day_name = 'Monday - Upper Body'
WHERE day_name = 'Gün 1 - Upper Body';

UPDATE template_program_days 
SET day_name = 'Thursday - Upper Body'
WHERE day_name = 'Gün 2 - Upper Body';

-- Full Body - Orta gün isimlerini düzelt
UPDATE template_program_days 
SET day_name = 'Monday - Full Body'
WHERE day_name = 'Gün 1 - Full Body';

UPDATE template_program_days 
SET day_name = 'Wednesday - Full Body'
WHERE day_name = 'Gün 2 - Full Body';

UPDATE template_program_days 
SET day_name = 'Friday - Full Body'
WHERE day_name = 'Gün 3 - Full Body';

UPDATE template_program_days 
SET day_name = 'Sunday - Full Body'
WHERE day_name = 'Gün 4 - Full Body';

-- Core & Cardio - Orta gün isimlerini düzelt
UPDATE template_program_days 
SET day_name = 'Monday - Core & Cardio'
WHERE day_name = 'Gün 1 - Core & Cardio' AND template_program_id IN (
    SELECT id FROM template_programs WHERE name = 'Core & Cardio - Orta'
);

UPDATE template_program_days 
SET day_name = 'Wednesday - Core & Cardio'
WHERE day_name = 'Gün 2 - Core & Cardio' AND template_program_id IN (
    SELECT id FROM template_programs WHERE name = 'Core & Cardio - Orta'
);

UPDATE template_program_days 
SET day_name = 'Friday - Core & Cardio'
WHERE day_name = 'Gün 3 - Core & Cardio' AND template_program_id IN (
    SELECT id FROM template_programs WHERE name = 'Core & Cardio - Orta'
);

-- Full Body Strength - İleri gün isimlerini düzelt
UPDATE template_program_days 
SET day_name = 'Monday - Strength'
WHERE day_name = 'Gün 1 - Strength';

UPDATE template_program_days 
SET day_name = 'Wednesday - Strength'
WHERE day_name = 'Gün 2 - Strength';

UPDATE template_program_days 
SET day_name = 'Friday - Strength'
WHERE day_name = 'Gün 3 - Strength';

UPDATE template_program_days 
SET day_name = 'Sunday - Strength'
WHERE day_name = 'Gün 4 - Strength';

-- Hybrid HIIT & Strength - İleri gün isimlerini düzelt
UPDATE template_program_days 
SET day_name = 'Monday - Hybrid'
WHERE day_name = 'Gün 1 - Hybrid';

UPDATE template_program_days 
SET day_name = 'Wednesday - Hybrid'
WHERE day_name = 'Gün 2 - Hybrid';

UPDATE template_program_days 
SET day_name = 'Friday - Hybrid'
WHERE day_name = 'Gün 3 - Hybrid';

UPDATE template_program_days 
SET day_name = 'Sunday - Hybrid'
WHERE day_name = 'Gün 4 - Hybrid';

-- ============================================
-- AÇIKLAMALARI İNGİLİZCE'YE ÇEVİR
-- ============================================

-- Gün açıklamalarını İngilizce'ye çevir
UPDATE template_program_days 
SET description = 'Basic movements with full body'
WHERE description = 'Temel hareketler ile tüm vücut';

UPDATE template_program_days 
SET description = 'Cardio and core movements'
WHERE description = 'Kardiyo ve core hareketleri';

UPDATE template_program_days 
SET description = 'Upper body strengthening'
WHERE description = 'Üst vücut güçlendirme';

UPDATE template_program_days 
SET description = 'Strength focused full body'
WHERE description = 'Güç odaklı tüm vücut';

UPDATE template_program_days 
SET description = 'Push movements focused'
WHERE description = 'İtme hareketleri odaklı';

UPDATE template_program_days 
SET description = 'Pull movements focused'
WHERE description = 'Çekme hareketleri odaklı';

UPDATE template_program_days 
SET description = 'Leg movements focused'
WHERE description = 'Bacak hareketleri odaklı';

UPDATE template_program_days 
SET description = 'Upper body workout'
WHERE description = 'Üst vücut çalışması';

UPDATE template_program_days 
SET description = 'Lower body workout'
WHERE description = 'Alt vücut çalışması';

UPDATE template_program_days 
SET description = 'Cardio and core'
WHERE description = 'Kardiyo ve core';

UPDATE template_program_days 
SET description = 'Intense strength workout'
WHERE description = 'Yoğun güç çalışması';

UPDATE template_program_days 
SET description = 'HIIT and strength combination'
WHERE description = 'HIIT ve güç kombinasyonu';

UPDATE template_program_days 
SET description = 'Intense cardio and core'
WHERE description = 'Yoğun kardiyo ve core';

-- ============================================
-- EGZERSİZ AĞIRLIK BİRİMLERİNİ ÇEVİR
-- ============================================

-- Egzersiz ağırlık birimlerini İngilizce'ye çevir
UPDATE template_exercises 
SET weight = 'Body Weight'
WHERE weight = 'Vücut Ağırlığı';

UPDATE template_exercises 
SET reps = REPLACE(reps, 'sn', 'sec')
WHERE reps LIKE '%sn%';

UPDATE template_exercises 
SET reps = REPLACE(reps, 'dk', 'min')
WHERE reps LIKE '%dk%';

-- ============================================
-- PROGRAM BAŞLIKLARINI İNGİLİZCE'YE ÇEVİR
-- ============================================

-- Program isimlerini İngilizce'ye çevir
UPDATE template_programs 
SET name = 'Full Body - Beginner'
WHERE name = 'Full Body - Başlangıç';

UPDATE template_programs 
SET name = 'Core & Cardio - Beginner'
WHERE name = 'Core & Cardio - Başlangıç';

UPDATE template_programs 
SET name = 'Upper Body - Beginner'
WHERE name = 'Upper Body - Başlangıç';

UPDATE template_programs 
SET name = 'Full Body - Intermediate'
WHERE name = 'Full Body - Orta';

UPDATE template_programs 
SET name = 'Push Pull Legs - Intermediate'
WHERE name = 'Push Pull Legs - Orta';

UPDATE template_programs 
SET name = 'Upper Lower Split - Intermediate'
WHERE name = 'Upper Lower Split - Orta';

UPDATE template_programs 
SET name = 'Core & Cardio - Intermediate'
WHERE name = 'Core & Cardio - Orta';

UPDATE template_programs 
SET name = 'Push Pull Legs - Advanced'
WHERE name = 'Push Pull Legs - İleri';

UPDATE template_programs 
SET name = 'Full Body Strength - Advanced'
WHERE name = 'Full Body Strength - İleri';

UPDATE template_programs 
SET name = 'Hybrid HIIT & Strength - Advanced'
WHERE name = 'Hybrid HIIT & Strength - İleri';

-- ============================================
-- PROGRAM AÇIKLAMALARINI İNGİLİZCE'YE ÇEVİR
-- ============================================

UPDATE template_programs 
SET description = '3 days a week full body workout beginner level program. Ideal for beginners.'
WHERE name = 'Full Body - Beginner';

UPDATE template_programs 
SET description = '3 days a week cardiovascular health and core strengthening program. Ideal for beginners.'
WHERE name = 'Core & Cardio - Beginner';

UPDATE template_programs 
SET description = '2 days a week upper body focused program. Ideal for shoulders, chest, back and arms.'
WHERE name = 'Upper Body - Beginner';

UPDATE template_programs 
SET description = '4 days a week full body workout intermediate level program. Strength focused.'
WHERE name = 'Full Body - Intermediate';

UPDATE template_programs 
SET description = '3 days a week Push-Pull-Legs program. Professional program with push, pull and leg day separation.'
WHERE name = 'Push Pull Legs - Intermediate';

UPDATE template_programs 
SET description = '4 days a week upper and lower body split intermediate level program.'
WHERE name = 'Upper Lower Split - Intermediate';

UPDATE template_programs 
SET description = '3 days a week intense cardiovascular health and core strengthening program.'
WHERE name = 'Core & Cardio - Intermediate';

UPDATE template_programs 
SET description = '5 days a week intense Push-Pull-Legs program. Ideal for advanced strength and muscle development.'
WHERE name = 'Push Pull Legs - Advanced';

UPDATE template_programs 
SET description = '4 days a week intense strength focused full body program. Ideal for advanced strength gains.'
WHERE name = 'Full Body Strength - Advanced';

UPDATE template_programs 
SET description = '4 days a week HIIT and strength training combination. Ideal for advanced conditioning and strength.'
WHERE name = 'Hybrid HIIT & Strength - Advanced';

-- ============================================
-- BAŞARILI MESAJI
-- ============================================

SELECT '✅ Program detayları başarıyla İngilizce''ye çevrildi!' as message;
SELECT '📊 Güncellenen Program Sayısı: ' || COUNT(*) as updated_programs FROM template_programs;
SELECT '📊 Güncellenen Gün Sayısı: ' || COUNT(*) as updated_days FROM template_program_days;
SELECT '📊 Güncellenen Egzersiz Sayısı: ' || COUNT(*) as updated_exercises FROM template_exercises;
