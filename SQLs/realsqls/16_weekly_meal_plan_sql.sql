-- Haftalık Diyet Planı ve Hatırlatıcı Sistemi SQL
-- Bu dosya haftalık meal plan ve hatırlatıcı özelliklerini destekler

-- 1. Meal Plans Tablosu (Mevcut tabloyu güncelle)
-- Mevcut meal_plans tablosu zaten var, sadece eksik kolonları ekle
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Planned Meals Tablosu (Mevcut tabloyu güncelle)
-- Mevcut planned_meals tablosu zaten var, sadece eksik kolonları ekle
ALTER TABLE planned_meals ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE planned_meals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE planned_meals ADD COLUMN IF NOT EXISTS weekly_plan_id INTEGER;

-- Kolon isimlerini düzelt (protein -> protein_g, carbs -> carb_g, fat -> fat_g)
DO $$
BEGIN
    -- protein kolonunu protein_g olarak yeniden adlandır
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'planned_meals' AND column_name = 'protein') THEN
        ALTER TABLE planned_meals RENAME COLUMN protein TO protein_g;
        RAISE NOTICE '✅ protein kolonu protein_g olarak yeniden adlandırıldı';
    END IF;
    
    -- carbs kolonunu carb_g olarak yeniden adlandır
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'planned_meals' AND column_name = 'carbs') THEN
        ALTER TABLE planned_meals RENAME COLUMN carbs TO carb_g;
        RAISE NOTICE '✅ carbs kolonu carb_g olarak yeniden adlandırıldı';
    END IF;
    
    -- fat kolonunu fat_g olarak yeniden adlandır
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'planned_meals' AND column_name = 'fat') THEN
        ALTER TABLE planned_meals RENAME COLUMN fat TO fat_g;
        RAISE NOTICE '✅ fat kolonu fat_g olarak yeniden adlandırıldı';
    END IF;
END $$;

-- Foreign key constraint'i tablo oluşturulduktan sonra ekleyeceğiz

-- 3. User Reminders Tablosu (Eğer yoksa oluştur)
CREATE TABLE IF NOT EXISTS user_reminders (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    water_reminder_enabled BOOLEAN DEFAULT false,
    meal_reminder_enabled BOOLEAN DEFAULT false,
    water_interval_hours INTEGER DEFAULT 2,
    breakfast_time TIME DEFAULT '08:00',
    lunch_time TIME DEFAULT '13:00',
    dinner_time TIME DEFAULT '19:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- Her kullanıcı için sadece bir reminder kaydı
);

-- 4. Foods Tablosu (Besin veritabanı)
CREATE TABLE IF NOT EXISTS foods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    category VARCHAR(100),
    calories_per_100g DECIMAL(8,2) NOT NULL,
    protein_per_100g DECIMAL(8,2) DEFAULT 0,
    carbs_per_100g DECIMAL(8,2) DEFAULT 0,
    fat_per_100g DECIMAL(8,2) DEFAULT 0,
    fiber_per_100g DECIMAL(8,2) DEFAULT 0,
    sugar_per_100g DECIMAL(8,2) DEFAULT 0,
    sodium_per_100g DECIMAL(8,2) DEFAULT 0,
    barcode VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Food Logs Tablosu (Günlük besin takibi)
CREATE TABLE IF NOT EXISTS food_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_id INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    meal_type VARCHAR(20) NOT NULL, -- breakfast, lunch, dinner, snack
    amount DECIMAL(8,2) NOT NULL, -- gram cinsinden
    calories DECIMAL(8,2) NOT NULL,
    protein DECIMAL(8,2) DEFAULT 0,
    carbs DECIMAL(8,2) DEFAULT 0,
    fat DECIMAL(8,2) DEFAULT 0,
    fiber DECIMAL(8,2) DEFAULT 0,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Water Logs Tablosu (Su takibi)
