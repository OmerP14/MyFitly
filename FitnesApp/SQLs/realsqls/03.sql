-- ============================================
-- EKSİK TABLOLAR: MOTİVASYON SERVİSİ
-- Bu dosyayı 01.sql'den sonra çalıştırın
-- ============================================

-- User Achievements tablosu
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    color TEXT DEFAULT '#FF6B35',
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Streaks tablosu
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    streak_type TEXT NOT NULL DEFAULT 'workout',
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, streak_type)
);

-- ============================================
-- INDEX'LER
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_type ON user_streaks(streak_type);

-- ============================================
-- RLS AKTIF ET
-- ============================================

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLİTİKALAR
-- ============================================

-- User Achievements politikası
DROP POLICY IF EXISTS "Users can manage their achievements" ON user_achievements;
CREATE POLICY "Users can manage their achievements" ON user_achievements
    FOR ALL USING (auth.uid() = user_id);

-- User Streaks politikası
DROP POLICY IF EXISTS "Users can manage their streaks" ON user_streaks;
CREATE POLICY "Users can manage their streaks" ON user_streaks
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- RPC FONKSİYONLARI
-- ============================================

-- Kullanıcı başarımlarını getir
DROP FUNCTION IF EXISTS get_user_achievements(uuid);
CREATE OR REPLACE FUNCTION get_user_achievements(user_uuid uuid)
RETURNS TABLE (
    id uuid,
    achievement_type text,
    title text,
    description text,
    icon_name text,
    color text,
    unlocked_at timestamp with time zone,
    created_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.id,
        ua.achievement_type,
        ua.title,
        ua.description,
        ua.icon_name,
        ua.color,
        ua.unlocked_at,
        ua.created_at
    FROM user_achievements ua
    WHERE ua.user_id = user_uuid
    ORDER BY ua.unlocked_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcı serilerini getir
DROP FUNCTION IF EXISTS get_user_streaks(uuid);
CREATE OR REPLACE FUNCTION get_user_streaks(user_uuid uuid)
RETURNS TABLE (
    id uuid,
    streak_type text,
    current_streak integer,
    longest_streak integer,
    last_activity_date date,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.id,
        us.streak_type,
        us.current_streak,
        us.longest_streak,
        us.last_activity_date,
        us.created_at,
        us.updated_at
    FROM user_streaks us
    WHERE us.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Başarım ekle
DROP FUNCTION IF EXISTS add_user_achievement;
CREATE OR REPLACE FUNCTION add_user_achievement(
    user_uuid uuid,
    achievement_type_param text,
    title_param text,
    description_param text DEFAULT NULL,
    icon_name_param text DEFAULT 'star',
    color_param text DEFAULT '#FF6B35'
)
RETURNS uuid AS $$
DECLARE
    achievement_id uuid;
BEGIN
    -- Önce bu başarımı daha önce kazanmış mı kontrol et
    SELECT id INTO achievement_id
    FROM user_achievements 
    WHERE user_id = user_uuid AND achievement_type = achievement_type_param;
    
    -- Eğer zaten varsa, mevcut ID'yi döndür
    IF achievement_id IS NOT NULL THEN
        RETURN achievement_id;
    END IF;
    
    -- Yoksa yeni başarım ekle
    INSERT INTO user_achievements (user_id, achievement_type, title, description, icon_name, color)
    VALUES (user_uuid, achievement_type_param, title_param, description_param, icon_name_param, color_param)
    RETURNING id INTO achievement_id;
    
    RETURN achievement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seri güncelle
DROP FUNCTION IF EXISTS update_user_streak;
CREATE OR REPLACE FUNCTION update_user_streak(
    user_uuid uuid,
    streak_type_param text,
    new_streak integer,
    activity_date date DEFAULT CURRENT_DATE
)
RETURNS void AS $$
DECLARE
    existing_streak record;
BEGIN
    -- Mevcut seriyi kontrol et
    SELECT current_streak, longest_streak INTO existing_streak
    FROM user_streaks 
    WHERE user_id = user_uuid AND user_streaks.streak_type = streak_type_param;
    
    IF existing_streak IS NOT NULL THEN
        -- Güncelle
        UPDATE user_streaks 
        SET 
            current_streak = new_streak,
            longest_streak = GREATEST(longest_streak, new_streak),
            last_activity_date = activity_date,
            updated_at = NOW()
        WHERE user_id = user_uuid AND streak_type = streak_type_param;
    ELSE
        -- Yeni seri oluştur
        INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
        VALUES (user_uuid, streak_type_param, new_streak, new_streak, activity_date);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ✅ MOTİVASYON TABLOLARI TAMAMLANDI!
-- ============================================









