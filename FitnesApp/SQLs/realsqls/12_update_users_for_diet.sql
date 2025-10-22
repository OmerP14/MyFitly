-- ============================================
-- USERS TABLOSUNU DİYET MODÜLÜ İÇİN GÜNCELLEME
-- Mevcut users tablosuna diyet modülü için gerekli alanları ekler
-- ============================================

-- Users tablosuna diyet modülü için gerekli alanları ekle
DO $$
BEGIN
    -- Gender alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'gender'
    ) THEN
        ALTER TABLE users ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female'));
        RAISE NOTICE '✅ users.gender sütunu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ users.gender sütunu zaten mevcut';
    END IF;

    -- Age alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'age'
    ) THEN
        ALTER TABLE users ADD COLUMN age INTEGER CHECK (age >= 10 AND age <= 100);
        RAISE NOTICE '✅ users.age sütunu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ users.age sütunu zaten mevcut';
    END IF;

    -- Height alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'height'
    ) THEN
        ALTER TABLE users ADD COLUMN height INTEGER CHECK (height >= 100 AND height <= 250);
        RAISE NOTICE '✅ users.height sütunu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ users.height sütunu zaten mevcut';
    END IF;

    -- Body fat percentage alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'body_fat_percentage'
    ) THEN
        ALTER TABLE users ADD COLUMN body_fat_percentage DECIMAL(5,2) CHECK (body_fat_percentage >= 5 AND body_fat_percentage <= 50);
        RAISE NOTICE '✅ users.body_fat_percentage sütunu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ users.body_fat_percentage sütunu zaten mevcut';
    END IF;

    -- Diet preferences alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'diet_preferences'
    ) THEN
        ALTER TABLE users ADD COLUMN diet_preferences JSONB;
        RAISE NOTICE '✅ users.diet_preferences sütunu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ users.diet_preferences sütunu zaten mevcut';
    END IF;

    -- Allergies alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'allergies'
    ) THEN
        ALTER TABLE users ADD COLUMN allergies TEXT[];
        RAISE NOTICE '✅ users.allergies sütunu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ users.allergies sütunu zaten mevcut';
    END IF;

    -- Dietary restrictions alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'dietary_restrictions'
    ) THEN
        ALTER TABLE users ADD COLUMN dietary_restrictions TEXT[];
        RAISE NOTICE '✅ users.dietary_restrictions sütunu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ users.dietary_restrictions sütunu zaten mevcut';
    END IF;

    -- Water goal alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'water_goal_ml'
    ) THEN
        ALTER TABLE users ADD COLUMN water_goal_ml INTEGER DEFAULT 2500 CHECK (water_goal_ml >= 1000 AND water_goal_ml <= 5000);
        RAISE NOTICE '✅ users.water_goal_ml sütunu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ users.water_goal_ml sütunu zaten mevcut';
    END IF;

    -- Meal reminders enabled alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'meal_reminders_enabled'
    ) THEN
        ALTER TABLE users ADD COLUMN meal_reminders_enabled BOOLEAN DEFAULT true;
        RAISE NOTICE '✅ users.meal_reminders_enabled sütunu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ users.meal_reminders_enabled sütunu zaten mevcut';
    END IF;

    -- Water reminders enabled alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'water_reminders_enabled'
    ) THEN
        ALTER TABLE users ADD COLUMN water_reminders_enabled BOOLEAN DEFAULT true;
        RAISE NOTICE '✅ users.water_reminders_enabled sütunu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ users.water_reminders_enabled sütunu zaten mevcut';
    END IF;

    -- Reminder frequency alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'reminder_frequency_hours'
    ) THEN
        ALTER TABLE users ADD COLUMN reminder_frequency_hours INTEGER DEFAULT 3 CHECK (reminder_frequency_hours >= 1 AND reminder_frequency_hours <= 12);
        RAISE NOTICE '✅ users.reminder_frequency_hours sütunu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ users.reminder_frequency_hours sütunu zaten mevcut';
    END IF;

END $$;

-- ============================================
-- MEVCUT KULLANICILAR İÇİN VARSayILAN DEĞERLER
-- ============================================

-- Mevcut kullanıcılar için varsayılan değerler güncelle
UPDATE users 
SET 
    water_goal_ml = COALESCE(water_goal_ml, 2500),
    meal_reminders_enabled = COALESCE(meal_reminders_enabled, true),
    water_reminders_enabled = COALESCE(water_reminders_enabled, true),
    reminder_frequency_hours = COALESCE(reminder_frequency_hours, 3)
