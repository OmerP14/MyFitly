-- ============================================
-- MEVCUT HAZIR PROGRAMLARI TEMİZLE
-- Bu script'i Supabase SQL Editor'da çalıştırın
-- ============================================

-- 1. Template exercises tablosunu temizle
DELETE FROM template_exercises;

-- 2. Template program days tablosunu temizle
DELETE FROM template_program_days;

-- 3. Template programs tablosunu temizle
DELETE FROM template_programs;

-- 4. Temizlik sonrası kontrol
SELECT 'Tüm template programlar temizlendi!' as mesaj;

-- ============================================
-- ✅ TEMİZLEME TAMAMLANDI!
-- Şimdi 07_detailed_programs.sql'i çalıştırabilirsiniz
-- ============================================


