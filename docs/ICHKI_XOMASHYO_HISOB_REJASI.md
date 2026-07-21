# Ichki xomashyo va yarim tayyor hisob-kitob — reja

**Maqsad:** Tayyor mahsulot omboridan tashqari, ishlab chiqarishda ketadigan **xomashyo**, **rang**, **mayda detallar** va **yarim tayyor** qoldiqlarini CRMda aniq hisoblash.

**Bugungi sana:** 2026-07-18  
**Loyiha:** CRM (`CRM-tizimi-`) + umumiy Supabase

---

## 1. Hozirgi holat (qisqa)

### 1.1. Asosiy farq (siz aytgan muammo)

| | Moliya (hozir) | Kerak (yangi) |
|--|----------------|---------------|
| **Narx** | Bor (`unit_price`, summa, hamkor balansi) | Saqlanadi |
| **Miqdor** | Yo‘q yoki ishlatilmaydi | **Qancha keldi / qancha ketdi / qancha qoldi** |
| **Jurnal** | Pul operatsiyasi | Harakatlar: kirim, chiqim, tuzatish |

**Misollar:**

- Rang: litrda **necha litr omborda**, necha litr kirdi, necha litr mahsulotga ketdi
- Mexanizm / furnitura: **necha dona** qoldi
- Yarim tayyor: **necha to‘plam** tayyor turibdi

Moliya «qancha so‘m / dollar» deb yuritadi. Ichki ombor «qancha birlik» deb yuritadi. Ikkalasi birga kerak, lekin **birinchi navbatda miqdor hisobi**.

### 1.2. Nima bor / yo‘q

| Nima bor | Qayerda | Cheklov |
|----------|---------|---------|
| Tayyor mahsulot qoldig‘i | Ombor → `product_inventory` + `stock_movements` | Faqat sotiladigan SKU |
| Buyurtma bo‘yicha chiqim | `inventoryService` (status = completed) | Faqat tayyor mahsulot |
| Xomashyo **narxi** | Moliya → Bo‘limlar / Hamkorlar | Summa va balans |
| `raw_materials` | Moliya | Asosan xarajat yorlig‘i; **miqdor ombori yo‘q** |
| Hamkor «Xomashyo kirimi» | Moliya → Hamkorlar | Pul/balans; «necha litr kirdi» hisobi yo‘q |

**Yo‘q (miqdor tomoni):**

- Xomashyo bo‘yicha **joriydagi qoldiq** (necha litr / dona)
- **Kirim / chiqim / qoldiq** jurnali
- Mahsulot ↔ xomashyo bog‘lanishi (**BOM / retsept**)
- «Mahsulot tayyorlandi» → avtomatik xomashyo chiqimi
- Rang, ip, furnitura uchun Ombor UI

---

## 2. Taklif — 3 qatlamli ichki ombor

Oddiy va amaliy model (pardа / aksesuar ishlab chiqarish uchun):

```
┌─────────────────┐     retsept (BOM)      ┌──────────────────┐
│  Xomashyo /     │ ─────────────────────► │  Tayyor mahsulot │
│  Yarim tayyor   │   N dona mahsulot      │  (Ombor SKU)     │
│  (ichki ombor)  │   = X litr rang + …    │                  │
└─────────────────┘                        └──────────────────┘
        ▲                                           │
        │ kirim (hamkor / ombordan)                 │ sotuv (buyurtma)
        │                                           ▼
   Moliya / Kirim                           stock_movements (sale)
```

### 2.1. Turlari (`item_kind`)

| Tur | Misollar | Hisob birligi |
|-----|----------|----------------|
| `raw` | Rang, lak, ip, mato, furnitura, qadoq | litr, kg, m, dona |
| `semi` | Bo‘yalgan detail, yig‘ilgan mexanizm | dona / to‘plam |
| `finished` | Mavjud Ombor SKU (`products`) | dona (hozirgi tizim) |

**Muhim:** Tayyor mahsulotni qayta ixtiro qilmaymiz — Ombor qoladi. Yangi qatlam faqat **ichki materiallar**.

### 2.2. Asosiy jarayonlar

1. **Kirim** — hamkordan / bo‘lim xarajatidan / qo‘lda inventar
2. **Retsept (BOM)** — «1 dona M-504 = 0.05 L rang + 2 dona mexanizm»
3. **Ishlab chiqarish / yig‘ish** — «10 dona M-504 tayyorlandi» → xomashyo avtomatik chiqadi, tayyor qoldiq +10
4. **Inventarizatsiya** — sanash va tuzatish (materiallar uchun)
5. **Hisobot** — qancha ketdi, qancha qoldi, past qoldiq ogohlantirish

---

## 3. Tavsiya etilgan bosqichlar

### Bosqich A — Miqdor ombori: keldi / ketdi / qoldi (1–2 hafta)

