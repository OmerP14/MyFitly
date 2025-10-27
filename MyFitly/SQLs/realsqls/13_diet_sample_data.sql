-- ============================================
-- DİYET MODÜLÜ ÖRNEK VERİLER
-- Notepad planına göre hazırlanmış örnek veriler
-- ============================================

-- Önce gerekli constraint'lerin olduğundan emin ol
DO $$
BEGIN
    -- Önce foods tablosundaki duplikaları temizle
    DELETE FROM foods a USING (
        SELECT MIN(ctid) as ctid, name
        FROM foods 
        GROUP BY name 
        HAVING COUNT(*) > 1
    ) b
    WHERE a.name = b.name 
    AND a.ctid <> b.ctid;
    
    -- foods tablosu için name unique constraint (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'foods'::regclass 
        AND contype = 'u'
        AND conname LIKE '%name%'
    ) THEN
        ALTER TABLE foods ADD CONSTRAINT foods_name_unique UNIQUE (name);
        RAISE NOTICE '✅ foods.name UNIQUE constraint eklendi';
    END IF;
    
    -- diet_profiles duplikaları temizle
    DELETE FROM diet_profiles a USING (
        SELECT MIN(ctid) as ctid, user_id
        FROM diet_profiles 
        GROUP BY user_id 
        HAVING COUNT(*) > 1
    ) b
    WHERE a.user_id = b.user_id 
    AND a.ctid <> b.ctid;
    
    -- diet_profiles için user_id unique constraint (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'diet_profiles'::regclass 
        AND contype = 'u'
        AND conname LIKE '%user_id%'
    ) THEN
        ALTER TABLE diet_profiles ADD CONSTRAINT diet_profiles_user_id_unique UNIQUE (user_id);
        RAISE NOTICE '✅ diet_profiles.user_id UNIQUE constraint eklendi';
    END IF;
    
    -- meal_plans duplikaları temizle
    DELETE FROM meal_plans a USING (
        SELECT MIN(ctid) as ctid, user_id, plan_name
        FROM meal_plans 
        GROUP BY user_id, plan_name 
        HAVING COUNT(*) > 1
    ) b
    WHERE a.user_id = b.user_id 
    AND a.plan_name = b.plan_name
    AND a.ctid <> b.ctid;
    
    -- meal_plans için composite unique constraint (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'meal_plans'::regclass 
        AND contype = 'u'
        AND array_length(conkey, 1) = 2
    ) THEN
        ALTER TABLE meal_plans ADD CONSTRAINT meal_plans_user_plan_unique UNIQUE (user_id, plan_name);
        RAISE NOTICE '✅ meal_plans(user_id, plan_name) UNIQUE constraint eklendi';
    END IF;
    
    -- food_favorites duplikaları temizle
    DELETE FROM food_favorites a USING (
        SELECT MIN(ctid) as ctid, user_id, food_id
        FROM food_favorites 
        GROUP BY user_id, food_id 
        HAVING COUNT(*) > 1
    ) b
    WHERE a.user_id = b.user_id 
    AND a.food_id = b.food_id
    AND a.ctid <> b.ctid;
    
    -- food_favorites için composite unique constraint (eğer yoksa)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'food_favorites'::regclass 
        AND contype = 'u'
        AND array_length(conkey, 1) = 2
    ) THEN
        ALTER TABLE food_favorites ADD CONSTRAINT food_favorites_user_food_unique UNIQUE (user_id, food_id);
        RAISE NOTICE '✅ food_favorites(user_id, food_id) UNIQUE constraint eklendi';
    END IF;
END $$;

-- ============================================
-- ÖRNEK BESİNLER (Türk Mutfağı Odaklı)
-- ============================================

-- Ana Yemekler
INSERT INTO foods (name, name_tr, name_en, calories_per_100g, protein_g_per_100g, fat_g_per_100g, carb_g_per_100g, fiber_g_per_100g, category, subcategory, cuisine) VALUES
-- Et ve Tavuk
('Grilled Chicken Breast', 'Izgara Tavuk Göğsü', 'Grilled Chicken Breast', 165, 31, 3.6, 0, 0, 'main', 'poultry', 'turkish'),
('Beef Steak', 'Et Biftek', 'Beef Steak', 271, 26, 18, 0, 0, 'main', 'beef', 'turkish'),
('Ground Beef', 'Kıyma', 'Ground Beef', 254, 17, 20, 0, 0, 'main', 'beef', 'turkish'),
('Lamb Chop', 'Kuzu Pirzola', 'Lamb Chop', 294, 25, 21, 0, 0, 'main', 'lamb', 'turkish'),
('Fish Fillet', 'Balık Fileto', 'Fish Fillet', 206, 22, 12, 0, 0, 'main', 'fish', 'turkish'),

