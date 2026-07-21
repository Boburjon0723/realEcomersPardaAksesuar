-- Moliya xarajatlaridan yig'ilgan raw_materials dublikatlarini tozalash.
-- Bir xil nomli (katta-kichik harf farqisiz) qatorlarni bittaga birlashtiradi:
--   1) Eng eski qator qoladi (kanonik)
--   2) material_movements, material_stock_movements, product_bom,
--      partner_finance_entry_lines dublikatdan kanonikka ko'chiriladi
--   3) Dublikat qatorlar o'chiriladi
--
-- Supabase SQL Editor'da ishga tushiring. Avval nusxa saqlash tavsiya etiladi.

DO $$
DECLARE
  dup RECORD;
  canonical_id UUID;
BEGIN
  FOR dup IN
    SELECT lower(trim(name_uz)) AS norm_name, array_agg(id ORDER BY created_at ASC, id ASC) AS ids
    FROM public.raw_materials
    WHERE name_uz IS NOT NULL AND trim(name_uz) <> ''
    GROUP BY lower(trim(name_uz))
    HAVING count(*) > 1
  LOOP
    canonical_id := dup.ids[1];

    -- Moliya xarajat yozuvlari
    UPDATE public.material_movements
    SET raw_material_id = canonical_id
    WHERE raw_material_id = ANY (dup.ids[2:]);

    -- Ombor miqdor jurnali (agar jadval bo'lsa)
    IF to_regclass('public.material_stock_movements') IS NOT NULL THEN
      UPDATE public.material_stock_movements
      SET raw_material_id = canonical_id
      WHERE raw_material_id = ANY (dup.ids[2:]);
    END IF;

    -- Retseptlar (agar jadval bo'lsa) — kanonikda shu material allaqachon bo'lsa, dublikat qatorni o'chiramiz
    IF to_regclass('public.product_bom') IS NOT NULL THEN
      DELETE FROM public.product_bom pb
      WHERE pb.material_id = ANY (dup.ids[2:])
        AND EXISTS (
          SELECT 1 FROM public.product_bom pb2
          WHERE pb2.product_id = pb.product_id AND pb2.material_id = canonical_id
        );
      UPDATE public.product_bom
      SET material_id = canonical_id
      WHERE material_id = ANY (dup.ids[2:]);
    END IF;

    -- Hamkor moliya qatorlari (agar ustun bo'lsa)
    IF to_regclass('public.partner_finance_entry_lines') IS NOT NULL THEN
      BEGIN
        UPDATE public.partner_finance_entry_lines
        SET raw_material_id = canonical_id
        WHERE raw_material_id = ANY (dup.ids[2:]);
      EXCEPTION WHEN undefined_column THEN
        NULL;
      END;
    END IF;

    -- Dublikat qoldiqlarini kanonikka qo'shish (miqdor yo'qolmasin)
    UPDATE public.raw_materials c
    SET stock_quantity = COALESCE(c.stock_quantity, 0) + s.extra
    FROM (
      SELECT COALESCE(SUM(COALESCE(stock_quantity, 0)), 0) AS extra
      FROM public.raw_materials
      WHERE id = ANY (dup.ids[2:])
    ) s
    WHERE c.id = canonical_id AND s.extra > 0;

    -- Agar dublikatlardan biri track_stock=true bo'lsa, kanonik ham true bo'lsin
    UPDATE public.raw_materials c
    SET track_stock = true
    WHERE c.id = canonical_id
      AND EXISTS (
        SELECT 1 FROM public.raw_materials d
        WHERE d.id = ANY (dup.ids[2:]) AND d.track_stock = true
      );

    -- Dublikatlarni o'chirish
    DELETE FROM public.raw_materials WHERE id = ANY (dup.ids[2:]);

    RAISE NOTICE 'Birlashtirildi: % (% ta dublikat)', dup.norm_name, array_length(dup.ids, 1) - 1;
  END LOOP;
END $$;

-- Tekshirish: qolgan dublikatlar (bo'sh bo'lishi kerak)
SELECT lower(trim(name_uz)) AS name, count(*)
FROM public.raw_materials
GROUP BY lower(trim(name_uz))
HAVING count(*) > 1;
