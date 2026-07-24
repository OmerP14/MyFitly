-- ============================================
-- 🧹 TEMİZLEME VE YENİDEN BAŞLATMA
-- Bu dosyayı sadece sorun giderirken kullanın!
-- ============================================

-- ⚠️ DİKKAT: Bu script tüm hazır program verilerini silecek!
-- Sadece ilk kurulumda veya sorun giderirken kullanın.

-- ============================================
-- 1. ADIM: MEVCUT POLİCY'LERİ TEMİZLE
-- ============================================

DO $$ 
BEGIN
    -- template_programs policy'leri
    DROP POLICY IF EXISTS "Herkes template programları görebilir" ON template_programs;
    DROP POLICY IF EXISTS "template_programs_select_policy" ON template_programs;
    
    -- template_program_days policy'leri
    DROP POLICY IF EXISTS "Herkes template program günlerini görebilir" ON template_program_days;
    DROP POLICY IF EXISTS "template_program_days_select_policy" ON template_program_days;
    
    -- template_exercises policy'leri
    DROP POLICY IF EXISTS "Herkes template egzersizleri görebilir" ON template_exercises;
    DROP POLICY IF EXISTS "template_exercises_select_policy" ON template_exercises;
    
    RAISE NOTICE '✅ Policy''ler temizlendi';
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'ℹ️ Bazı tablolar henüz yok, devam ediliyor...';
    WHEN undefined_object THEN
        RAISE NOTICE 'ℹ️ Bazı policy''ler zaten yok, devam ediliyor...';
END $$;

-- ============================================
-- 2. ADIM: MEVCUT TABLOLARI SİL
-- ============================================

DROP TABLE IF EXISTS template_exercises CASCADE;
DROP TABLE IF EXISTS template_program_days CASCADE;
DROP TABLE IF EXISTS template_programs CASCADE;

-- Alternatif isimli tablolar da varsa onları da sil
DROP TABLE IF EXISTS template_exercises_full CASCADE;
DROP TABLE IF EXISTS template_program_days_full CASCADE;
DROP TABLE IF EXISTS template_programs_full CASCADE;

-- ============================================
-- 3. ADIM: KONTROL
-- ============================================

-- Şimdi tabloların silindiğini kontrol et
DO $$ 
DECLARE
    tablo_sayisi INTEGER;
BEGIN
    SELECT COUNT(*) INTO tablo_sayisi
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%template%';
    
    IF tablo_sayisi = 0 THEN
        RAISE NOTICE '✅ Tüm template tabloları temizlendi. Şimdi 04.sql çalıştırabilirsiniz!';
    ELSE
        RAISE NOTICE '⚠️ Hala % adet template tablosu var. Kontrol edin!', tablo_sayisi;
    END IF;
END $$;

-- ============================================
-- 🎯 SONRAKİ ADIM
-- ============================================

-- Bu script başarıyla çalıştıktan sonra:
-- → 04.sql dosyasını çalıştırın