-- Balık ve Deniz Ürünleri
('Grilled Salmon', 'Izgara Somon', 'Grilled Salmon', 208, 25, 12, 0, 0, 'main', 'fish', 'mediterranean'),
('Canned Tuna', 'Ton Balığı Konserve', 'Canned Tuna', 116, 26, 1, 0, 0, 'main', 'fish', 'turkish'),
('Shrimp', 'Karides', 'Shrimp', 99, 24, 0.3, 0, 0, 'main', 'seafood', 'turkish'),

-- Bakliyat ve Tahıllar
('Cooked Lentils', 'Haşlanmış Mercimek', 'Cooked Lentils', 116, 9, 0.4, 20, 7.9, 'main', 'legume', 'turkish'),
('Cooked Chickpeas', 'Haşlanmış Nohut', 'Cooked Chickpeas', 164, 8.9, 2.6, 27, 7.6, 'main', 'legume', 'turkish'),
('Cooked Kidney Beans', 'Haşlanmış Kuru Fasulye', 'Cooked Kidney Beans', 127, 8.7, 0.5, 23, 6.4, 'main', 'legume', 'turkish'),
('Cooked Bulgur', 'Haşlanmış Bulgur', 'Cooked Bulgur', 83, 3.1, 0.2, 19, 4.5, 'carb', 'grain', 'turkish'),
('Cooked Rice', 'Haşlanmış Pirinç', 'Cooked Rice', 130, 2.7, 0.3, 28, 0.4, 'carb', 'grain', 'turkish'),
('Cooked Quinoa', 'Haşlanmış Kinoa', 'Cooked Quinoa', 120, 4.4, 1.9, 22, 2.8, 'carb', 'grain', 'mediterranean'),

-- Sebzeler
('Grilled Vegetables', 'Izgara Sebze', 'Grilled Vegetables', 35, 2, 0.5, 7, 3, 'vegetable', 'mixed', 'mediterranean'),
('Steamed Broccoli', 'Buharda Brokoli', 'Steamed Broccoli', 34, 2.8, 0.4, 7, 2.6, 'vegetable', 'cruciferous', 'turkish'),
('Grilled Zucchini', 'Izgara Kabak', 'Grilled Zucchini', 17, 1.2, 0.2, 3.4, 1, 'vegetable', 'summer', 'turkish'),
('Roasted Eggplant', 'Fırında Patlıcan', 'Roasted Eggplant', 25, 1, 0.2, 6, 3, 'vegetable', 'nightshade', 'turkish'),
('Turkish Salad', 'Türk Salatası', 'Turkish Salad', 45, 2, 3, 4, 2, 'vegetable', 'salad', 'turkish'),

-- Süt Ürünleri
('Turkish Yogurt', 'Türk Yoğurdu', 'Turkish Yogurt', 59, 10, 0.4, 3.6, 0, 'dairy', 'yogurt', 'turkish'),
('Feta Cheese', 'Beyaz Peynir', 'Feta Cheese', 264, 14, 21, 4.1, 0, 'dairy', 'cheese', 'turkish'),
('Cottage Cheese', 'Lor Peyniri', 'Cottage Cheese', 98, 11, 4.3, 3.4, 0, 'dairy', 'cheese', 'turkish'),
('Milk', 'Süt', 'Milk', 42, 3.4, 1, 5, 0, 'dairy', 'milk', 'turkish'),
('Kefir', 'Kefir', 'Kefir', 41, 3.3, 1, 4.5, 0, 'dairy', 'fermented', 'turkish'),