**Maqsad:** Har bir xomashyo uchun aniq ko‘rinadi:

| Ko‘rsatkich | Misol (rang) |
|-------------|--------------|
| **Keldi** | +20 L (hamkor / qo‘lda kirim) |
| **Ketdi** | −5 L (ishlatildi / chiqim) |
| **Qoldi** | 15 L (joriy ombor) |

Narx moliyada qoladi — bu bosqichda asosiy narsa **miqdor**.

**DB (yangi / kengaytirish):**

- `materials` (yoki mavjud `raw_materials` ni kengaytirish):
  - `name`, `unit` (l, kg, m, pcs), `sku` / kod
  - `item_kind`: `raw` | `semi`
  - `stock_quantity` (**joriy qoldiq**), `min_stock`, `track_stock` = **true**
  - `note`, `is_active`
  - narx ixtiyoriy (`unit_price`) — moliya bilan bog‘lash uchun
- `material_stock_movements` (miqdor jurnali):
  - `material_id`, `qty` (+ kirim, − chiqim)
  - `type`: `in` | `out` | `adjust` | `consume` | `produce_in`
  - `balance_after` (ixtiyoriy — harakatdan keyin qoldiq)
  - `ref_type` / `ref_id` (hamkor operatsiyasi, ishlab chiqarish)
  - `note`, `created_at`

**UI:** Ombor ichida tab yoki alohida bo‘lim:

- Ro‘yxat: nom | birlik | **qoldiq** | min | holat
- Tugmalar: **Kirim** (+), **Chiqim** (−), tuzatish
- Jurnal: sana | tur | miqdor | qoldiq | izoh
- Past qoldiq filtri, Excel export

**Moliya bog‘lash (minimal, keyinroq):** Hamkor «Xomashyo kirimi»da miqdor kiritilsa → avtomatik `in` harakati. Hozircha qo‘lda kirim ham yetarli.

---

### Bosqich B — Retsept (BOM) (1 hafta)

**Maqsad:** Har bir tayyor mahsulot uchun «nima ketadi» ni bir marta yozib qo‘yish.

**DB:**

- `product_bom`:
  - `product_id` → `products`
  - `material_id` → `materials`
  - `qty_per_unit` (1 dona mahsulotga ketadigan miqdor)
  - `note` (masalan: «faqat qora rang uchun» — keyinroq)

**UI:** Mahsulotlar sahifasida yoki Ombor da:

- Mahsulot tanlash → «Retsept» → qatorlar: material + miqdor
- Oddiy ko‘rinish: «M-504: Rang 0.05 L, Mexanizm 2 dona»

**Qoida:** Retsept bo‘lmasa — ishlab chiqarish tugmasi ishlamaydi yoki faqat ogohlantiradi.

---

### Bosqich C — Ishlab chiqarish (yig‘ish) hujjati (1–2 hafta)

**Maqsad:** Bitta amal bilan tayyor + va xomashyo −.

**DB:**

- `production_orders` (yoki sodda `production_runs`):
  - `product_id`, `qty`, `status` (`draft` | `done` | `cancelled`)
  - `produced_at`, `note`, `created_by` (ixtiyoriy)

**Oqim:**

1. Foydalanuvchi: mahsulot + miqdor (masalan 10)
2. Tizim retseptdan kerakli materiallarni hisoblaydi
3. Yetarli emas bo‘lsa — ro‘yxat ko‘rsatadi (bloklash yoki «baribir» — sozlama)
4. Tasdiqlash:
   - har bir material uchun `consume` harakati
   - `product_inventory` +N (mavjud Ombor logikasi)
   - `stock_movements` tip `restock` yoki yangi `production`

**Natija:** «10 dona M-504 tayyorlandi» → rang −0.5 L, mexanizm −20, omborda M-504 +10.

---

### Bosqich D — Hisobot va inventar (keyin)

- Materiallar bo‘yicha kirim/chiqim jurnal
- Oylik sarf (qaysi mahsulotga qancha ketdi)
- Past qoldiq ogohlantirish (dashboard / Ombor)
- Inventarizatsiya sessiyasi (sanash → farq → adjust) — tayyor va material uchun bir xil UX

---

## 4. Nima qilmaslik (hozircha)

| Taklif emas | Sabab |
|-------------|--------|
| To‘liq MRP / rejalashtirish | Murakkab; dastlab oddiy BOM + production yetarli |
| Har bir rang uchun alohida BOM majburiy | Keyinroq `color_key` qo‘shish mumkin |
| Xomashyoni saytda sotish | Ichki hisob; e-commerce ga tegmang |
| `products.stock` ga qaytish | Ombor allaqachon `product_inventory` da |

---

## 5. Arxitektura tanlovi (tavsiya)

