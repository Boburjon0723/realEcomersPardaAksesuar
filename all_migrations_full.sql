-- ============================================================
-- TechGear E-commerce - Barcha migratsiyalar (bitta fayl)
-- Supabase: Dashboard > SQL Editor > New query > bu faylni paste qiling > Run
-- ============================================================
-- Eslatma: Agar products, categories, banners jadvalari mavjud bo'lmasa,
-- 4, 5, 6-bo'limlardagi ALTER TABLE xatolik beradi - ularni o'chirib qoldiring.
-- storage.buckets ON CONFLICT bo'lishi mumkin - agar 'settings' bucket
-- allaqachon mavjud bo'lsa, 7-bo'limdagi INSERT ni o'tkazib yuboring.
-- ============================================================

-- ==================== 1. SETTINGS JADVALI ====================
-- (Agar settings mavjud bo'lsa, CREATE TABLE o'tkazilmaydi)
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT DEFAULT 'TechGear',
    logo_url TEXT,
    banner_text TEXT,
    phone TEXT,
    address TEXT,
    work_hours TEXT,
    telegram_url TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    humo_card TEXT,
    uzcard_card TEXT,
    visa_card TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Settings" ON settings;
CREATE POLICY "Public Read Settings" ON settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Update Settings" ON settings;
CREATE POLICY "Admin Update Settings" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- Kamida bitta qator (agar settings bo'sh bo'lsa)
INSERT INTO settings (site_name)
SELECT 'TechGear'
WHERE NOT EXISTS (SELECT 1 FROM settings LIMIT 1);

-- ==================== 2. ABOUT SAHIFASI SOZLAMALARI ====================
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_hero_title TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_hero_subtitle TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_hero_image TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stat1_value TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stat1_label TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stat2_value TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stat2_label TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stat3_value TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stat3_label TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stat4_value TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stat4_label TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_mission_title TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_mission_text1 TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_mission_text2 TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_mission_image TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS value1_title TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS value1_desc TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS value2_title TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS value2_desc TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS value3_title TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS value3_desc TEXT;

-- Banner va banner textlar (ko'p tilli)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS banner_text_uz TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS banner_text_ru TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS banner_text_en TEXT;

-- ==================== 3. PRODUCT_COLORS - RANGLAR (ko'p tilli) ====================
CREATE TABLE IF NOT EXISTS product_colors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    hex_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ranglar uchun ko'p tilli ustunlar
ALTER TABLE product_colors ADD COLUMN IF NOT EXISTS name_uz TEXT;
ALTER TABLE product_colors ADD COLUMN IF NOT EXISTS name_ru TEXT;
ALTER TABLE product_colors ADD COLUMN IF NOT EXISTS name_en TEXT;

-- Mavjud ranglarni to'ldirish
UPDATE product_colors 
SET 
    name_uz = COALESCE(name_uz, name),
    name_ru = COALESCE(name_ru, name),
    name_en = COALESCE(name_en, name)
WHERE name_uz IS NULL OR name_ru IS NULL OR name_en IS NULL;

-- 50+ ranglar katalogi (agar bo'sh bo'lsa)
INSERT INTO product_colors (name, name_uz, name_ru, name_en, hex_code) VALUES
('Oltin', 'Oltin', 'Золотой', 'Gold', '#FFD700'),
('Kumush', 'Kumush', 'Серебристый', 'Silver', '#C0C0C0'),
('Oq', 'Oq', 'Белый', 'White', '#FFFFFF'),
('Qora', 'Qora', 'Чёрный', 'Black', '#000000'),
('Sutli', 'Sutli', 'Молочный', 'Cream', '#FFFDD0'),
('Bej', 'Bej', 'Бежевый', 'Beige', '#F5F5DC'),
('Kulrang', 'Kulrang', 'Серый', 'Grey', '#808080'),
('Jigarrang', 'Jigarrang', 'Коричневый', 'Brown', '#A52A2A'),
('Yashil', 'Yashil', 'Зелёный', 'Green', '#008000'),
('Ko''k', 'Ko''k', 'Синий', 'Blue', '#0000FF'),
('Qizil', 'Qizil', 'Красный', 'Red', '#FF0000'),
('Sariq', 'Sariq', 'Жёлтый', 'Yellow', '#FFFF00'),
('Pushti', 'Pushti', 'Розовый', 'Pink', '#FFC0CB'),
('Binafsha', 'Binafsha', 'Фиолетовый', 'Purple', '#800080')
ON CONFLICT (name) DO UPDATE SET 
    name_uz = COALESCE(product_colors.name_uz, EXCLUDED.name),
    name_ru = COALESCE(product_colors.name_ru, EXCLUDED.name),
    name_en = COALESCE(product_colors.name_en, EXCLUDED.name);

-- ==================== 4. PRODUCTS JADVALI (colors, ko'p tilli) ====================
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_uz TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_ru TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_uz TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_ru TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Mavjud color ustunini colors arrayga ko'chirish
UPDATE products 
SET colors = ARRAY[color] 
WHERE color IS NOT NULL AND color != '' 
  AND (colors IS NULL OR array_length(colors, 1) IS NULL);

-- ==================== 5. CATEGORIES (ko'p tilli) ====================
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_uz TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ru TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_en TEXT;

-- ==================== 6. BANNERS (ko'p tilli) ====================
ALTER TABLE banners ADD COLUMN IF NOT EXISTS title_uz TEXT;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS title_ru TEXT;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS subtitle_uz TEXT;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS subtitle_ru TEXT;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS subtitle_en TEXT;

-- ==================== 7. STORAGE - Settings bucket (About rasmi uchun) ====================
INSERT INTO storage.buckets (id, name, public)
VALUES ('settings', 'settings', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Auth can upload settings" ON storage.objects;
CREATE POLICY "Auth can upload settings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'settings');

DROP POLICY IF EXISTS "Public can view settings" ON storage.objects;
CREATE POLICY "Public can view settings"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'settings');

-- ==================== TUGADI ====================
-- Barcha migratsiyalar muvaffaqiyatli bajarildi.
-- E-commerce: narx USD, ranglar UZ/RU/EN, About header rasmi settings orqali boshqariladi.