-- Meyveler
('Apple', 'Elma', 'Apple', 52, 0.3, 0.2, 14, 2.4, 'fruit', 'pome', 'turkish'),
('Banana', 'Muz', 'Banana', 89, 1.1, 0.3, 23, 2.6, 'fruit', 'tropical', 'turkish'),
('Orange', 'Portakal', 'Orange', 47, 0.9, 0.1, 12, 2.4, 'fruit', 'citrus', 'turkish'),
('Strawberry', 'Çilek', 'Strawberry', 32, 0.7, 0.3, 7.7, 2, 'fruit', 'berry', 'turkish'),
('Blueberry', 'Yaban Mersini', 'Blueberry', 57, 0.7, 0.3, 14, 2.4, 'fruit', 'berry', 'turkish'),
('Grape', 'Üzüm', 'Grape', 62, 0.6, 0.2, 16, 0.9, 'fruit', 'vine', 'turkish'),
('Pomegranate', 'Nar', 'Pomegranate', 83, 1.7, 1.2, 19, 4, 'fruit', 'pome', 'turkish'),

-- Kuruyemiş ve Tohumlar
('Walnuts', 'Ceviz', 'Walnuts', 654, 15, 65, 14, 6.7, 'nuts', 'tree_nut', 'turkish'),
('Almonds', 'Badem', 'Almonds', 579, 21, 50, 22, 12, 'nuts', 'tree_nut', 'turkish'),
('Hazelnuts', 'Fındık', 'Hazelnuts', 628, 15, 61, 17, 10, 'nuts', 'tree_nut', 'turkish'),
('Pumpkin Seeds', 'Kabak Çekirdeği', 'Pumpkin Seeds', 559, 19, 49, 11, 6, 'nuts', 'seed', 'turkish'),
('Sunflower Seeds', 'Ayçiçeği Çekirdeği', 'Sunflower Seeds', 584, 21, 51, 20, 9, 'nuts', 'seed', 'turkish'),

-- Yağlar ve Soslar
('Olive Oil', 'Zeytinyağı', 'Olive Oil', 884, 0, 100, 0, 0, 'fat', 'oil', 'mediterranean'),
('Butter', 'Tereyağı', 'Butter', 717, 0.9, 81, 0.1, 0, 'fat', 'dairy', 'turkish'),
('Tahini', 'Tahin', 'Tahini', 595, 17, 54, 18, 9, 'fat', 'seed', 'turkish'),
('Hummus', 'Humus', 'Hummus', 166, 8, 10, 14, 6, 'fat', 'legume', 'mediterranean'),

-- Ekmek ve Tahıl Ürünleri
('Whole Wheat Bread', 'Tam Buğday Ekmeği', 'Whole Wheat Bread', 247, 13, 4.2, 41, 7, 'carb', 'bread', 'turkish'),
('Rye Bread', 'Çavdar Ekmeği', 'Rye Bread', 259, 9, 3.3, 48, 6, 'carb', 'bread', 'turkish'),
('Oatmeal', 'Yulaf Ezmesi', 'Oatmeal', 389, 17, 7, 66, 11, 'carb', 'cereal', 'turkish'),
('Bulgur Pilaf', 'Bulgur Pilavı', 'Bulgur Pilaf', 120, 3.5, 2, 22, 4, 'carb', 'rice', 'turkish'),

-- İçecekler
('Water', 'Su', 'Water', 0, 0, 0, 0, 0, 'drink', 'water', 'universal'),
('Turkish Tea', 'Türk Çayı', 'Turkish Tea', 2, 0.2, 0, 0.3, 0, 'drink', 'tea', 'turkish'),
('Coffee', 'Kahve', 'Coffee', 2, 0.3, 0, 0.2, 0, 'drink', 'coffee', 'universal'),
('Ayran', 'Ayran', 'Ayran', 37, 2.2, 1.6, 3.5, 0, 'drink', 'fermented', 'turkish'),
('Fresh Orange Juice', 'Taze Portakal Suyu', 'Fresh Orange Juice', 45, 0.7, 0.2, 10, 0.2, 'drink', 'juice', 'turkish')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ÖRNEK DİYET PROFİLLERİ
-- ============================================

-- Örnek kullanıcılar için diyet profilleri oluştur (eğer users tablosunda veri varsa)
INSERT INTO diet_profiles (
    user_id, gender, age, height_cm, weight_kg, activity_level, 
    goal_type, goal_percentage, diet_type, water_goal_ml
)
SELECT 
    u.id,
    COALESCE(u.gender, 'male'),
    COALESCE(u.age, 25),
    COALESCE(u.height, 175),
    COALESCE(u.current_weight, 70),
    'moderately_active',
    'maintain_weight',
    0,
    'balanced',
    COALESCE(u.water_goal_ml, 2500)
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM diet_profiles dp WHERE dp.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- ÖRNEK ÖĞÜN PLANLARI
-- ============================================