CREATE TABLE IF NOT EXISTS water_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_ml INTEGER NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    log_time TIME NOT NULL DEFAULT CURRENT_TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Diet Goals Tablosu (Diyet hedefleri)
CREATE TABLE IF NOT EXISTS diet_goals (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_calories INTEGER NOT NULL,
    target_protein DECIMAL(8,2) NOT NULL,
    target_carbs DECIMAL(8,2) NOT NULL,
    target_fat DECIMAL(8,2) NOT NULL,
    target_fiber DECIMAL(8,2) NOT NULL,
    goal_type VARCHAR(50) NOT NULL, -- lose_weight, maintain_weight, gain_weight
    activity_level VARCHAR(50) NOT NULL, -- sedentary, lightly_active, etc.
    bmr DECIMAL(8,2),
    tdee DECIMAL(8,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- Her kullanıcı için sadece bir aktif hedef
);

-- 8. Weekly Meal Plans Tablosu (Haftalık diyet planları)
CREATE TABLE IF NOT EXISTS weekly_meal_plans (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_calories INTEGER,
    total_protein DECIMAL(8,2),
    total_carbs DECIMAL(8,2),
    total_fat DECIMAL(8,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Planned Meals Tablosu (Planlı öğünler)
CREATE TABLE IF NOT EXISTS planned_meals (
    id SERIAL PRIMARY KEY,
    weekly_plan_id INTEGER NOT NULL REFERENCES weekly_meal_plans(id) ON DELETE CASCADE,
    food_id INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Pazar, 1=Pazartesi, etc.
    meal_type VARCHAR(20) NOT NULL, -- breakfast, lunch, dinner, snack
    amount DECIMAL(8,2) NOT NULL, -- gram cinsinden
    calories DECIMAL(8,2) NOT NULL,
    protein_g DECIMAL(8,2) DEFAULT 0,
    carb_g DECIMAL(8,2) DEFAULT 0,
    fat_g DECIMAL(8,2) DEFAULT 0,
    fiber DECIMAL(8,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Index'ler
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_active ON meal_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_planned_meals_plan_id ON planned_meals(weekly_plan_id);
CREATE INDEX IF NOT EXISTS idx_planned_meals_meal_plan_id ON planned_meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_planned_meals_day_meal ON planned_meals(day_of_week, meal_type);
CREATE INDEX IF NOT EXISTS idx_planned_meals_food_id ON planned_meals(food_id);
CREATE INDEX IF NOT EXISTS idx_user_reminders_user_id ON user_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_barcode ON foods(barcode);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_food_logs_meal_type ON food_logs(meal_type);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON water_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_diet_goals_user_id ON diet_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_goals_active ON diet_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_weekly_meal_plans_user_id ON weekly_meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_meal_plans_active ON weekly_meal_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_weekly_meal_plans_dates ON weekly_meal_plans(start_date, end_date);

-- 11. Trigger'lar - Updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Meal Plans trigger
DROP TRIGGER IF EXISTS update_meal_plans_updated_at ON meal_plans;
CREATE TRIGGER update_meal_plans_updated_at
    BEFORE UPDATE ON meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Planned Meals trigger
DROP TRIGGER IF EXISTS update_planned_meals_updated_at ON planned_meals;
CREATE TRIGGER update_planned_meals_updated_at
    BEFORE UPDATE ON planned_meals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- User Reminders trigger
DROP TRIGGER IF EXISTS update_user_reminders_updated_at ON user_reminders;
CREATE TRIGGER update_user_reminders_updated_at
    BEFORE UPDATE ON user_reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Foods trigger
DROP TRIGGER IF EXISTS update_foods_updated_at ON foods;
CREATE TRIGGER update_foods_updated_at
    BEFORE UPDATE ON foods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Food Logs trigger
DROP TRIGGER IF EXISTS update_food_logs_updated_at ON food_logs;
CREATE TRIGGER update_food_logs_updated_at
    BEFORE UPDATE ON food_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Diet Goals trigger
DROP TRIGGER IF EXISTS update_diet_goals_updated_at ON diet_goals;
CREATE TRIGGER update_diet_goals_updated_at
    BEFORE UPDATE ON diet_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Weekly Meal Plans trigger
DROP TRIGGER IF EXISTS update_weekly_meal_plans_updated_at ON weekly_meal_plans;
CREATE TRIGGER update_weekly_meal_plans_updated_at
    BEFORE UPDATE ON weekly_meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Foreign key constraint'i tablolar oluşturulduktan sonra ekle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'planned_meals_weekly_plan_id_fkey'
    ) THEN
        ALTER TABLE planned_meals 
        ADD CONSTRAINT planned_meals_weekly_plan_id_fkey 
        FOREIGN KEY (weekly_plan_id) REFERENCES weekly_meal_plans(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ planned_meals weekly_plan_id foreign key eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ planned_meals weekly_plan_id foreign key zaten mevcut';
    END IF;
END $$;

-- 14. Real-time Senkronizasyon Sistemi
-- Supabase Real-time için publication'lar oluştur
DO $$
BEGIN
    -- Foods tablosu için real-time
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'realtime_foods') THEN
        CREATE PUBLICATION realtime_foods FOR TABLE foods;
        RAISE NOTICE '✅ realtime_foods publication oluşturuldu';
    END IF;
    
    -- Food logs için real-time
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'realtime_food_logs') THEN
        CREATE PUBLICATION realtime_food_logs FOR TABLE food_logs;
        RAISE NOTICE '✅ realtime_food_logs publication oluşturuldu';
    END IF;
    
    -- Water logs için real-time
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'realtime_water_logs') THEN
        CREATE PUBLICATION realtime_water_logs FOR TABLE water_logs;
        RAISE NOTICE '✅ realtime_water_logs publication oluşturuldu';
    END IF;
    
    -- Diet goals için real-time
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'realtime_diet_goals') THEN
        CREATE PUBLICATION realtime_diet_goals FOR TABLE diet_goals;
        RAISE NOTICE '✅ realtime_diet_goals publication oluşturuldu';
    END IF;
    
    -- Weekly meal plans için real-time
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'realtime_weekly_meal_plans') THEN
        CREATE PUBLICATION realtime_weekly_meal_plans FOR TABLE weekly_meal_plans;
        RAISE NOTICE '✅ realtime_weekly_meal_plans publication oluşturuldu';
    END IF;
    
    -- Planned meals için real-time
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'realtime_planned_meals') THEN
        CREATE PUBLICATION realtime_planned_meals FOR TABLE planned_meals;
        RAISE NOTICE '✅ realtime_planned_meals publication oluşturuldu';
    END IF;
    
    -- User reminders için real-time
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'realtime_user_reminders') THEN
        CREATE PUBLICATION realtime_user_reminders FOR TABLE user_reminders;
        RAISE NOTICE '✅ realtime_user_reminders publication oluşturuldu';
    END IF;
    
    -- Users tablosu için real-time (bildirim ayarları için)
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'realtime_users') THEN
        CREATE PUBLICATION realtime_users FOR TABLE users;
        RAISE NOTICE '✅ realtime_users publication oluşturuldu';
    END IF;
