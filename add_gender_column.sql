-- Users tablosuna gender sütunu ekle
DO $$
BEGIN
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
END $$;
