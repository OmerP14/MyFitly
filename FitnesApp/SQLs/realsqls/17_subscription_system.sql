-- ========================================
-- ABONELİK SİSTEMİ (SUBSCRIPTION SYSTEM)
-- ========================================
-- Bu dosya kullanıcı abonelik durumunu yönetir
-- Fitly Pro aboneliği için entitlements tablosu

-- 1) ENTITLEMENTS TABLOSU - Abonelik durumunu tutar
CREATE TABLE IF NOT EXISTS entitlements (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,           -- 'fitly.pro.monthly'
  platform TEXT NOT NULL,             -- 'ios' | 'android'
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ,             -- Abonelik bitiş tarihi
  last_receipt JSONB,                 -- Son makbuz bilgisi
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) INDEX - Hızlı sorgu için
CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_expires_at ON entitlements(expires_at);
CREATE INDEX IF NOT EXISTS idx_entitlements_is_active ON entitlements(is_active);

-- 3) ROW LEVEL SECURITY - Güvenlik kuralları
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi abonelik bilgilerini okuyabilir
DROP POLICY IF EXISTS "ent_read_own" ON entitlements;
CREATE POLICY "ent_read_own" ON entitlements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Kullanıcılar kendi abonelik bilgilerini güncelleyebilir (restore için)
DROP POLICY IF EXISTS "ent_update_own" ON entitlements;
CREATE POLICY "ent_update_own" ON entitlements
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Yeni abonelik kaydı oluşturma (ilk satın alma)
DROP POLICY IF EXISTS "ent_insert_own" ON entitlements;
CREATE POLICY "ent_insert_own" ON entitlements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4) ENTITLEMENTS_EFFECTIVE VIEW - Otomatik abonelik kontrolü
CREATE OR REPLACE VIEW entitlements_effective AS
SELECT
  user_id,
  product_id,
  platform,
  -- Abonelik aktif mi? (bitiş tarihi gelecekte mi?)
  (expires_at IS NOT NULL AND expires_at > NOW()) AS is_active_now,
  expires_at,
  updated_at
FROM entitlements;

-- 5) UPDATED_AT TRIGGER - Güncelleme zamanını otomatik güncelle
CREATE OR REPLACE FUNCTION update_entitlements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS entitlements_updated_at_trigger ON entitlements;
CREATE TRIGGER entitlements_updated_at_trigger
  BEFORE UPDATE ON entitlements
  FOR EACH ROW
  EXECUTE FUNCTION update_entitlements_updated_at();

-- 6) ABONELİK BİTİŞ FONKSİYONU - Süresi dolan abonelikleri pasif yap
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE entitlements
  SET is_active = FALSE
  WHERE expires_at < NOW() AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7) ÖRNEK TEST VERİSİ (Geliştirme için - isteğe bağlı)
-- Test kullanıcısı için aktif abonelik
-- UNCOMMENT ETME - Sadece geliştirme için kullanılır
/*
INSERT INTO entitlements (user_id, product_id, platform, is_active, expires_at)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Test user ID
  'fitly.pro.monthly',
  'ios',
  TRUE,
  NOW() + INTERVAL '30 days'
) ON CONFLICT (user_id) DO UPDATE
SET 
  is_active = TRUE,
  expires_at = NOW() + INTERVAL '30 days',
  updated_at = NOW();
*/

-- ========================================
-- KULLANIM ÖRNEKLERİ
-- ========================================

-- Kullanıcının abonelik durumunu kontrol et:
-- SELECT * FROM entitlements_effective WHERE user_id = 'USER_ID';

-- Aktif abonelikleri listele:
-- SELECT * FROM entitlements WHERE is_active = TRUE;

-- Süresi dolan abonelikleri pasif yap:
-- SELECT check_expired_subscriptions();

-- Kullanıcı aboneliği oluştur/güncelle:
-- INSERT INTO entitlements (user_id, product_id, platform, is_active, expires_at)
-- VALUES ('USER_ID', 'fitly.pro.monthly', 'ios', TRUE, NOW() + INTERVAL '30 days')
-- ON CONFLICT (user_id) DO UPDATE
-- SET is_active = TRUE, expires_at = EXCLUDED.expires_at, updated_at = NOW();