END $$;

-- 15. Veri Senkronizasyon Fonksiyonları
-- Kullanıcı verilerini senkronize etme fonksiyonu
CREATE OR REPLACE FUNCTION sync_user_data(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Kullanıcının tüm verilerini topla
    SELECT json_build_object(
        'user_id', user_uuid,
        'diet_goals', (
            SELECT json_agg(row_to_json(dg))
            FROM diet_goals dg
            WHERE dg.user_id = user_uuid AND dg.is_active = true
        ),
        'weekly_meal_plans', (
            SELECT json_agg(row_to_json(wmp))
            FROM weekly_meal_plans wmp
            WHERE wmp.user_id = user_uuid AND wmp.is_active = true
        ),
        'planned_meals', (
            SELECT json_agg(row_to_json(pm))
            FROM planned_meals pm
            JOIN weekly_meal_plans wmp ON pm.weekly_plan_id = wmp.id
            WHERE wmp.user_id = user_uuid AND wmp.is_active = true
        ),
        'food_logs_today', (
            SELECT json_agg(row_to_json(fl))
            FROM food_logs fl
            WHERE fl.user_id = user_uuid AND fl.log_date = CURRENT_DATE
        ),
        'water_logs_today', (
            SELECT json_agg(row_to_json(wl))
            FROM water_logs wl
            WHERE wl.user_id = user_uuid AND wl.log_date = CURRENT_DATE
        ),
        'user_reminders', (
            SELECT row_to_json(ur)
            FROM user_reminders ur
            WHERE ur.user_id = user_uuid
        ),
        'sync_timestamp', NOW()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Veri çakışması çözme fonksiyonu
CREATE OR REPLACE FUNCTION resolve_data_conflict(
    table_name TEXT,
    record_id INTEGER,
    client_timestamp TIMESTAMP WITH TIME ZONE,
    server_timestamp TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Server timestamp daha yeni ise server'ı kabul et
    IF server_timestamp > client_timestamp THEN
        RETURN TRUE; -- Server'ı kabul et
    ELSE
        RETURN FALSE; -- Client'ı kabul et
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Örnek Veri Ekleme (İsteğe bağlı)
-- Bu kısım test için örnek veri ekler

-- Örnek meal plan oluştur (sadece test kullanıcısı için)
DO $$
DECLARE
    test_user_id UUID;
    sample_plan_id UUID;
BEGIN
    -- Test kullanıcısı ID'sini al (varsa)
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Örnek meal plan oluştur
        INSERT INTO meal_plans (user_id, plan_name, description, is_active, plan_type, start_date)
        VALUES (test_user_id, 'Örnek Haftalık Plan', 'Test için örnek haftalık diyet planı', true, 'weekly', CURRENT_DATE)
        ON CONFLICT DO NOTHING
        RETURNING id INTO sample_plan_id;
        
        -- Örnek planned meals ekle (eğer plan oluşturulduysa)
        IF sample_plan_id IS NOT NULL THEN
            INSERT INTO planned_meals (
                meal_plan_id, day_of_week, meal_type, meal_order,
                food_id, food_name, portion_size_g, calories, protein_g, carb_g, fat_g, fiber_g
            ) VALUES 
            (sample_plan_id, 1, 'breakfast', 1, NULL, 'Yulaf Ezmesi', 100, 389, 17, 66, 7, 11),
            (sample_plan_id, 1, 'lunch', 1, NULL, 'Tavuk Göğsü', 150, 231, 43.5, 0, 5, 0),
            (sample_plan_id, 1, 'dinner', 1, NULL, 'Somon Balığı', 120, 208, 22, 0, 12, 0)
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Örnek meal plan ve planned meals oluşturuldu. Plan ID: %', sample_plan_id;
        END IF;
    END IF;
END $$;

-- 7. View'lar - Kolay sorgulama için

-- Haftalık plan özeti view'ı
CREATE OR REPLACE VIEW weekly_meal_plan_summary AS
SELECT 
    mp.id as plan_id,
    mp.plan_name,
    mp.user_id,
    pm.day_of_week,
    pm.meal_type,
    COUNT(pm.id) as meal_count,
    SUM(pm.calories) as total_calories,
    SUM(pm.protein_g) as total_protein,
    SUM(pm.carb_g) as total_carbs,
    SUM(pm.fat_g) as total_fat
FROM meal_plans mp
LEFT JOIN planned_meals pm ON mp.id = pm.meal_plan_id
WHERE mp.is_active = true
GROUP BY mp.id, mp.plan_name, mp.user_id, pm.day_of_week, pm.meal_type
ORDER BY mp.id, pm.day_of_week, pm.meal_type;

-- Günlük kalori özeti view'ı
CREATE OR REPLACE VIEW daily_calorie_summary AS
SELECT 
    mp.id as plan_id,
    mp.plan_name,
    mp.user_id,
    pm.day_of_week,
    SUM(pm.calories) as daily_calories,
    SUM(pm.protein_g) as daily_protein,
    SUM(pm.carb_g) as daily_carbs,
    SUM(pm.fat_g) as daily_fat,
    COUNT(pm.id) as meal_count
FROM meal_plans mp
LEFT JOIN planned_meals pm ON mp.id = pm.meal_plan_id
WHERE mp.is_active = true
GROUP BY mp.id, mp.plan_name, mp.user_id, pm.day_of_week
ORDER BY mp.id, pm.day_of_week;

-- Weekly meal plans özeti view'ı
CREATE OR REPLACE VIEW weekly_meal_plans_summary AS
SELECT 
    wmp.id as plan_id,
    wmp.plan_name,
    wmp.user_id,
    pm.day_of_week,
    pm.meal_type,
    COUNT(pm.id) as meal_count,
    SUM(pm.calories) as total_calories,
    SUM(pm.protein_g) as total_protein,
    SUM(pm.carb_g) as total_carbs,
    SUM(pm.fat_g) as total_fat
FROM weekly_meal_plans wmp
LEFT JOIN planned_meals pm ON wmp.id = pm.weekly_plan_id
WHERE wmp.is_active = true
GROUP BY wmp.id, wmp.plan_name, wmp.user_id, pm.day_of_week, pm.meal_type
ORDER BY wmp.id, pm.day_of_week, pm.meal_type;

-- 8. Fonksiyonlar

-- Kullanıcının aktif meal plan'ını getiren fonksiyon
CREATE OR REPLACE FUNCTION get_user_active_meal_plan(user_uuid UUID)
RETURNS TABLE (
    plan_id UUID,
    plan_name TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT mp.id, mp.plan_name, mp.description, mp.created_at
    FROM meal_plans mp
    WHERE mp.user_id = user_uuid AND mp.is_active = true
    ORDER BY mp.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Belirli bir günün meal plan'ını getiren fonksiyon
CREATE OR REPLACE FUNCTION get_daily_meal_plan(user_uuid UUID, day_num INTEGER)
RETURNS TABLE (
    meal_type VARCHAR(50),
    food_name VARCHAR(255),
    portion_size_g DECIMAL(10,2),
    calories DECIMAL(10,2),
    protein_g DECIMAL(10,2),
    carb_g DECIMAL(10,2),
    fat_g DECIMAL(10,2),
    fiber_g DECIMAL(10,2),
    meal_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.meal_type,
        pm.food_name,
        pm.portion_size_g,
        pm.calories,
        pm.protein_g,
        pm.carb_g,
        pm.fat_g,
        pm.fiber_g,
        pm.meal_order
    FROM meal_plans mp
    JOIN planned_meals pm ON mp.id = pm.meal_plan_id
    WHERE mp.user_id = user_uuid 
        AND mp.is_active = true 
        AND pm.day_of_week = day_num
    ORDER BY pm.meal_type, pm.meal_order;
END;
$$ LANGUAGE plpgsql;

-- 12. RLS (Row Level Security) Politikaları

-- Foods tablosu için RLS
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

-- Food Logs tablosu için RLS
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own food logs" ON food_logs;
CREATE POLICY "Users can view their own food logs" ON food_logs
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own food logs" ON food_logs;
CREATE POLICY "Users can insert their own food logs" ON food_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own food logs" ON food_logs;
CREATE POLICY "Users can update their own food logs" ON food_logs
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own food logs" ON food_logs;
CREATE POLICY "Users can delete their own food logs" ON food_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Water Logs tablosu için RLS
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own water logs" ON water_logs;
CREATE POLICY "Users can view their own water logs" ON water_logs
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own water logs" ON water_logs;
CREATE POLICY "Users can insert their own water logs" ON water_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own water logs" ON water_logs;
CREATE POLICY "Users can update their own water logs" ON water_logs
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own water logs" ON water_logs;
CREATE POLICY "Users can delete their own water logs" ON water_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Diet Goals tablosu için RLS
ALTER TABLE diet_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own diet goals" ON diet_goals;
CREATE POLICY "Users can view their own diet goals" ON diet_goals
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own diet goals" ON diet_goals;
CREATE POLICY "Users can insert their own diet goals" ON diet_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own diet goals" ON diet_goals;
CREATE POLICY "Users can update their own diet goals" ON diet_goals
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own diet goals" ON diet_goals;
CREATE POLICY "Users can delete their own diet goals" ON diet_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Weekly Meal Plans tablosu için RLS
ALTER TABLE weekly_meal_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own weekly meal plans" ON weekly_meal_plans;
CREATE POLICY "Users can view their own weekly meal plans" ON weekly_meal_plans
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own weekly meal plans" ON weekly_meal_plans;
CREATE POLICY "Users can insert their own weekly meal plans" ON weekly_meal_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own weekly meal plans" ON weekly_meal_plans;
CREATE POLICY "Users can update their own weekly meal plans" ON weekly_meal_plans
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own weekly meal plans" ON weekly_meal_plans;
CREATE POLICY "Users can delete their own weekly meal plans" ON weekly_meal_plans
    FOR DELETE USING (auth.uid() = user_id);

-- User Reminders tablosu için RLS
ALTER TABLE user_reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own reminders" ON user_reminders;
CREATE POLICY "Users can view their own reminders" ON user_reminders
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own reminders" ON user_reminders;
CREATE POLICY "Users can insert their own reminders" ON user_reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own reminders" ON user_reminders;
CREATE POLICY "Users can update their own reminders" ON user_reminders
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own reminders" ON user_reminders;
CREATE POLICY "Users can delete their own reminders" ON user_reminders
    FOR DELETE USING (auth.uid() = user_id);

-- 13. RLS (Row Level Security) Politikaları

-- Meal Plans için RLS
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Mevcut policy'leri sil ve yeniden oluştur
DROP POLICY IF EXISTS "Users can view their own meal plans" ON meal_plans;
CREATE POLICY "Users can view their own meal plans" ON meal_plans
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own meal plans" ON meal_plans;
CREATE POLICY "Users can insert their own meal plans" ON meal_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own meal plans" ON meal_plans;
CREATE POLICY "Users can update their own meal plans" ON meal_plans
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own meal plans" ON meal_plans;
CREATE POLICY "Users can delete their own meal plans" ON meal_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Planned Meals için RLS
ALTER TABLE planned_meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own planned meals" ON planned_meals;
CREATE POLICY "Users can view their own planned meals" ON planned_meals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meal_plans mp 
            WHERE mp.id = planned_meals.meal_plan_id 
            AND mp.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own planned meals" ON planned_meals;
CREATE POLICY "Users can insert their own planned meals" ON planned_meals
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM meal_plans mp 
            WHERE mp.id = planned_meals.meal_plan_id 
            AND mp.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own planned meals" ON planned_meals;
CREATE POLICY "Users can update their own planned meals" ON planned_meals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM meal_plans mp 
            WHERE mp.id = planned_meals.meal_plan_id 
            AND mp.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete their own planned meals" ON planned_meals;
CREATE POLICY "Users can delete their own planned meals" ON planned_meals
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM meal_plans mp 
            WHERE mp.id = planned_meals.meal_plan_id 
            AND mp.user_id = auth.uid()
        )
    );

-- User Reminders için RLS
ALTER TABLE user_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own reminders" ON user_reminders;
CREATE POLICY "Users can view their own reminders" ON user_reminders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own reminders" ON user_reminders;
CREATE POLICY "Users can insert their own reminders" ON user_reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reminders" ON user_reminders;
CREATE POLICY "Users can update their own reminders" ON user_reminders
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reminders" ON user_reminders;
CREATE POLICY "Users can delete their own reminders" ON user_reminders
    FOR DELETE USING (auth.uid() = user_id);

-- 10. Bildirim Ayarları - Users Tablosuna Kolonlar Ekle
DO $$
BEGIN
    -- Vitamin hatırlatıcısı kolonları
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'vitamin_reminders_enabled') THEN
        ALTER TABLE users ADD COLUMN vitamin_reminders_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ vitamin_reminders_enabled kolonu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ vitamin_reminders_enabled kolonu zaten mevcut';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'vitamin_reminder_time') THEN
        ALTER TABLE users ADD COLUMN vitamin_reminder_time TIME DEFAULT '09:00';
        RAISE NOTICE '✅ vitamin_reminder_time kolonu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ vitamin_reminder_time kolonu zaten mevcut';
    END IF;
    
    -- Uyku hatırlatıcısı kolonları
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'sleep_reminders_enabled') THEN
        ALTER TABLE users ADD COLUMN sleep_reminders_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ sleep_reminders_enabled kolonu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ sleep_reminders_enabled kolonu zaten mevcut';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'sleep_reminder_time') THEN
        ALTER TABLE users ADD COLUMN sleep_reminder_time TIME DEFAULT '22:00';
        RAISE NOTICE '✅ sleep_reminder_time kolonu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ sleep_reminder_time kolonu zaten mevcut';
    END IF;
    
    -- Yemek hatırlatıcısı kolonları
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'meal_reminders') THEN
        ALTER TABLE users ADD COLUMN meal_reminders BOOLEAN DEFAULT true;
        RAISE NOTICE '✅ meal_reminders kolonu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ meal_reminders kolonu zaten mevcut';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'breakfast_time') THEN
        ALTER TABLE users ADD COLUMN breakfast_time TIME DEFAULT '08:00';
        RAISE NOTICE '✅ breakfast_time kolonu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ breakfast_time kolonu zaten mevcut';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'lunch_time') THEN
        ALTER TABLE users ADD COLUMN lunch_time TIME DEFAULT '13:00';
        RAISE NOTICE '✅ lunch_time kolonu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ lunch_time kolonu zaten mevcut';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'dinner_time') THEN
        ALTER TABLE users ADD COLUMN dinner_time TIME DEFAULT '19:00';
        RAISE NOTICE '✅ dinner_time kolonu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ dinner_time kolonu zaten mevcut';
    END IF;
    
    -- Su hatırlatıcısı kolonları
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'water_reminders') THEN
        ALTER TABLE users ADD COLUMN water_reminders BOOLEAN DEFAULT true;
        RAISE NOTICE '✅ water_reminders kolonu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ water_reminders kolonu zaten mevcut';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'water_reminder_interval') THEN
        ALTER TABLE users ADD COLUMN water_reminder_interval INTEGER DEFAULT 2;
        RAISE NOTICE '✅ water_reminder_interval kolonu eklendi';
    ELSE
        RAISE NOTICE 'ℹ️ water_reminder_interval kolonu zaten mevcut';
    END IF;
