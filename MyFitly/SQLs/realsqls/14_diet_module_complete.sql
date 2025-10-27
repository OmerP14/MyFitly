-- ============================================
-- DİYET MODÜLÜ - TAM KURULUM DOSYASI
-- Bu dosya tüm diyet modülü SQL dosyalarını birleştirir
-- ============================================

-- ============================================
-- 1. DİYET MODÜLÜ VERİTABANI YAPISI
-- ============================================

DO $$ BEGIN RAISE NOTICE '🚀 Diyet modülü veritabanı yapısı oluşturuluyor...'; END $$;

-- Diyet Kullanıcı Profilleri
CREATE TABLE IF NOT EXISTS diet_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Temel Bilgiler
    gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
    age INTEGER CHECK (age >= 10 AND age <= 100) NOT NULL,
    height_cm INTEGER CHECK (height_cm >= 100 AND height_cm <= 250) NOT NULL,
    weight_kg DECIMAL(5,2) CHECK (weight_kg >= 30 AND weight_kg <= 300) NOT NULL,
    body_fat_percentage DECIMAL(5,2) CHECK (body_fat_percentage >= 5 AND body_fat_percentage <= 50),
    
    -- Aktivite ve Hedef
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')) NOT NULL DEFAULT 'moderately_active',
    goal_type TEXT CHECK (goal_type IN ('lose_weight', 'maintain_weight', 'gain_weight')) NOT NULL DEFAULT 'maintain_weight',
    goal_percentage DECIMAL(5,2) DEFAULT 0,
    diet_type TEXT CHECK (diet_type IN ('balanced', 'low_carb', 'high_protein', 'mediterranean', 'ketogenic', 'intermittent_fasting')) NOT NULL DEFAULT 'balanced',
    
    -- Hesaplanmış Değerler
    bmr DECIMAL(8,2),
    tdee DECIMAL(8,2),
    target_calories DECIMAL(8,2),
    target_protein_g DECIMAL(6,2),
    target_fat_g DECIMAL(6,2),
    target_carb_g DECIMAL(6,2),
    target_fiber_g DECIMAL(6,2),
    
    -- Alerji ve Kısıtlamalar
    allergies TEXT[],
    restrictions TEXT[],
    
    -- Ayarlar
    water_goal_ml INTEGER DEFAULT 2500,
    meal_reminders_enabled BOOLEAN DEFAULT true,
    water_reminders_enabled BOOLEAN DEFAULT true,
    reminder_frequency_hours INTEGER DEFAULT 3,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Besin Veritabanı
CREATE TABLE IF NOT EXISTS foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    name_tr TEXT,
    name_en TEXT,
    
    -- Besin Değerleri (100g için)
    calories_per_100g DECIMAL(8,2) NOT NULL,
    protein_g_per_100g DECIMAL(6,2) DEFAULT 0,
    fat_g_per_100g DECIMAL(6,2) DEFAULT 0,
    carb_g_per_100g DECIMAL(6,2) DEFAULT 0,
    fiber_g_per_100g DECIMAL(6,2) DEFAULT 0,
    sugar_g_per_100g DECIMAL(6,2) DEFAULT 0,
    sodium_mg_per_100g DECIMAL(6,2) DEFAULT 0,
    
    -- Kategori ve Etiketler
    category TEXT,
    subcategory TEXT,
    cuisine TEXT,
    
    -- Alerjen ve Kısıtlama Bilgileri
    allergens TEXT[],
    dietary_info TEXT[],
    
    -- Barkod ve Kaynak
    barcode TEXT UNIQUE,
    source TEXT DEFAULT 'manual',
    verified BOOLEAN DEFAULT false,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Öğün Planları
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    diet_profile_id UUID REFERENCES diet_profiles(id) ON DELETE CASCADE,
    
    plan_name TEXT NOT NULL,
    plan_type TEXT CHECK (plan_type IN ('weekly', 'custom')) DEFAULT 'weekly',
    start_date DATE NOT NULL,
    end_date DATE,
    
    -- Plan Ayarları
    meals_per_day INTEGER DEFAULT 5,
    calories_per_day DECIMAL(8,2),
    protein_per_day DECIMAL(6,2),
    fat_per_day DECIMAL(6,2),
    carb_per_day DECIMAL(6,2),
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, plan_name)
);

