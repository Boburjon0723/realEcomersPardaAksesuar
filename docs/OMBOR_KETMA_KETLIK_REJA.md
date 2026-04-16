# Ombor takomillashtirish — ketma-ketlik rejasi

Maqsad: avval **hisob-to‘g‘ri** va **kodda izchil** poydevor, keyin **qulay interfeys** va **katta funksiyalar** (inventar sessiyasi).

---

## Bosqich 1 — Ma’lumot modeli va sotuv logikasi (ustuvor)

**Nima uchun avval:** UI yaxshilansa ham, sotuvda zaxira noto‘g‘ri bo‘lsa ishonch yo‘qoladi. Rangli mahsulotlarda hozir `stock` kamayadi, `stock_by_color` esa avtomatik yangilanmasligi mumkin.

| # | Vazifa | Natija |
|---|--------|--------|
| 1.1 | `stock_movements` jadvali hozirgi ustunlarni tekshirish (Supabase); kerak bo‘lsa `color_key` / `reference_id` / `reference_type` kabi ixtiyoriy ustunlar — **faqat kerak bo‘lsa** migratsiya | Harakatlar buyurtma/rang bilan bog‘lanishi mumkin |
| 1.2 | `deductStockForCompletedOrder` / `reverseStockForOrder` ni yangilash: mahsulotda `stock_by_color` bo‘lsa, buyurtma qatoridagi **rang** bo‘yicha ayirish va qaytarish; umumiy `stock` jami bilan mos | Ombor va buyurtma bir xil manzildan “gapirmaydi” |
| 1.3 | Qator rangi yo‘q yoki mos kelmasa — aniq qoida (masalan, faqat umumiy `stock`dan yoki ogohlantirish) | Chegaraviy holatlar aniql |

**Tugagach:** qisqa regressiya — bitta rangli, ko‘p rangli, rangsiz mahsulot bilan test buyurtma.

---

## Bosqich 2 — Ombor UI: tezkor yaxshilanishlar (ixtisos)

Ma’lumotlar qoidasi barqaror bo‘lgach, foydalanuvchi tajribasini yaxshilash — katta DB o‘zgarishisiz.

| # | Vazifa | Natija |
|---|--------|--------|
| 2.1 | **Zaxira tarixi:** `limit 20` o‘rniga sahifalash yoki “Yana yuklash”, sana oralig‘i filtri (ixtiyoriy) | Uzoq tarixni ko‘rish |
| 2.2 | **Eksport / jadval:** mavjud Excelga minimal ustunlar (oxirgi harakat sanasi — ixtiyoriy, keyingi bosqich) | Hisobot |
| 2.3 | **Kam zaxira ro‘yxati:** alohida blok yoki filtr (oldingi “Low stock alert” qayta ko‘rib chiqiladi) | Tezkor e’tibor |

---

## Bosqich 3 — Inventar sessiyasi (murakkabroq modul)

**Nima uchun keyin:** alohida “sanash sessiyasi” uchun jadval va **posted** holati kerak; bu `OMBOR_BUYURTMA_REJASI.md` dagi bosqich 1–2 bilan uyg‘un.

| # | Vazifa | Natija |
|---|--------|--------|
| 3.1 | DB: `inventory_sessions` (+ kerak bo‘lsa qatorlar jadvali) yoki mavjud rejaga mos variant | Bir martalik inventarizatsiya hujjati |
| 3.2 | CRM: sessiya yaratish → mahsulot/rang bo‘yicha sanash → **tasdiqlash** → `products` / `stock_by_color` / `stock_movements` ga yozish | Fizik ombor = CRM bilan sinxron |
| 3.3 | Xatolarni oldini olish: draft, bekor qilish, takroriy tasdiqlashdan himoya | Xavfsiz operatsiya |

---

## Bosqich 4 — Buyurtma tayyorligi / rezerv (ixtiyoriy, keyingi)

`order_items` da tayyor miqdor yoki rezerv — alohida loyiha; ombor asoslari (1–3) tayyor bo‘lgach.

---

## Qisqa xulosa

1. **Avval:** ma’lumot modeli + **rang bo‘yicha sotuv ayirish** (Bosqich 1).  
2. **Keyin:** tarix / filtr / kam zaxira UI (Bosqich 2).  
3. **So‘ng:** inventar sessiyasi (Bosqich 3).  
4. **Oxirida:** buyurtma tayyorligi/rezerv (Bosqich 4), agar biznes talab qilsa.

Mavjud umumiy reja: `OMBOR_BUYURTMA_REJASI.md`.