END $$;

-- 11. Tamamlandı Mesajı
DO $$
BEGIN
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ Haftalık Diyet Planı ve Bildirim Sistemi başarıyla oluşturuldu!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📊 Tablolar:';
    RAISE NOTICE '   - meal_plans (haftalık diyet planları)';
    RAISE NOTICE '   - planned_meals (planlı öğünler)';
    RAISE NOTICE '   - user_reminders (su ve öğün hatırlatıcıları)';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 View''lar:';
    RAISE NOTICE '   - weekly_meal_plan_summary (haftalık özet)';
    RAISE NOTICE '   - daily_calorie_summary (günlük kalori özeti)';
    RAISE NOTICE '';
    RAISE NOTICE '⚙️ Fonksiyonlar:';
    RAISE NOTICE '   - get_user_active_meal_plan()';
    RAISE NOTICE '   - get_daily_meal_plan()';
    RAISE NOTICE '';
    RAISE NOTICE '🔔 Bildirim Kolonları (users tablosunda):';
    RAISE NOTICE '   - vitamin_reminders_enabled / vitamin_reminder_time';
    RAISE NOTICE '   - sleep_reminders_enabled / sleep_reminder_time';
    RAISE NOTICE '   - meal_reminders / breakfast_time / lunch_time / dinner_time';
    RAISE NOTICE '   - water_reminders / water_reminder_interval';
    RAISE NOTICE '';
    RAISE NOTICE '🍽️ Yeni Diyet Tabloları:';
    RAISE NOTICE '   - foods (besin veritabanı)';
    RAISE NOTICE '   - food_logs (günlük besin takibi)';
    RAISE NOTICE '   - water_logs (su takibi)';
    RAISE NOTICE '   - diet_goals (diyet hedefleri)';
    RAISE NOTICE '   - weekly_meal_plans (haftalık diyet planları)';
    RAISE NOTICE '   - planned_meals (planlı öğünler)';
    RAISE NOTICE '   - user_reminders (hatırlatıcı ayarları)';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 RLS politikaları aktif edildi';
    RAISE NOTICE '';
    RAISE NOTICE '🌐 Real-time Senkronizasyon:';
    RAISE NOTICE '   - Tüm tablolar için real-time publication''lar oluşturuldu';
    RAISE NOTICE '   - sync_user_data() fonksiyonu ile tam senkronizasyon';
    RAISE NOTICE '   - resolve_data_conflict() ile çakışma çözümü';
    RAISE NOTICE '   - Anlık veri güncellemeleri aktif';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Sistem tamamen hazır! Veriler anlık olarak senkronize edilir.';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
