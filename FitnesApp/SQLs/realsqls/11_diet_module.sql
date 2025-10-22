-- ============================================
-- DİYET MODÜLÜ - VERİTABANI YAPISI
-- Notepad planına göre tasarlandı
-- ============================================

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
    allergies TEXT[], -- Array of allergy strings
    restrictions TEXT[], -- Array of restriction strings (vegetarian, vegan, etc.)
    
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
    name_tr TEXT, -- Türkçe isim
    name_en TEXT, -- İngilizce isim
    
    -- Besin Değerleri (100g için)
    calories_per_100g DECIMAL(8,2) NOT NULL,
    protein_g_per_100g DECIMAL(6,2) DEFAULT 0,
    fat_g_per_100g DECIMAL(6,2) DEFAULT 0,
    carb_g_per_100g DECIMAL(6,2) DEFAULT 0,
    fiber_g_per_100g DECIMAL(6,2) DEFAULT 0,
    sugar_g_per_100g DECIMAL(6,2) DEFAULT 0,
    sodium_mg_per_100g DECIMAL(6,2) DEFAULT 0,
    
    -- Kategori ve Etiketler
    category TEXT, -- main, snack, drink, etc.
    subcategory TEXT, -- protein, vegetable, fruit, etc.
    cuisine TEXT, -- turkish, mediterranean, etc.
    
    -- Alerjen ve Kısıtlama Bilgileri
    allergens TEXT[], -- Array of allergen strings
    dietary_info TEXT[], -- Array of dietary info (vegetarian, vegan, etc.)
    
    -- Barkod ve Kaynak
    barcode TEXT UNIQUE, -- EAN-13 barkod
    source TEXT DEFAULT 'manual', -- manual, api, import
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
    
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack')) NOT NULL,
    meal_order INTEGER DEFAULT 0,
    
    -- Besin Bilgileri
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
    food_name TEXT, -- Cached food name
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
    food_name TEXT NOT NULL, -- Cached food name
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
    criteria_type TEXT, -- streak, total, percentage, etc.
    criteria_value DECIMAL(10,2),
    criteria_period TEXT, -- daily, weekly, monthly, all_time
    
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
    custom_portion_g DECIMAL(8,2), -- Kullanıcının tercih ettiği porsiyon
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, food_id)
);

-- ============================================
-- İNDEKSLER
-- ============================================

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
-- TRİGGER FONKSİYONLARI
-- ============================================

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

-- Food logs için trigger
DROP TRIGGER IF EXISTS trigger_update_daily_summary_food_logs ON food_logs;
CREATE TRIGGER trigger_update_daily_summary_food_logs
    AFTER INSERT OR UPDATE OR DELETE ON food_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_summary();

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

-- Water logs için trigger
DROP TRIGGER IF EXISTS trigger_update_daily_summary_water_logs ON water_logs;
CREATE TRIGGER trigger_update_daily_summary_water_logs
    AFTER INSERT OR UPDATE OR DELETE ON water_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_summary_water();

-- ============================================
-- ÖRNEK VERİLER
-- ============================================

-- Örnek besinler
INSERT INTO foods (name, name_tr, name_en, calories_per_100g, protein_g_per_100g, fat_g_per_100g, carb_g_per_100g, fiber_g_per_100g, category, subcategory) VALUES
-- Protein Kaynakları
('Chicken Breast', 'Tavuk Göğsü', 'Chicken Breast', 165, 31, 3.6, 0, 0, 'protein', 'poultry'),
('Salmon', 'Somon', 'Salmon', 208, 25, 12, 0, 0, 'protein', 'fish'),
('Eggs', 'Yumurta', 'Eggs', 155, 13, 11, 1.1, 0, 'protein', 'eggs'),
('Greek Yogurt', 'Yoğurt', 'Greek Yogurt', 59, 10, 0.4, 3.6, 0, 'protein', 'dairy'),
('Tofu', 'Tofu', 'Tofu', 76, 8, 4.8, 1.9, 0.3, 'protein', 'plant_based'),