-- Planlanmış Öğünler
CREATE TABLE IF NOT EXISTS planned_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack')) NOT NULL,
    meal_order INTEGER DEFAULT 0,
    
    -- Besin Bilgileri
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
    food_name TEXT,
    portion_size_g DECIMAL(8,2) NOT NULL,
    
    -- Hesaplanmış Değerler
    calories DECIMAL(8,2),
    protein_g DECIMAL(6,2),
    fat_g DECIMAL(6,2),
    carb_g DECIMAL(6,2),
    fiber_g DECIMAL(6,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Günlük Besin Kayıtları
CREATE TABLE IF NOT EXISTS food_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    log_date DATE NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack')) NOT NULL,
    log_time TIME,
    
    -- Besin Bilgileri
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
    food_name TEXT NOT NULL,
    portion_size_g DECIMAL(8,2) NOT NULL,
    
    -- Hesaplanmış Değerler
    calories DECIMAL(8,2),
    protein_g DECIMAL(6,2),
    fat_g DECIMAL(6,2),
    carb_g DECIMAL(6,2),
    fiber_g DECIMAL(6,2),
    
    -- Notlar
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Su Kayıtları
CREATE TABLE IF NOT EXISTS water_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    log_date DATE NOT NULL,
    log_time TIME,
    amount_ml INTEGER NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Günlük Özet İstatistikleri
CREATE TABLE IF NOT EXISTS daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    
    -- Toplam Tüketim
    total_calories DECIMAL(8,2) DEFAULT 0,
    total_protein_g DECIMAL(6,2) DEFAULT 0,
    total_fat_g DECIMAL(6,2) DEFAULT 0,
    total_carb_g DECIMAL(6,2) DEFAULT 0,
    total_fiber_g DECIMAL(6,2) DEFAULT 0,
    total_water_ml INTEGER DEFAULT 0,
    
    -- Hedef Karşılaştırması
    target_calories DECIMAL(8,2),
    target_protein_g DECIMAL(6,2),
    target_fat_g DECIMAL(6,2),
    target_carb_g DECIMAL(6,2),
    target_fiber_g DECIMAL(6,2),
    target_water_ml INTEGER,
    
    -- İlerleme Yüzdeleri
    calorie_percentage DECIMAL(5,2) DEFAULT 0,
    protein_percentage DECIMAL(5,2) DEFAULT 0,
    fat_percentage DECIMAL(5,2) DEFAULT 0,
    carb_percentage DECIMAL(5,2) DEFAULT 0,
    fiber_percentage DECIMAL(5,2) DEFAULT 0,
    water_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Öğün Sayıları
    meals_logged INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, summary_date)
);

-- Diyet Başarıları ve Rozetler
CREATE TABLE IF NOT EXISTS diet_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    description TEXT,
    icon_emoji TEXT,
    points INTEGER DEFAULT 0,
    
    -- Başarı Kriterleri
    criteria_type TEXT,
    criteria_value DECIMAL(10,2),
    criteria_period TEXT,
    
    -- Başarı Durumu
    is_achieved BOOLEAN DEFAULT false,
    achieved_at TIMESTAMP WITH TIME ZONE,
    progress_value DECIMAL(10,2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Besin Favorileri
CREATE TABLE IF NOT EXISTS food_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
    
    -- Favori Ayarları
    custom_portion_g DECIMAL(8,2),
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, food_id)
);

-- ============================================
-- 2. USERS TABLOSUNU GÜNCELLEME
-- ============================================

