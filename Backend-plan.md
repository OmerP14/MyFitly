# 🗄️ FITNESS APP - SUPABASE BACKEND PLANI

## 📋 Genel Yaklaşım

**Önemli Not**: Login ekranınız yok, bu yüzden kullanıcılar ilk açılışta random ID ile ana ekrana yönlendiriliyor. Bu durumda veri kaybını önlemek için:

1. **Otomatik Kullanıcı Oluşturma**: İlk açılışta random UUID ile kullanıcı oluşturulacak
2. **Local Storage**: Kullanıcı ID'si cihazda saklanacak
3. **Veri Senkronizasyonu**: Offline durumda bile veri kaybı olmayacak

---

## 🏗️ DATABASE TABLOLARI

### 1. **users** Tablosu
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT 'Kullanıcı',
  email TEXT,
  age INTEGER DEFAULT 25,
  height INTEGER DEFAULT 180,
  current_weight DECIMAL(5,2) DEFAULT 70.0,
  target_weight DECIMAL(5,2) DEFAULT 65.0,
  profile_photo_url TEXT,
  is_dark_mode BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. **workout_programs** Tablosu
```sql
CREATE TABLE workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_custom BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. **exercises** Tablosu
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Pazar, 1=Pazartesi, ..., 6=Cumartesi
  name TEXT NOT NULL,
  sets INTEGER DEFAULT 3,
  reps INTEGER DEFAULT 10,
  weight DECIMAL(5,2) DEFAULT 0.0,
  category TEXT DEFAULT 'general', -- 'upper', 'lower', 'cardio', 'general'
  is_completed BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. **workout_sessions** Tablosu
```sql
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  sets_completed INTEGER DEFAULT 0,
  reps_completed INTEGER DEFAULT 0,
  weight_used DECIMAL(5,2) DEFAULT 0.0,
  duration_minutes INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. **weight_tracking** Tablosu
```sql
CREATE TABLE weight_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  measurement_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. **strength_tracking** Tablosu
```sql
CREATE TABLE strength_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  max_weight DECIMAL(5,2) NOT NULL,
  max_reps INTEGER DEFAULT 1,
  measurement_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. **motivation_quotes** Tablosu