**Tavsiya: mavjud `raw_materials` ni kengaytirish + yangi harakatlar jadvali**, alohida parallel katalog ochmaslik.

Sabab:

- Moliya bo‘limlari allaqachon `raw_materials` ishlatadi
- Bitta katalog — kam chalkashlik
- Kerak bo‘lsa `item_kind`, `min_stock`, `sku` ustunlarini qo‘shish yetarli

Agar moliya «faqat xarajat» va ombor «faqat zaxira» chalkashsa — keyinroq view yoki `materials` alias jadvali ochiladi.

---

## 6. UI joylashuvi (taklif)

```
Sidebar:
  Ombor
    ├─ Tayyor mahsulotlar   (mavjud page)
    ├─ Xomashyo / detallar  (yangi)
    └─ Ishlab chiqarish     (Bosqich C)
  Mahsulotlar
    └─ (kartochkada) Retsept tugmasi
```

Yoki bitta Ombor sahifasida **3 ta tab** — kamroq navigatsiya, tezroq ishlatish.

---

## 7. Misol (sizdagi senariy)

**Mahsulot:** M-504 (parda aksesuar)  
**Retsept (1 dona):**

| Material | Miqdor |
|----------|--------|
| Rang (qora) | 0.05 L |
| Mexanizm | 2 dona |
| Qadoq | 1 dona |

**Amal:** «20 dona tayyorlandi»

| Natija | O‘zgarish |
|--------|-----------|
| Rang | −1.0 L |
| Mexanizm | −40 |
| Qadoq | −20 |
| Ombor M-504 | +20 |

Buyurtma tugaganda — faqat M-504 chiqadi (hozirgi `inventoryService`); xomashyo allaqachon ishlab chiqarishda hisobdan tushgan.

---

## 8. Risklar va e’tibor

1. **Moliya `sale_out` hali `products.stock` ga yozishi mumkin** — Ombor `product_inventory` bilan moslashtirish (alohida texnik debt).
2. **RLS** — yangi jadvallar uchun `is_authenticated_user()` siyosati (mavjud hardening SQL uslubida).
3. **Birliklar** — litr / kg / dona aralashmasin; retseptda birlik material katalogidan olinadi.
4. **Dublikat nomlar** — materialga kod (`sku`) berish tavsiya.

---

## 9. Implementatsiya tartibi (qisqa checklist)

- [x] **A1** SQL: `raw_materials` kengaytirish + `material_stock_movements` (`add_material_stock_inventory.sql`)
- [x] **A2** UI: Ombor → Xomashyo tab (CRUD + kirim/chiqim/tuzatish + jurnal)
- [x] **A3** Past qoldiq (`min_stock`) filtri va Excel export
- [x] **B1** SQL: `product_bom` (`add_product_bom.sql`)
- [x] **B2** UI: Ombor → Retseptlar tab
- [x] **C1** SQL: `production_runs` (`add_production_runs.sql`)
- [x] **C2** UI: Ombor → Tayyorlash (material −, tayyor +)
- [x] **C3** Yetishmovchilik tekshiruvi (+ ixtiyoriy «baribir»)
- [ ] **D** Inventar + oy hisobotlari
- [ ] Hujjat: `DATABASE_SCHEMA.md` yangilash

---

## 10. Xulosa — nima qilishni tavsiya qilaman

Sizning gapingiz to‘g‘ri:

> Moliyada **narx** bor, lekin **qancha keldi / qancha ketdi / qancha qoldi** yo‘q.

Shuning uchun:

1. **Avval (A)** — xomashyo **miqdor ombori**: katalog + kirim/chiqim/qoldiq + jurnal  
2. **Keyin (B)** — retsept (BOM) — qaysi mahsulotga qancha ketadi  
3. **So‘ng (C)** — «Tayyorlash» — bitta amalda miqdor avtomatik chiqadi  
4. Narx/balans moliyada qoladi; kerak bo‘lsa keyin bog‘lanadi  

Bu yo‘l murakkab ERP emas, lekin asosiy teshikni yopadi: **rang va mayda detallar miqdorda hisobda bo‘ladi**.

---

## Keyingi qadam

**Bosqich A, B, C kodga qo‘shildi.** Supabase SQL Editor’da ketma-ket:

1. `add_material_stock_inventory.sql`
2. `add_product_bom.sql`
3. `add_production_runs.sql`

CRM → Ombor tablari:

| Tab | Vazifa |
|-----|--------|
| Tayyor mahsulotlar | Mavjud ombor |
| Xomashyo / detallar | Qoldiq: keldi / ketdi / qoldi |
| Retseptlar | 1 donaga nima ketadi |
| Tayyorlash | Retseptdan − material, + tayyor |

Keyin ixtiyoriy **Bosqich D** (hisobot / inventar).
