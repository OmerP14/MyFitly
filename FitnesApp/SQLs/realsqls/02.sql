-- ============================================
-- RPC TEMİZLEME VE YENİDEN BAŞLATMA
-- Bu dosyayı 01.sql'den sonra çalıştırın
-- ============================================

-- ⚠️ DİKKAT: Bu script eski RPC fonksiyonlarını silecek!

-- ============================================
-- 1. ADIM: ESKİ RPC FONKSİYONLARINI TEMİZLE
-- ============================================

-- Motivasyon quotes RPC'lerini sil
DROP FUNCTION IF EXISTS get_random_motivation_quote(TEXT);
DROP FUNCTION IF EXISTS get_random_motivation_quote;

-- Tracking dashboard RPC'sini sil
DROP FUNCTION IF EXISTS get_tracking_dashboard_stats(UUID);
DROP FUNCTION IF EXISTS get_tracking_dashboard_stats;

-- Diğer eski RPC'leri sil (varsa)
DROP FUNCTION IF EXISTS get_user_achievements(UUID);
DROP FUNCTION IF EXISTS get_user_streaks(UUID);
DROP FUNCTION IF EXISTS add_user_achievement;
DROP FUNCTION IF EXISTS update_user_streak;

-- Weight tracking RPC'leri (kullanılmıyorsa sil)
DROP FUNCTION IF EXISTS add_weight_entry;
DROP FUNCTION IF EXISTS update_weight_entry;
DROP FUNCTION IF EXISTS delete_weight_entry;
DROP FUNCTION IF EXISTS bulk_add_weight_entries;

-- Strength tracking RPC'leri (kullanılmıyorsa sil)
DROP FUNCTION IF EXISTS add_strength_entry;
DROP FUNCTION IF EXISTS get_strength_data;
DROP FUNCTION IF EXISTS get_exercise_max_weights;
DROP FUNCTION IF EXISTS update_strength_entry;
DROP FUNCTION IF EXISTS delete_strength_entry;
DROP FUNCTION IF EXISTS bulk_add_strength_entries;











