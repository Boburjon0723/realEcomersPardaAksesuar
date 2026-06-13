-- Optom + chakana narx: bitta products jadvalida ikki ustun
-- Supabase SQL Editor da ishga tushiring

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS retail_price numeric;

COMMENT ON COLUMN public.products.sale_price IS 'Optom narxi (wholesale)';
COMMENT ON COLUMN public.products.retail_price IS 'Chakana narxi (retail / optomsiz sayt)';

-- Buyurtma manbasi: qaysi saytdan kelganini ajratish
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_source_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_source_check
  CHECK (
    source = ANY (
      ARRAY[
        'do''kon'::text,
        'website'::text,
        'telefon'::text,
        'website_optom'::text,
        'website_chakana'::text
      ]
    )
  );