-- Haftalık dengeli diyet planı oluştur
INSERT INTO meal_plans (
    user_id, diet_profile_id, plan_name, plan_type, 
    start_date, end_date, calories_per_day, protein_per_day, 
    fat_per_day, carb_per_day
)
SELECT 
    u.id,
    dp.id,
    'Haftalık Dengeli Diyet',
    'weekly',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days',
    2300,
    135,
    77,
    268
FROM users u
JOIN diet_profiles dp ON u.id = dp.user_id
WHERE dp.diet_type = 'balanced'
LIMIT 1
ON CONFLICT (user_id, plan_name) DO NOTHING;

-- ============================================
-- ÖRNEK PLANLANMIŞ ÖĞÜNLER
-- ============================================

-- Pazartesi öğünleri
WITH meal_plan AS (
    SELECT id FROM meal_plans WHERE plan_name = 'Haftalık Dengeli Diyet' LIMIT 1
)
INSERT INTO planned_meals (
    meal_plan_id, day_of_week, meal_type, meal_order,
    food_id, food_name, portion_size_g, calories, protein_g, fat_g, carb_g, fiber_g
)
SELECT 
    mp.id,
    1, -- Pazartesi
    meal_type,
    meal_order,
    f.id,
    f.name_tr,
    portion_size,
    ROUND((f.calories_per_100g * portion_size / 100)::DECIMAL, 2),
    ROUND((f.protein_g_per_100g * portion_size / 100)::DECIMAL, 2),
    ROUND((f.fat_g_per_100g * portion_size / 100)::DECIMAL, 2),
    ROUND((f.carb_g_per_100g * portion_size / 100)::DECIMAL, 2),
    ROUND((f.fiber_g_per_100g * portion_size / 100)::DECIMAL, 2)
FROM meal_plan mp
CROSS JOIN (
    VALUES 
        ('breakfast', 1, 'Oatmeal', 80),
        ('breakfast', 2, 'Turkish Yogurt', 200),
        ('breakfast', 3, 'Apple', 150),
        ('morning_snack', 1, 'Almonds', 30),
        ('lunch', 1, 'Grilled Chicken Breast', 150),
        ('lunch', 2, 'Cooked Bulgur', 120),
        ('lunch', 3, 'Turkish Salad', 200),
        ('afternoon_snack', 1, 'Banana', 120),
        ('dinner', 1, 'Grilled Salmon', 150),
        ('dinner', 2, 'Steamed Broccoli', 200),
        ('dinner', 3, 'Cooked Quinoa', 100),
        ('evening_snack', 1, 'Turkish Yogurt', 150)
) AS meals(meal_type, meal_order, food_name, portion_size)
JOIN foods f ON f.name_tr = meals.food_name
WHERE NOT EXISTS (
    SELECT 1 FROM planned_meals pm 
    WHERE pm.meal_plan_id = mp.id 
    AND pm.day_of_week = 1
);

-- ============================================
-- ÖRNEK GÜNLÜK BESİN KAYITLARI (BUGÜN)
-- ============================================

-- Bugün için örnek besin kayıtları ekle
INSERT INTO food_logs (
    user_id, log_date, meal_type, log_time, food_id, food_name, 
    portion_size_g, calories, protein_g, fat_g, carb_g, fiber_g
)
SELECT 
    u.id,
    CURRENT_DATE,
    meal_type,
    log_time::TIME,
    f.id,
    f.name_tr,
    portion_size,
    ROUND((f.calories_per_100g * portion_size / 100)::DECIMAL, 2),
    ROUND((f.protein_g_per_100g * portion_size / 100)::DECIMAL, 2),
    ROUND((f.fat_g_per_100g * portion_size / 100)::DECIMAL, 2),
    ROUND((f.carb_g_per_100g * portion_size / 100)::DECIMAL, 2),
    ROUND((f.fiber_g_per_100g * portion_size / 100)::DECIMAL, 2)
FROM users u
CROSS JOIN (
    VALUES 
        ('breakfast', '08:00', 'Oatmeal', 60),
        ('breakfast', '08:00', 'Turkish Yogurt', 150),
        ('morning_snack', '10:30', 'Apple', 120),
        ('lunch', '13:00', 'Grilled Chicken Breast', 120),
        ('lunch', '13:00', 'Cooked Bulgur', 100),
        ('afternoon_snack', '15:30', 'Almonds', 20),
        ('dinner', '19:00', 'Grilled Salmon', 130),
        ('dinner', '19:00', 'Steamed Broccoli', 150)
) AS meals(meal_type, log_time, food_name, portion_size)
JOIN foods f ON f.name_tr = meals.food_name
WHERE u.id IN (SELECT user_id FROM diet_profiles LIMIT 1)
AND NOT EXISTS (
    SELECT 1 FROM food_logs fl 
    WHERE fl.user_id = u.id 
    AND fl.log_date = CURRENT_DATE
);

