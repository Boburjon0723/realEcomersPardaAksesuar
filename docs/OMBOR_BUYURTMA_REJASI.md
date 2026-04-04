# Ombor va buyurtma bo‘yicha ishlab chiqish rejasi

Bu hujjat **korxonadagi fizik ombor** → **CRMdagi hisob** → **buyurtmada tayyorlik / qisman bajarish** oqimini loyihalash va kodga bosqichma-bosqich kiritish uchun reja.

**Hozirgi holat (qisqa):**

- `Mahsulotlar` — katalog (`products`).
- `Ombor` — `products` ro‘yxati va `stock` maydoni; `+` / `-` tugmalari.
- `Buyurtmalar` — qatorlar bo‘yicha miqdor; mavjud bo‘lsa, `stock` yetishmasligi ogohlantiriladi.

**Maqsad:** CRMdagi qoldiq **rasmiy hisob** bo‘lsin (fizik sanashdan keyin kiritiladi); buyurtmada **to‘liq / qisman tayyor** bo‘yicha reja va ko‘rinish.

---

## 1. Tushunchalar (ajratish)

| Atama | Ma’nosi |
|--------|---------|
| **Katalog** | Saytda / CRMda sotiladigan mahsulot kartochkasi (`products`). |
| **CRM ombor qoldig‘i** | `products.stock` — tizim hisobidagi mavjud dona (yoki keyinchalik ledger yig‘indisi). |
| **Fizik ombor** | Korxonadagi haqiqiy zaxira; tizimga faqat siz kiritgan raqamlar orqali aks etadi. |
| **Rezerv** | Buyurtma uchun vaqtincha “band qilingan” miqdor (keyingi bosqich). |
| **Tayyorlik** | Buyurtma qatori bo‘yicha ishlab chiqarish / yig‘ish natijasi (qisman yoki to‘liq). |

---

## 2. Foydalanuvchi jarayoni (maqsad)

1. **Korxonada** — inventarizatsiya yoki kirim hujjatiga asosan sanash.
2. **CRM → Ombor** — sanash natijasini kiritish (**bir martalik inventarizatsiya** yoki **kirim/chiqim yozuvi**).
3. **Buyurtma** — kerakli miqdor, mavjud qoldiq / rezerv bilan solishtirish; qator bo‘yicha **tayyor miqdor** va holat.

---

## 3. Ma’lumotlar bazasi — bosqichlar

### Bosqich 0 — minimal tayyorlik (mavjud / migratsiya)

- `products.stock` va ixtiyoriy `products.min_stock` — barcha muhitlarda mavjud bo‘lishi (`update_products_schema.sql` yoki alohida migratsiya).
- Narx: ombor va hisobotlar uchun **`sale_price`** (yoki `price`) bilan bir xil maydon tanlanadi.

### Bosqich 1 — tarix va sabab (tavsiya etiladi)

Yangi jadval masalan `stock_movements`:

| Ustun | Tavsif |
|--------|--------|
| `id` | UUID |
| `product_id` | FK → `products` |
| `delta` | Butun son (+ kirim, - chiqim) |
| `reason` | `inventory_set`, `sale`, `return`, `adjustment`, … |
| `reference_type` / `reference_id` | Buyurtma, inventar sessiyasi, … |
| `note` | Izoh |
| `created_at` | Vaqt |

Inventarizatsiya “bir martada ko‘p mahsulot” uchun:

- `inventory_sessions`: `id`, `occurred_at`, `note`, `status` (`draft` | `posted`).

### Bosqich 2 — buyurtma tayyorligi

`order_items` ga (yoki alohida jadval):

| Maydon | Tavsif |
|--------|--------|
| `qty_ready` yoki `qty_fulfilled` | Tayyorlangan / berilgan miqdor |
| `fulfillment_status` | Masalan: `pending`, `partial`, `complete` (yoki faqat miqdordan hisoblanadi) |

**Rezerv** (ixtiyoriy, murakkabroq):

- `qty_reserved` yoki alohida `order_reservations` jadvali.
- Qoida: `available ≈ on_hand - sum(active reserved)`.

---

## 4. Frontend (CRM) — bosqichlar

### Bosqich 0

- Ombor sahifasida **tushuntirish blokki**: bu yerda CRM qoldig‘i; fizik sanashdan keyin yangilang.
- Jadvalda narx: **`sale_price`** (fallback `price`).
- `stock` `null` bo‘lsa — `0` deb ko‘rsatish va yangilashda xatolikni boshqarish.

### Bosqich 1 — Inventarizatsiya

- Tugma: **“Inventarizatsiya”**.
- Ro‘yxat: mahsulot + **yangi hisoblangan miqdor** (input).
- **Tasdiqlash** → har bir `products.stock` yangilanadi; keyinroq — `stock_movements` + `inventory_sessions` yozuvlari.

### Bosqich 2 — Kirim / chiqim (ixtiyoriy)

- Oddiy forma: mahsulot, miqdor, sabab, izoh → `delta` bilan ledger + `stock` yangilanishi.

### Bosqich 3 — Buyurtmalar

- Qator tahriridagi UI: **tayyor miqdor**, holat yoki progress.
- Ro‘yxat filtrlari: “ombor yetmaydi”, “qisman tayyor”.
- **Qachon `stock` kamayadi** — biznes qoidasi (masalan: status `Tugallandi` yoki “jo‘natildi”) — bitta joyda dokumentatsiya qilinadi va kod shunga bog‘lanadi.

### Tarjimalar

- `translations.js` — yangi kalitlar: inventarizatsiya, tayyor miqdor, holatlar, ombor izohi.

---

## 5. Tekshiruv ro‘yxati (har bosqichdan keyin)

- [ ] Yangi mahsulot: boshlang‘ich `stock` = 0 yoki kiritilgan default.
- [ ] Inventarizatsiyadan keyin jadval va (bo‘lsa) ledger mos.
- [ ] Buyurtmada miqdor > mavjud qoldiq — ogohlantirish saqlanadi yoki rezerv bilan aniqroq bo‘ladi.
- [ ] Moliya / `sale_out` bilan ombor qaytarish logikasi buzilmaydi (mavjud `restoreSaleOutStockFromLines` va hokazo).

---

## 6. Ketma-ketlik xulosasi

| # | Vazifa | Qisqa natija |
|---|--------|----------------|
| 0 | Skema: `stock`, `min_stock`; ombor UI: izoh + `sale_price` | Xavfsiz ko‘rinish, xatolar kamayadi |
| 1 | Inventarizatsiya modali + (ixtiyoriy) `stock_movements` | Korxona → CRM rasmiy oqim |
| 2 | `order_items` tayyorlik maydonlari + buyurtma UI | Qisman / to‘liq reja |
| 3 | Rezerv qoidalari + filtrlar | Ombor va buyurtma aniqligi |

---

## 7. Bog‘liq fayllar (loyihada)

- CRM: `src/app/ombor/page.js`, `src/app/mahsulotlar/page.js`, `src/app/buyurtmalar/page.js`
- Moliya: `src/app/moliya/boshqaruv/page.js` (`products.stock` yangilanishi)
- SQL: `update_products_schema.sql`, `supabase_fresh_install_complete.sql` (namuna skema)

---

*Hujjat versiyasi: 1.0 — reja; implementatsiya bosqichlari alohida commit/PR lar bilan olib boriladi.*
