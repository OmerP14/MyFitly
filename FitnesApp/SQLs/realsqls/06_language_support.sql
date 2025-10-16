-- ============================================
-- DİL DESTEĞİ - MOTİVASYON SÖZLERİ
-- Bu dosyayı 04.sql'den sonra çalıştırın
-- ============================================

-- motivation_quotes tablosu VARSA dil sütunu ve veriler eklensin
DO $$
BEGIN
  IF to_regclass('public.motivation_quotes') IS NOT NULL THEN
    -- Motivasyon sözlerine dil sütunu ekle
    ALTER TABLE motivation_quotes 
    ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'tr';

    -- Mevcut sözleri Türkçe olarak işaretle
    UPDATE motivation_quotes SET language = 'tr' WHERE language IS NULL OR language = 'tr';

    -- İngilizce motivasyon sözlerini ekle
    INSERT INTO motivation_quotes (quote_text, author, category, language) VALUES
      ('Discipline is stronger than motivation.', 'Anonymous', 'discipline', 'en'),
      ('Success is the sum of small efforts repeated.', 'Robert Collier', 'success', 'en'),
      ('Your body can stand almost anything. It''s your mind that you have to convince.', 'Arnold Schwarzenegger', 'mindset', 'en'),
      ('A year from now you may wish you had started today.', 'Karen Lamb', 'motivation', 'en'),
      ('Pain is temporary, pride is forever.', 'Anonymous', 'strength', 'en'),
      ('The workout you didn''t do today, you won''t do tomorrow either.', 'Anonymous', 'discipline', 'en'),
      ('Muscle soreness is the rising voice of success.', 'Anonymous', 'strength', 'en'),
      ('There is no such thing as impossible, only unprepared minds.', 'Bruce Lee', 'mindset', 'en'),
      ('The only bad workout is the one that didn''t happen.', 'Anonymous', 'motivation', 'en'),
      ('Your only limit is you.', 'Anonymous', 'mindset', 'en'),
      ('Don''t wish for it, work for it.', 'Anonymous', 'motivation', 'en'),
      ('Sweat is fat crying.', 'Anonymous', 'strength', 'en'),
      ('The pain you feel today will be the strength you feel tomorrow.', 'Anonymous', 'strength', 'en'),
      ('Make yourself proud.', 'Anonymous', 'motivation', 'en'),
      ('Push yourself because no one else is going to do it for you.', 'Anonymous', 'discipline', 'en'),
      ('Great things never come from comfort zones.', 'Anonymous', 'motivation', 'en'),
      ('Dream it. Wish it. Do it.', 'Anonymous', 'success', 'en'),
      ('Success starts with self-discipline.', 'Anonymous', 'discipline', 'en'),
      ('Be stronger than your excuses.', 'Anonymous', 'mindset', 'en'),
      ('It''s going to be hard, but hard does not mean impossible.', 'Anonymous', 'motivation', 'en');

    -- Daha fazla Türkçe söz ekle
    INSERT INTO motivation_quotes (quote_text, author, category, language) VALUES
      ('Başarısızlık, başarının ilk adımıdır.', 'Anonim', 'success', 'tr'),
      ('Güçlü olmak sadece fiziksel değil, zihinseldir.', 'Anonim', 'mindset', 'tr'),
      ('Her gün biraz daha iyiye gidiyorsun.', 'Anonim', 'motivation', 'tr'),
      ('Bugünkü acın, yarınki gücündür.', 'Anonim', 'strength', 'tr'),
      ('Hedefine odaklan, engelleri değil.', 'Anonim', 'mindset', 'tr'),
      ('Kendinle yarış, başkalarıyla değil.', 'Anonim', 'motivation', 'tr'),
      ('Bugün yapmazsın, yarın da yapmazsın.', 'Anonim', 'discipline', 'tr'),
      ('Sınırların sadece kafandadır.', 'Anonim', 'mindset', 'tr'),
      ('Başarı, küçük adımların toplamıdır.', 'Anonim', 'success', 'tr'),
      ('Güçlü kal, vazgeçme.', 'Anonim', 'strength', 'tr');

    -- Index ekle
    CREATE INDEX IF NOT EXISTS idx_motivation_quotes_language ON motivation_quotes(language);
    CREATE INDEX IF NOT EXISTS idx_motivation_quotes_language_category ON motivation_quotes(language, category);
  END IF;
END $$;

-- ============================================
-- KULLANICI DİL TERCİHİ EKLEME
-- ============================================

-- Users tablosuna preferred_language sütunu ekle
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(5) DEFAULT 'tr';

-- Açıklama ekle
COMMENT ON COLUMN users.preferred_language IS 'Kullanıcının tercih ettiği dil (tr, en, vb.)';

-- Index oluştur
CREATE INDEX IF NOT EXISTS idx_users_preferred_language ON users(preferred_language);

-- ============================================
-- ✅ DİL DESTEĞİ EKLENDİ!
-- ============================================




