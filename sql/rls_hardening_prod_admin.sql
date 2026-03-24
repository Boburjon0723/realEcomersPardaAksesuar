-- =============================================================================
-- PRODUCTION: mahsulot/kategoriya/banner/sozlamalar yozuvlarini faqat admin UID ga
-- =============================================================================
-- OLDIN: Supabase SQL Editor da SERVICE ROLE yoki Dashboard > Authentication
--        orqali o'z CRM foydalanuvchingiz UUID sini aniqlang, keyin:
--
--   INSERT INTO public.app_admins (user_id)
--   SELECT id FROM auth.users WHERE email = 'sizning@email.com' LIMIT 1
--   ON CONFLICT (user_id) DO NOTHING;
--
-- Keyin ushbu faylni bitta bo'lib ishga tushiring. Agar INSERT qator bo'lmasa,
-- CRM mahsulot yozuvlari RAD ETILADI (403).
--
-- ORQAGA QAYTARISH: Eski siyosatlarni supabase_fresh_install_complete.sql dan
-- qayta qo'llang yoki "Allow insert products" kabi ochiq siyosatlarni qayta yarating.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.app_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

-- Kimdir o'z qatorini ko'ra oladi (debug)
DROP POLICY IF EXISTS "app_admins_select_own" ON public.app_admins;
CREATE POLICY "app_admins_select_own" ON public.app_admins
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- ---------- PRODUCTS ----------
DROP POLICY IF EXISTS "Allow insert products" ON public.products;
DROP POLICY IF EXISTS "Allow update products" ON public.products;
DROP POLICY IF EXISTS "Allow delete products" ON public.products;

CREATE POLICY "Admins insert products" ON public.products
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));

CREATE POLICY "Admins update products" ON public.products
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));

CREATE POLICY "Admins delete products" ON public.products
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));

-- ---------- CATEGORIES ----------
DROP POLICY IF EXISTS "Allow insert categories" ON public.categories;
DROP POLICY IF EXISTS "Allow update categories" ON public.categories;
DROP POLICY IF EXISTS "Allow delete categories" ON public.categories;

CREATE POLICY "Admins insert categories" ON public.categories
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));

CREATE POLICY "Admins update categories" ON public.categories
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));

CREATE POLICY "Admins delete categories" ON public.categories
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));

-- ---------- BANNERS ----------
DROP POLICY IF EXISTS "Allow insert banners" ON public.banners;
DROP POLICY IF EXISTS "Allow update banners" ON public.banners;
DROP POLICY IF EXISTS "Allow delete banners" ON public.banners;

CREATE POLICY "Admins insert banners" ON public.banners
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));

CREATE POLICY "Admins update banners" ON public.banners
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));

CREATE POLICY "Admins delete banners" ON public.banners
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));

-- ---------- SETTINGS (o'qish — hammaga; yozish — faqat admin) ----------
DROP POLICY IF EXISTS "Admin Update Settings" ON public.settings;
DROP POLICY IF EXISTS "Allow insert settings" ON public.settings;
DROP POLICY IF EXISTS "Allow update settings" ON public.settings;
DROP POLICY IF EXISTS "Allow delete settings" ON public.settings;
DROP POLICY IF EXISTS "Admins all settings" ON public.settings;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Settings' AND tablename = 'settings') THEN
        CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);
    END IF;
END $$;

CREATE POLICY "Admins insert settings" ON public.settings
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));

CREATE POLICY "Admins update settings" ON public.settings
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));

CREATE POLICY "Admins delete settings" ON public.settings
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));

-- ---------- PRODUCT_COLORS (rang kutubxonasi — CRM) ----------
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_colors') THEN
        DROP POLICY IF EXISTS "Public read product_colors" ON public.product_colors;
        DROP POLICY IF EXISTS "Allow insert product_colors" ON public.product_colors;
        DROP POLICY IF EXISTS "Allow update product_colors" ON public.product_colors;
        DROP POLICY IF EXISTS "Allow delete product_colors" ON public.product_colors;

        CREATE POLICY "Public read product_colors" ON public.product_colors FOR SELECT USING (true);
        CREATE POLICY "Admins insert product_colors" ON public.product_colors
            FOR INSERT TO authenticated
            WITH CHECK (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));
        CREATE POLICY "Admins update product_colors" ON public.product_colors
            FOR UPDATE TO authenticated
            USING (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()))
            WITH CHECK (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));
        CREATE POLICY "Admins delete product_colors" ON public.product_colors
            FOR DELETE TO authenticated
            USING (EXISTS (SELECT 1 FROM public.app_admins a WHERE a.user_id = auth.uid()));
    END IF;
END $$;