```sql
CREATE TABLE motivation_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_text TEXT NOT NULL,
  author TEXT,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8. **user_favorite_quotes** Tablosu
```sql
CREATE TABLE user_favorite_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES motivation_quotes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quote_id)
);
```

---

## 🔧 SUPABASE FUNCTIONS

### 1. **Otomatik Kullanıcı Oluşturma**
```sql
CREATE OR REPLACE FUNCTION create_user_if_not_exists(device_id_param TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Kullanıcı var mı kontrol et
  SELECT id INTO user_id FROM users WHERE device_id = device_id_param;
  
  -- Yoksa yeni kullanıcı oluştur
  IF user_id IS NULL THEN
    INSERT INTO users (device_id, name) 
    VALUES (device_id_param, 'Kullanıcı')
    RETURNING id INTO user_id;
  END IF;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;
```

### 2. **Günlük İstatistikleri Getir**
```sql
CREATE OR REPLACE FUNCTION get_daily_stats(user_id_param UUID, target_date DATE)
RETURNS TABLE (
  total_workouts INTEGER,
  total_sets INTEGER,
  total_weight DECIMAL,
  calories_burned INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT ws.exercise_id)::INTEGER as total_workouts,
    COALESCE(SUM(ws.sets_completed), 0)::INTEGER as total_sets,
    COALESCE(SUM(ws.weight_used * ws.reps_completed), 0) as total_weight,
    COALESCE(SUM(ws.calories_burned), 0)::INTEGER as calories_burned
  FROM workout_sessions ws
  WHERE ws.user_id = user_id_param 
    AND ws.session_date = target_date;
END;
$$ LANGUAGE plpgsql;
```

### 3. **Haftalık İstatistikleri Getir**
```sql
CREATE OR REPLACE FUNCTION get_weekly_stats(user_id_param UUID, start_date DATE)
RETURNS TABLE (
  week_start DATE,
  week_end DATE,
  total_workouts INTEGER,
  total_sets INTEGER,
  avg_weight DECIMAL,
  total_calories INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    start_date as week_start,
    start_date + INTERVAL '6 days' as week_end,
    COUNT(DISTINCT ws.session_date)::INTEGER as total_workouts,
    COALESCE(SUM(ws.sets_completed), 0)::INTEGER as total_sets,
    COALESCE(AVG(ws.weight_used), 0) as avg_weight,
    COALESCE(SUM(ws.calories_burned), 0)::INTEGER as total_calories
  FROM workout_sessions ws
  WHERE ws.user_id = user_id_param 
    AND ws.session_date >= start_date 
    AND ws.session_date <= start_date + INTERVAL '6 days';
END;
$$ LANGUAGE plpgsql;
```

### 4. **Kilo Trendi Getir**
```sql
CREATE OR REPLACE FUNCTION get_weight_trend(user_id_param UUID, period_days INTEGER)
RETURNS TABLE (
  measurement_date DATE,
  weight DECIMAL,
  weight_change DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wt.measurement_date,
    wt.weight,
    wt.weight - LAG(wt.weight) OVER (ORDER BY wt.measurement_date) as weight_change
  FROM weight_tracking wt
  WHERE wt.user_id = user_id_param 
    AND wt.measurement_date >= CURRENT_DATE - INTERVAL '1 day' * period_days
  ORDER BY wt.measurement_date;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 TRACKING SCREEN SQL FONKSİYONLARI

### Kilo Takibi İşlemleri

#### 1. Kilo Ekleme
```sql
CREATE OR REPLACE FUNCTION add_weight_entry(
  user_id_param UUID,
  weight_param DECIMAL(5,2),
  measurement_date_param DATE DEFAULT CURRENT_DATE,
  notes_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  new_entry weight_tracking%ROWTYPE;
BEGIN
  INSERT INTO weight_tracking (user_id, weight, measurement_date, notes)
  VALUES (user_id_param, weight_param, measurement_date_param, notes_param)
  RETURNING * INTO new_entry;
  
  UPDATE users 
  SET current_weight = weight_param, updated_at = NOW()
  WHERE id = user_id_param;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Kilo verisi başarıyla kaydedildi',
    'data', row_to_json(new_entry)
  );
END;
$$ LANGUAGE plpgsql;
```

#### 2. Kilo Verilerini Getirme
```sql
CREATE OR REPLACE FUNCTION get_weight_data(
  user_id_param UUID,
  period_type TEXT DEFAULT 'monthly'
)
RETURNS JSON AS $$
DECLARE
  start_date DATE;
  weight_records JSON;
  weight_change DECIMAL(5,2);
  avg_weight DECIMAL(5,2);
BEGIN
  CASE period_type
    WHEN 'weekly' THEN start_date := CURRENT_DATE - INTERVAL '7 days';
    WHEN 'monthly' THEN start_date := CURRENT_DATE - INTERVAL '30 days';
    WHEN 'yearly' THEN start_date := CURRENT_DATE - INTERVAL '365 days';
    ELSE start_date := CURRENT_DATE - INTERVAL '30 days';
  END CASE;
  
  SELECT json_agg(
    json_build_object(
      'id', id,
      'weight', weight,
      'measurement_date', measurement_date,
      'notes', notes
    ) ORDER BY measurement_date ASC
  ) INTO weight_records
  FROM weight_tracking
  WHERE user_id = user_id_param 
    AND measurement_date >= start_date;
  
  SELECT 
    (MAX(weight) - MIN(weight)),
    AVG(weight)
  INTO weight_change, avg_weight
  FROM weight_tracking
  WHERE user_id = user_id_param 
    AND measurement_date >= start_date;
  
  RETURN json_build_object(
    'success', true,
    'period', period_type,
    'data', COALESCE(weight_records, '[]'::json),
    'stats', json_build_object(
      'weight_change', COALESCE(weight_change, 0),
      'avg_weight', COALESCE(avg_weight, 0),
      'total_entries', COALESCE(json_array_length(weight_records), 0)
    )
  );
END;
$$ LANGUAGE plpgsql;
```

#### 3. Kilo Güncelleme
```sql
CREATE OR REPLACE FUNCTION update_weight_entry(
  entry_id_param UUID,
  user_id_param UUID,
  weight_param DECIMAL(5,2) DEFAULT NULL,
  measurement_date_param DATE DEFAULT NULL,
  notes_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  updated_entry weight_tracking%ROWTYPE;
BEGIN
  UPDATE weight_tracking
  SET 
    weight = COALESCE(weight_param, weight),
    measurement_date = COALESCE(measurement_date_param, measurement_date),
    notes = COALESCE(notes_param, notes)
  WHERE id = entry_id_param AND user_id = user_id_param
  RETURNING * INTO updated_entry;
  
  IF updated_entry.id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Kayıt bulunamadı');
  END IF;
  
  RETURN json_build_object('success', true, 'data', row_to_json(updated_entry));
END;
$$ LANGUAGE plpgsql;
```

#### 4. Kilo Silme
```sql
CREATE OR REPLACE FUNCTION delete_weight_entry(
  entry_id_param UUID,
  user_id_param UUID
)
RETURNS JSON AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM weight_tracking
  WHERE id = entry_id_param AND user_id = user_id_param;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  IF deleted_count = 0 THEN
    RETURN json_build_object('success', false, 'message', 'Kayıt bulunamadı');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Kilo verisi silindi');
END;
$$ LANGUAGE plpgsql;
```

### Ağırlık/Güç Takibi İşlemleri

#### 1. Ağırlık Ekleme
```sql
CREATE OR REPLACE FUNCTION add_strength_entry(
  user_id_param UUID,
  exercise_name_param TEXT,
  max_weight_param DECIMAL(5,2),
  max_reps_param INTEGER DEFAULT 1,
  measurement_date_param DATE DEFAULT CURRENT_DATE,
  notes_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  new_entry strength_tracking%ROWTYPE;
  previous_max DECIMAL(5,2);
  improvement DECIMAL(5,2);
BEGIN
  SELECT max_weight INTO previous_max
  FROM strength_tracking
  WHERE user_id = user_id_param 
    AND exercise_name = exercise_name_param
  ORDER BY measurement_date DESC
  LIMIT 1;
  
  improvement := max_weight_param - COALESCE(previous_max, 0);
  
  INSERT INTO strength_tracking (
    user_id, exercise_name, max_weight, max_reps, measurement_date, notes
  )
  VALUES (
    user_id_param, exercise_name_param, max_weight_param, 
    max_reps_param, measurement_date_param, notes_param
  )
  RETURNING * INTO new_entry;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Ağırlık verisi kaydedildi',
    'data', row_to_json(new_entry),
    'improvement', COALESCE(improvement, 0),
    'is_new_record', improvement > 0
  );
END;
$$ LANGUAGE plpgsql;
```

#### 2. Ağırlık Verilerini Getirme
```sql
CREATE OR REPLACE FUNCTION get_strength_data(
  user_id_param UUID,
  period_type TEXT DEFAULT 'monthly',
  exercise_name_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  start_date DATE;
  strength_records JSON;
BEGIN
  CASE period_type
    WHEN 'weekly' THEN start_date := CURRENT_DATE - INTERVAL '7 days';
    WHEN 'monthly' THEN start_date := CURRENT_DATE - INTERVAL '30 days';
    WHEN 'yearly' THEN start_date := CURRENT_DATE - INTERVAL '365 days';
    ELSE start_date := CURRENT_DATE - INTERVAL '30 days';
  END CASE;
  
  SELECT json_agg(
    json_build_object(
      'id', id,
      'exercise_name', exercise_name,
      'max_weight', max_weight,
      'max_reps', max_reps,
      'measurement_date', measurement_date
    ) ORDER BY measurement_date DESC
  ) INTO strength_records
  FROM strength_tracking
  WHERE user_id = user_id_param 
    AND measurement_date >= start_date
    AND (exercise_name_param IS NULL OR exercise_name = exercise_name_param);
  
  RETURN json_build_object(
    'success', true,
    'data', COALESCE(strength_records, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql;
```

#### 3. Dashboard İstatistikleri
```sql
CREATE OR REPLACE FUNCTION get_tracking_dashboard_stats(
  user_id_param UUID
)
RETURNS JSON AS $$
DECLARE
  total_weight_loss DECIMAL(5,2);
  total_strength_gain DECIMAL(5,2);
  active_days INTEGER;
  current_weight DECIMAL(5,2);
  target_weight DECIMAL(5,2);
  goal_progress INTEGER;
  recent_entries JSON;
BEGIN
  -- Kilo kaybı (son 30 gün)
  SELECT (MAX(weight) - MIN(weight)) INTO total_weight_loss
  FROM weight_tracking
  WHERE user_id = user_id_param
    AND measurement_date >= CURRENT_DATE - INTERVAL '30 days';
  
  -- Ağırlık artışı
  SELECT SUM(
    (max_weight - LAG(max_weight) OVER (PARTITION BY exercise_name ORDER BY measurement_date))
  ) INTO total_strength_gain
  FROM strength_tracking
  WHERE user_id = user_id_param
    AND measurement_date >= CURRENT_DATE - INTERVAL '30 days';
  
  -- Aktif gün sayısı
  SELECT COUNT(DISTINCT measurement_date) INTO active_days
  FROM (
    SELECT measurement_date FROM weight_tracking WHERE user_id = user_id_param
    UNION
    SELECT measurement_date FROM strength_tracking WHERE user_id = user_id_param
  ) as all_dates
  WHERE measurement_date >= CURRENT_DATE - INTERVAL '30 days';
  
  -- Kullanıcı bilgileri
  SELECT current_weight, target_weight INTO current_weight, target_weight
  FROM users WHERE id = user_id_param;
  
  -- İlerleme yüzdesi
  IF target_weight IS NOT NULL AND current_weight IS NOT NULL THEN
    goal_progress := GREATEST(0, LEAST(100, 
      100 - ((current_weight - target_weight) * 100 / NULLIF(current_weight, 0))
    ));
  ELSE
    goal_progress := 0;
  END IF;
  
  -- Son kayıtlar
  SELECT json_agg(
    json_build_object(
      'type', type,
      'title', title,
      'value', value,
      'date', date
    )
  ) INTO recent_entries
  FROM (
    SELECT * FROM (
      SELECT 'weight' as type, 'Kilo' as title, 
             weight || ' kg' as value, measurement_date as date
      FROM weight_tracking
      WHERE user_id = user_id_param
      ORDER BY measurement_date DESC LIMIT 3
    ) as weight_data
    
    UNION ALL
    
    SELECT * FROM (
      SELECT 'strength' as type, exercise_name as title,
             max_reps || 'x' || max_weight || 'kg' as value, measurement_date as date
      FROM strength_tracking
      WHERE user_id = user_id_param
      ORDER BY measurement_date DESC LIMIT 3
    ) as strength_data
  ) as combined
  ORDER BY date DESC LIMIT 5;
  
  RETURN json_build_object(
    'success', true,
    'stats', json_build_object(
      'total_weight_loss', COALESCE(ABS(total_weight_loss), 0),
      'total_strength_gain', COALESCE(total_strength_gain, 0),
      'active_days', COALESCE(active_days, 0),
      'current_weight', COALESCE(current_weight, 0),
      'target_weight', COALESCE(target_weight, 0),
      'goal_progress', goal_progress
    ),
    'recent_entries', COALESCE(recent_entries, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 🔐 RLS (Row Level Security) POLICIES

### Users Tablosu
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (id = auth.uid() OR device_id = current_setting('app.device_id', true));

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (id = auth.uid() OR device_id = current_setting('app.device_id', true));
```

### Tracking Tabloları
```sql
ALTER TABLE weight_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE strength_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own weight data" ON weight_tracking
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE device_id = current_setting('app.device_id', true)
  ));

CREATE POLICY "Users can manage own strength data" ON strength_tracking
  FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE device_id = current_setting('app.device_id', true)
  ));
```

---

## 📱 REACT NATIVE ENTEGRASYONU

### 1. Supabase Client Kurulumu
```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

### 2. Supabase Config
```javascript
// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 3. Device ID Yönetimi
```javascript
// src/utils/deviceManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

export const getOrCreateDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem('device_id');
    
    if (!deviceId) {
      deviceId = generateUUID();
      await AsyncStorage.setItem('device_id', deviceId);
      
      const { data } = await supabase.rpc('create_user_if_not_exists', {
        device_id_param: deviceId
      });
    }
    
    return deviceId;
  } catch (error) {
    console.error('Device ID error:', error);
    return null;
  }
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
```

---

## 🚀 KURULUM ADIMLARI

### 1. Supabase Projesi Oluştur
1. [Supabase Dashboard](https://supabase.com/dashboard)'a git
2. "New Project" oluştur
3. Database URL ve API Key'leri al

### 2. Tabloları Oluştur
Yukarıdaki CREATE TABLE komutlarını Supabase SQL Editor'da çalıştır

### 3. Functions Oluştur
Yukarıdaki CREATE FUNCTION komutlarını çalıştır

### 4. RLS Politikalarını Aktif Et
Yukarıdaki ALTER TABLE ve CREATE POLICY komutlarını çalıştır

### 5. React Native'e Entegre Et
```bash
cd /Users/omerpehriz/Desktop/Project/FitnesApp
npm install @supabase/supabase-js @react-native-async-storage/async-storage
```

### 6. TrackingService'i Kullan
`src/services/trackingService.js` dosyasını kullanarak tüm tracking işlemlerini yap

---

## 📊 İNDEKSLER (Performance)

```sql
-- Weight tracking indeksleri
CREATE INDEX IF NOT EXISTS idx_weight_tracking_user_date 
  ON weight_tracking(user_id, measurement_date DESC);

-- Strength tracking indeksleri
CREATE INDEX IF NOT EXISTS idx_strength_tracking_user_date 
  ON strength_tracking(user_id, measurement_date DESC);

CREATE INDEX IF NOT EXISTS idx_strength_tracking_exercise 
  ON strength_tracking(user_id, exercise_name, measurement_date DESC);
```

---

## 📝 ÖNEMLİ NOTLAR

1. **Tracking Screen**: `tracking-sql-setup.sql` dosyasındaki tüm SQL komutları hazır
2. **React Native Service**: `src/services/trackingService.js` kullanıma hazır
3. **Integration Guide**: `TRACKING_INTEGRATION_GUIDE.md` adım adım entegrasyon rehberi
4. **Veri Kaybı Yok**: Offline mode için AsyncStorage kullanılıyor
5. **RLS Aktif**: Güvenlik politikaları hazır

---

Bu plan ile uygulamanız tamamen fonksiyonel hale gelecek! 🚀
