-- ============================================
-- MOTIVATION TABLOLARINI TEMİZLE
-- Bu dosyayı çalıştırarak motivation ile ilgili tüm tabloları silin
-- ============================================

-- User Achievements tablosunu sil
DO $$
BEGIN
  IF to_regclass('public.user_achievements') IS NOT NULL THEN
    DROP TABLE user_achievements CASCADE;
    RAISE NOTICE '✅ user_achievements tablosu silindi';
  ELSE
    RAISE NOTICE 'ℹ️ user_achievements tablosu zaten yok';
  END IF;
END $$;

-- User Streaks tablosunu sil
DO $$
BEGIN
  IF to_regclass('public.user_streaks') IS NOT NULL THEN
    DROP TABLE user_streaks CASCADE;
    RAISE NOTICE '✅ user_streaks tablosu silindi';
  ELSE
    RAISE NOTICE 'ℹ️ user_streaks tablosu zaten yok';
  END IF;
END $$;

-- Motivation Quotes tablosunu sil (varsa)
DO $$
BEGIN
  IF to_regclass('public.motivation_quotes') IS NOT NULL THEN
    DROP TABLE motivation_quotes CASCADE;
    RAISE NOTICE '✅ motivation_quotes tablosu silindi';
  ELSE
    RAISE NOTICE 'ℹ️ motivation_quotes tablosu zaten yok';
  END IF;
END $$;

-- User Favorite Quotes tablosunu sil (varsa)
DO $$
BEGIN
  IF to_regclass('public.user_favorite_quotes') IS NOT NULL THEN
    DROP TABLE user_favorite_quotes CASCADE;
    RAISE NOTICE '✅ user_favorite_quotes tablosu silindi';
  ELSE
    RAISE NOTICE 'ℹ️ user_favorite_quotes tablosu zaten yok';
  END IF;
END $$;

-- Motivation ile ilgili RPC fonksiyonlarını sil
DROP FUNCTION IF EXISTS get_user_achievements(UUID);
DROP FUNCTION IF EXISTS get_user_streaks(UUID);
DROP FUNCTION IF EXISTS add_user_achievement;
DROP FUNCTION IF EXISTS update_user_streak;
DROP FUNCTION IF EXISTS get_random_motivation_quote(TEXT);
DROP FUNCTION IF EXISTS get_random_motivation_quote;

SELECT '🎉 Motivation temizliği tamamlandı!' AS info;