-- Karbonhidrat Kaynakları
('Brown Rice', '244 Kahverengi Pirinç', 'Brown Rice', 111, 2.6, 0.9, 23, 1.8, 'carb', 'grain'),
('Sweet Potato', 'Tatlı Patates', 'Sweet Potato', 86, 1.6, 0.1, 20, 3, 'carb', 'vegetable'),
('Oats', 'Yulaf', 'Oats', 389, 17, 7, 66, 11, 'carb', 'grain'),
('Quinoa', 'Kinoa', 'Quinoa', 368, 14, 6, 64, 7, 'carb', 'grain'),
('Banana', 'Muz', 'Banana', 89, 1.1, 0.3, 23, 2.6, 'carb', 'fruit'),

-- Yağ Kaynakları
('Avocado', 'Avokado', 'Avocado', 160, 2, 15, 9, 7, 'fat', 'fruit'),
('Olive Oil', 'Zeytinyağı', 'Olive Oil', 884, 0, 100, 0, 0, 'fat', 'oil'),
('Almonds', 'Badem', 'Almonds', 579, 21, 50, 22, 12, 'fat', 'nuts'),
('Walnuts', 'Ceviz', 'Walnuts', 654, 15, 65, 14, 6.7, 'fat', 'nuts'),

-- Sebzeler
('Broccoli', 'Brokoli', 'Broccoli', 34, 2.8, 0.4, 7, 2.6, 'vegetable', 'cruciferous'),
('Spinach', 'Ispanak', 'Spinach', 23, 2.9, 0.4, 3.6, 2.2, 'vegetable', 'leafy_green'),
('Carrot', 'Havuç', 'Carrot', 41, 0.9, 0.2, 10, 2.8, 'vegetable', 'root'),

-- Meyveler
('Apple', 'Elma', 'Apple', 52, 0.3, 0.2, 14, 2.4, 'fruit', 'pome'),
('Blueberries', 'Yaban Mersini', 'Blueberries', 57, 0.7, 0.3, 14, 2.4, 'fruit', 'berry'),
('Orange', 'Portakal', 'Orange', 47, 0.9, 0.1, 12, 2.4, 'fruit', 'citrus');

-- ============================================
-- VIEW'LAR
-- ============================================

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

-- ============================================
-- YARDIMCI FONKSİYONLAR
-- ============================================

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

-- ============================================
-- BAŞARILI KURULUM MESAJI
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Diyet modülü veritabanı yapısı başarıyla oluşturuldu!';
    RAISE NOTICE '📊 Oluşturulan tablolar:';
    RAISE NOTICE '   - diet_profiles (Diyet profilleri)';
    RAISE NOTICE '   - foods (Besin veritabanı)';
    RAISE NOTICE '   - meal_plans (Öğün planları)';
    RAISE NOTICE '   - planned_meals (Planlanmış öğünler)';
    RAISE NOTICE '   - food_logs (Besin kayıtları)';
    RAISE NOTICE '   - water_logs (Su kayıtları)';
    RAISE NOTICE '   - daily_summaries (Günlük özetler)';
    RAISE NOTICE '   - diet_achievements (Diyet başarıları)';
    RAISE NOTICE '   - food_favorites (Besin favorileri)';
    RAISE NOTICE '🔍 Oluşturulan view''lar:';
    RAISE NOTICE '   - user_diet_summary';
    RAISE NOTICE '   - food_search_view';
    RAISE NOTICE '⚡ Oluşturulan fonksiyonlar:';
    RAISE NOTICE '   - calculate_bmr()';
    RAISE NOTICE '   - calculate_tdee()';
    RAISE NOTICE '   - calculate_target_calories()';
    RAISE NOTICE '🎯 Örnek besinler eklendi (%d adet)', (SELECT COUNT(*) FROM foods);
END $$;