DO $$ BEGIN RAISE NOTICE '🔄 Users tablosu diyet modülü için güncelleniyor...'; END $$;

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
    END IF;

    -- Age alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'age'
    ) THEN
        ALTER TABLE users ADD COLUMN age INTEGER CHECK (age >= 10 AND age <= 100);
    END IF;

    -- Height alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'height'
    ) THEN
        ALTER TABLE users ADD COLUMN height INTEGER CHECK (height >= 100 AND height <= 250);
    END IF;

    -- Body fat percentage alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'body_fat_percentage'
    ) THEN
        ALTER TABLE users ADD COLUMN body_fat_percentage DECIMAL(5,2) CHECK (body_fat_percentage >= 5 AND body_fat_percentage <= 50);
    END IF;

    -- Diet preferences alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'diet_preferences'
    ) THEN
        ALTER TABLE users ADD COLUMN diet_preferences JSONB;
    END IF;

    -- Allergies alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'allergies'
    ) THEN
        ALTER TABLE users ADD COLUMN allergies TEXT[];
    END IF;

    -- Dietary restrictions alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'dietary_restrictions'
    ) THEN
        ALTER TABLE users ADD COLUMN dietary_restrictions TEXT[];
    END IF;

    -- Water goal alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'water_goal_ml'
    ) THEN
        ALTER TABLE users ADD COLUMN water_goal_ml INTEGER DEFAULT 2500 CHECK (water_goal_ml >= 1000 AND water_goal_ml <= 5000);
    END IF;

    -- Meal reminders enabled alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'meal_reminders_enabled'
    ) THEN
        ALTER TABLE users ADD COLUMN meal_reminders_enabled BOOLEAN DEFAULT true;
    END IF;

    -- Water reminders enabled alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'water_reminders_enabled'
    ) THEN
        ALTER TABLE users ADD COLUMN water_reminders_enabled BOOLEAN DEFAULT true;
    END IF;

    -- Reminder frequency alanı ekle (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'reminder_frequency_hours'
    ) THEN
        ALTER TABLE users ADD COLUMN reminder_frequency_hours INTEGER DEFAULT 3 CHECK (reminder_frequency_hours >= 1 AND reminder_frequency_hours <= 12);
    END IF;
END $$;

-- ============================================
-- 3. İNDEKSLER
-- ============================================

DO $$ BEGIN RAISE NOTICE '📊 İndeksler oluşturuluyor...'; END $$;

-- Performans için indeksler
CREATE INDEX IF NOT EXISTS idx_diet_profiles_user_id ON diet_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_barcode ON foods(barcode);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_planned_meals_meal_plan_id ON planned_meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_planned_meals_day_meal ON planned_meals(day_of_week, meal_type);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_food_logs_meal_type ON food_logs(meal_type);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, summary_date);
CREATE INDEX IF NOT EXISTS idx_diet_achievements_user ON diet_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_food_favorites_user ON food_favorites(user_id);

-- ============================================
-- 4. FONKSİYONLAR
-- ============================================

DO $$ BEGIN RAISE NOTICE '⚡ Fonksiyonlar oluşturuluyor...'; END $$;

-- BMR hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION calculate_bmr(gender TEXT, weight_kg DECIMAL, height_cm INTEGER, age INTEGER)
RETURNS DECIMAL AS $$
BEGIN
    IF gender = 'male' THEN
        RETURN 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
    ELSE
        RETURN 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- TDEE hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION calculate_tdee(bmr DECIMAL, activity_level TEXT)