-- ============================================
-- ÖRNEK SU KAYITLARI (BUGÜN)
-- ============================================

-- Bugün için örnek su kayıtları ekle
INSERT INTO water_logs (user_id, log_date, log_time, amount_ml)
SELECT 
    u.id,
    CURRENT_DATE,
    log_time::TIME,
    amount_ml
FROM users u
CROSS JOIN (
    VALUES 
        ('08:00', 250),
        ('10:00', 250),
        ('12:00', 250),
        ('14:00', 250),
        ('16:00', 250),
        ('18:00', 250),
        ('20:00', 250),
        ('22:00', 250)
) AS water_logs(log_time, amount_ml)
WHERE u.id IN (SELECT user_id FROM diet_profiles LIMIT 1)
AND NOT EXISTS (
    SELECT 1 FROM water_logs wl 
    WHERE wl.user_id = u.id 
    AND wl.log_date = CURRENT_DATE
);

-- ============================================
-- ÖRNEK BESİN FAVORİLERİ
-- ============================================

-- Popüler besinleri favorilere ekle
INSERT INTO food_favorites (user_id, food_id, custom_portion_g, notes)
SELECT 
    u.id,
    f.id,
    custom_portion,
    notes
FROM users u
CROSS JOIN (
    VALUES 
        ('Turkish Yogurt', 200, 'Sabah kahvaltısı için'),
        ('Grilled Chicken Breast', 150, 'Öğle yemeği için'),
        ('Almonds', 30, 'Atıştırmalık için'),
        ('Apple', 150, 'Meyve olarak'),
        ('Cooked Bulgur', 120, 'Karbonhidrat kaynağı'),
        ('Steamed Broccoli', 200, 'Sebze olarak'),
        ('Olive Oil', 15, 'Salata sosu için'),
        ('Banana', 120, 'Antrenman öncesi')
) AS favorites(food_name, custom_portion, notes)
JOIN foods f ON f.name_tr = favorites.food_name
WHERE u.id IN (SELECT user_id FROM diet_profiles LIMIT 1)
ON CONFLICT (user_id, food_id) DO NOTHING;

-- ============================================
-- BAŞARILI VERİ EKLEME MESAJI
-- ============================================

DO $$
DECLARE
    food_count INTEGER;
    user_count INTEGER;
    meal_plan_count INTEGER;
    planned_meal_count INTEGER;
    food_log_count INTEGER;
    water_log_count INTEGER;
    favorite_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO food_count FROM foods;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO meal_plan_count FROM meal_plans;
    SELECT COUNT(*) INTO planned_meal_count FROM planned_meals;
    SELECT COUNT(*) INTO food_log_count FROM food_logs;
    SELECT COUNT(*) INTO water_log_count FROM water_logs;
    SELECT COUNT(*) INTO favorite_count FROM food_favorites;
    
    RAISE NOTICE '✅ Diyet modülü örnek verileri başarıyla eklendi!';
    RAISE NOTICE '📊 Eklenen veriler:';
    RAISE NOTICE '   - Besinler: % adet', food_count;
    RAISE NOTICE '   - Kullanıcılar: % adet', user_count;
    RAISE NOTICE '   - Öğün planları: % adet', meal_plan_count;
    RAISE NOTICE '   - Planlanmış öğünler: % adet', planned_meal_count;
    RAISE NOTICE '   - Besin kayıtları: % adet', food_log_count;
    RAISE NOTICE '   - Su kayıtları: % adet', water_log_count;
    RAISE NOTICE '   - Besin favorileri: % adet', favorite_count;
    RAISE NOTICE '🍽️ Türk mutfağı odaklı besinler eklendi';
    RAISE NOTICE '📅 Örnek haftalık diyet planı oluşturuldu';
    RAISE NOTICE '💧 Örnek su takibi kayıtları eklendi';
    RAISE NOTICE '⭐ Popüler besinler favorilere eklendi';
END $$;