WHERE 
    water_goal_ml IS NULL 
    OR meal_reminders_enabled IS NULL 
    OR water_reminders_enabled IS NULL 
    OR reminder_frequency_hours IS NULL;

-- ============================================
-- YARDIMCI VIEW'LAR
-- ============================================

-- Kullanıcı diyet bilgileri view'ı
CREATE OR REPLACE VIEW user_diet_info AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.gender,
    u.age,
    u.height,
    u.current_weight,
    u.target_weight,
    u.body_fat_percentage,
    u.diet_preferences,
    u.allergies,
    u.dietary_restrictions,
    u.water_goal_ml,
    u.meal_reminders_enabled,
    u.water_reminders_enabled,
    u.reminder_frequency_hours,
    u.created_at,
    u.updated_at,
    -- Diyet profili bilgileri
    dp.activity_level,
    dp.goal_type,
    dp.goal_percentage,
    dp.diet_type,
    dp.bmr,
    dp.tdee,
    dp.target_calories,
    dp.target_protein_g,
    dp.target_fat_g,
    dp.target_carb_g,
    dp.target_fiber_g
FROM users u
LEFT JOIN diet_profiles dp ON u.id = dp.user_id AND dp.is_active = true;

-- ============================================
-- GÜNCELLEME TRİGGER'LARI
-- ============================================

-- Users tablosu güncellendiğinde diet_profiles tablosunu senkronize et
CREATE OR REPLACE FUNCTION sync_user_diet_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Diet profile varsa güncelle, yoksa oluştur
    INSERT INTO diet_profiles (
        user_id, gender, age, height_cm, weight_kg, body_fat_percentage,
        water_goal_ml, meal_reminders_enabled, water_reminders_enabled, reminder_frequency_hours
    )
    VALUES (
        NEW.id, NEW.gender, NEW.age, NEW.height, NEW.current_weight, NEW.body_fat_percentage,
        NEW.water_goal_ml, NEW.meal_reminders_enabled, NEW.water_reminders_enabled, NEW.reminder_frequency_hours
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        gender = EXCLUDED.gender,
        age = EXCLUDED.age,
        height_cm = EXCLUDED.height_cm,
        weight_kg = EXCLUDED.weight_kg,
        body_fat_percentage = EXCLUDED.body_fat_percentage,
        water_goal_ml = EXCLUDED.water_goal_ml,
        meal_reminders_enabled = EXCLUDED.meal_reminders_enabled,
        water_reminders_enabled = EXCLUDED.water_reminders_enabled,
        reminder_frequency_hours = EXCLUDED.reminder_frequency_hours,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users tablosu için trigger oluştur
DROP TRIGGER IF EXISTS trigger_sync_user_diet_profile ON users;
CREATE TRIGGER trigger_sync_user_diet_profile
    AFTER INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_diet_profile();

-- ============================================
-- BAŞARILI GÜNCELLEME MESAJI
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Users tablosu diyet modülü için başarıyla güncellendi!';
    RAISE NOTICE '📊 Eklenen/Güncellenen sütunlar:';
    RAISE NOTICE '   - gender (Cinsiyet)';
    RAISE NOTICE '   - age (Yaş)';
    RAISE NOTICE '   - height (Boy)';
    RAISE NOTICE '   - body_fat_percentage (Vücut yağ oranı)';
    RAISE NOTICE '   - diet_preferences (Diyet tercihleri)';
    RAISE NOTICE '   - allergies (Alerjiler)';
    RAISE NOTICE '   - dietary_restrictions (Diyet kısıtlamaları)';
    RAISE NOTICE '   - water_goal_ml (Günlük su hedefi)';
    RAISE NOTICE '   - meal_reminders_enabled (Öğün hatırlatıcıları)';
    RAISE NOTICE '   - water_reminders_enabled (Su hatırlatıcıları)';
    RAISE NOTICE '   - reminder_frequency_hours (Hatırlatıcı sıklığı)';
    RAISE NOTICE '🔄 Oluşturulan view: user_diet_info';
    RAISE NOTICE '⚡ Oluşturulan trigger: sync_user_diet_profile';
    RAISE NOTICE '🎯 Mevcut kullanıcılar için varsayılan değerler ayarlandı';
END $$;