RETURNS DECIMAL AS $$
BEGIN
    CASE activity_level
        WHEN 'sedentary' THEN RETURN bmr * 1.2;
        WHEN 'lightly_active' THEN RETURN bmr * 1.375;
        WHEN 'moderately_active' THEN RETURN bmr * 1.55;
        WHEN 'very_active' THEN RETURN bmr * 1.725;
        WHEN 'extremely_active' THEN RETURN bmr * 1.9;
        ELSE RETURN bmr * 1.55;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Hedef kalori hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION calculate_target_calories(tdee DECIMAL, goal_percentage DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN tdee * (1 + goal_percentage / 100);
END;
$$ LANGUAGE plpgsql;

-- Günlük özet otomatik güncelleme
CREATE OR REPLACE FUNCTION update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Günlük özet tablosunu güncelle veya oluştur
    INSERT INTO daily_summaries (
        user_id, summary_date, total_calories, total_protein_g, 
        total_fat_g, total_carb_g, total_fiber_g, meals_logged
    )
    SELECT 
        NEW.user_id,
        NEW.log_date,
        COALESCE(SUM(calories), 0),
        COALESCE(SUM(protein_g), 0),
        COALESCE(SUM(fat_g), 0),
        COALESCE(SUM(carb_g), 0),
        COALESCE(SUM(fiber_g), 0),
        COUNT(*)
    FROM food_logs 
    WHERE user_id = NEW.user_id AND log_date = NEW.log_date
    ON CONFLICT (user_id, summary_date) 
    DO UPDATE SET
        total_calories = EXCLUDED.total_calories,
        total_protein_g = EXCLUDED.total_protein_g,
        total_fat_g = EXCLUDED.total_fat_g,
        total_carb_g = EXCLUDED.total_carb_g,
        total_fiber_g = EXCLUDED.total_fiber_g,
        meals_logged = EXCLUDED.meals_logged,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Su kayıtları için günlük özet güncelleme
CREATE OR REPLACE FUNCTION update_daily_summary_water()
RETURNS TRIGGER AS $$
BEGIN
    -- Su miktarını günlük özete ekle
    UPDATE daily_summaries 
    SET 
        total_water_ml = (
            SELECT COALESCE(SUM(amount_ml), 0)
            FROM water_logs 
            WHERE user_id = NEW.user_id AND log_date = NEW.log_date
        ),
        updated_at = NOW()
    WHERE user_id = NEW.user_id AND summary_date = NEW.log_date;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- ============================================
-- 5. TRİGGER'LAR
-- ============================================

DO $$ BEGIN RAISE NOTICE '🔧 Trigger''lar oluşturuluyor...'; END $$;

-- Food logs için trigger
DROP TRIGGER IF EXISTS trigger_update_daily_summary_food_logs ON food_logs;
CREATE TRIGGER trigger_update_daily_summary_food_logs
    AFTER INSERT OR UPDATE OR DELETE ON food_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_summary();

-- Water logs için trigger
DROP TRIGGER IF EXISTS trigger_update_daily_summary_water_logs ON water_logs;
CREATE TRIGGER trigger_update_daily_summary_water_logs
    AFTER INSERT OR UPDATE OR DELETE ON water_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_summary_water();

-- Users tablosu için trigger
DROP TRIGGER IF EXISTS trigger_sync_user_diet_profile ON users;
CREATE TRIGGER trigger_sync_user_diet_profile
    AFTER INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_diet_profile();

-- ============================================
-- 6. VIEW'LAR
-- ============================================

DO $$ BEGIN RAISE NOTICE '👁️ View''lar oluşturuluyor...'; END $$;

-- Kullanıcı diyet özeti view'ı
CREATE OR REPLACE VIEW user_diet_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    dp.gender,
    dp.age,
    dp.height_cm,
    dp.weight_kg,
    dp.activity_level,
    dp.goal_type,
    dp.target_calories,
    dp.target_protein_g,
    dp.target_fat_g,
    dp.target_carb_g,
    dp.target_fiber_g,
    dp.water_goal_ml,
    ds.total_calories as consumed_calories,
    ds.total_protein_g as consumed_protein_g,
    ds.total_fat_g as consumed_fat_g,
    ds.total_carb_g as consumed_carb_g,
    ds.total_fiber_g as consumed_fiber_g,
    ds.total_water_ml as consumed_water_ml,
    ds.summary_date,
    ds.calorie_percentage,
    ds.protein_percentage,
    ds.fat_percentage,
    ds.carb_percentage,
    ds.fiber_percentage,
    ds.water_percentage
FROM users u
LEFT JOIN diet_profiles dp ON u.id = dp.user_id AND dp.is_active = true
LEFT JOIN daily_summaries ds ON u.id = ds.user_id AND ds.summary_date = CURRENT_DATE;

-- Besin arama view'ı
CREATE OR REPLACE VIEW food_search_view AS
SELECT 
    id,
    COALESCE(name_tr, name) as name,
    COALESCE(name_en, name) as name_en,
    calories_per_100g,
    protein_g_per_100g,
    fat_g_per_100g,
    carb_g_per_100g,
    fiber_g_per_100g,
    category,
    subcategory,
    allergens,
    dietary_info,
    barcode,
    verified
FROM foods 
WHERE is_active = true
ORDER BY name;

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
-- 7. ÖRNEK VERİLER
-- ============================================

DO $$ BEGIN RAISE NOTICE '📝 Örnek veriler ekleniyor...'; END $$;

-- Örnek besinler (Türk mutfağı odaklı)
INSERT INTO foods (name, name_tr, name_en, calories_per_100g, protein_g_per_100g, fat_g_per_100g, carb_g_per_100g, fiber_g_per_100g, category, subcategory, cuisine) VALUES
-- Protein Kaynakları
('Grilled Chicken Breast', 'Izgara Tavuk Göğsü', 'Grilled Chicken Breast', 165, 31, 3.6, 0, 0, 'main', 'poultry', 'turkish'),
('Beef Steak', 'Et Biftek', 'Beef Steak', 271, 26, 18, 0, 0, 'main', 'beef', 'turkish'),
('Ground Beef', 'Kıyma', 'Ground Beef', 254, 17, 20, 0, 0, 'main', 'beef', 'turkish'),
('Grilled Salmon', 'Izgara Somon', 'Grilled Salmon', 208, 25, 12, 0, 0, 'main', 'fish', 'mediterranean'),
('Turkish Yogurt', 'Türk Yoğurdu', 'Turkish Yogurt', 59, 10, 0.4, 3.6, 0, 'dairy', 'yogurt', 'turkish'),
('Feta Cheese', 'Beyaz Peynir', 'Feta Cheese', 264, 14, 21, 4.1, 0, 'dairy', 'cheese', 'turkish'),

-- Karbonhidrat Kaynakları
('Cooked Bulgur', 'Haşlanmış Bulgur', 'Cooked Bulgur', 83, 3.1, 0.2, 19, 4.5, 'carb', 'grain', 'turkish'),
('Cooked Rice', 'Haşlanmış Pirinç', 'Cooked Rice', 130, 2.7, 0.3, 28, 0.4, 'carb', 'grain', 'turkish'),
('Oatmeal', 'Yulaf Ezmesi', 'Oatmeal', 389, 17, 7, 66, 11, 'carb', 'cereal', 'turkish'),
('Whole Wheat Bread', 'Tam Buğday Ekmeği', 'Whole Wheat Bread', 247, 13, 4.2, 41, 7, 'carb', 'bread', 'turkish'),

-- Sebzeler
('Steamed Broccoli', 'Buharda Brokoli', 'Steamed Broccoli', 34, 2.8, 0.4, 7, 2.6, 'vegetable', 'cruciferous', 'turkish'),
('Turkish Salad', 'Türk Salatası', 'Turkish Salad', 45, 2, 3, 4, 2, 'vegetable', 'salad', 'turkish'),
('Grilled Zucchini', 'Izgara Kabak', 'Grilled Zucchini', 17, 1.2, 0.2, 3.4, 1, 'vegetable', 'summer', 'turkish'),

-- Meyveler
('Apple', 'Elma', 'Apple', 52, 0.3, 0.2, 14, 2.4, 'fruit', 'pome', 'turkish'),
('Banana', 'Muz', 'Banana', 89, 1.1, 0.3, 23, 2.6, 'fruit', 'tropical', 'turkish'),
('Orange', 'Portakal', 'Orange', 47, 0.9, 0.1, 12, 2.4, 'fruit', 'citrus', 'turkish'),

-- Kuruyemiş
('Walnuts', 'Ceviz', 'Walnuts', 654, 15, 65, 14, 6.7, 'nuts', 'tree_nut', 'turkish'),
('Almonds', 'Badem', 'Almonds', 579, 21, 50, 22, 12, 'nuts', 'tree_nut', 'turkish'),

-- Yağlar
('Olive Oil', 'Zeytinyağı', 'Olive Oil', 884, 0, 100, 0, 0, 'fat', 'oil', 'mediterranean'),
('Butter', 'Tereyağı', 'Butter', 717, 0.9, 81, 0.1, 0, 'fat', 'dairy', 'turkish')

ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 8. BAŞARILI KURULUM MESAJI
-- ============================================

DO $$
DECLARE
    food_count INTEGER;
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO food_count FROM foods;
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('diet_profiles', 'foods', 'meal_plans', 'planned_meals', 'food_logs', 'water_logs', 'daily_summaries', 'diet_achievements', 'food_favorites');
    
    RAISE NOTICE '🎉 DİYET MODÜLÜ BAŞARIYLA KURULDU!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Oluşturulan tablolar: % adet', table_count;
    RAISE NOTICE '   ✅ diet_profiles (Diyet profilleri)';
    RAISE NOTICE '   ✅ foods (Besin veritabanı)';
    RAISE NOTICE '   ✅ meal_plans (Öğün planları)';
    RAISE NOTICE '   ✅ planned_meals (Planlanmış öğünler)';
    RAISE NOTICE '   ✅ food_logs (Besin kayıtları)';
    RAISE NOTICE '   ✅ water_logs (Su kayıtları)';
    RAISE NOTICE '   ✅ daily_summaries (Günlük özetler)';
    RAISE NOTICE '   ✅ diet_achievements (Diyet başarıları)';
    RAISE NOTICE '   ✅ food_favorites (Besin favorileri)';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Oluşturulan view''lar:';
    RAISE NOTICE '   ✅ user_diet_summary';
    RAISE NOTICE '   ✅ food_search_view';
    RAISE NOTICE '   ✅ user_diet_info';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Oluşturulan fonksiyonlar:';
    RAISE NOTICE '   ✅ calculate_bmr()';
    RAISE NOTICE '   ✅ calculate_tdee()';
    RAISE NOTICE '   ✅ calculate_target_calories()';
    RAISE NOTICE '   ✅ update_daily_summary()';
    RAISE NOTICE '   ✅ sync_user_diet_profile()';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Oluşturulan trigger''lar:';
    RAISE NOTICE '   ✅ trigger_update_daily_summary_food_logs';
    RAISE NOTICE '   ✅ trigger_update_daily_summary_water_logs';
    RAISE NOTICE '   ✅ trigger_sync_user_diet_profile';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Örnek besinler: % adet', food_count;
    RAISE NOTICE '   🍽️ Türk mutfağı odaklı besinler eklendi';
    RAISE NOTICE '   🥗 Protein, karbonhidrat, yağ kaynakları';
    RAISE NOTICE '   🥕 Sebze ve meyve çeşitleri';
    RAISE NOTICE '   🥜 Kuruyemiş ve tohumlar';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Diyet modülü kullanıma hazır!';
    RAISE NOTICE '💡 Şimdi uygulamanızda diyet takibi yapabilirsiniz.';
END $$;
