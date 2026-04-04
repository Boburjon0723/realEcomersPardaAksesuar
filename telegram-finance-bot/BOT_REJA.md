# Telegram Bot + CRM Moliya Reja

## 1) Asosiy maqsad
- Telegram bot orqali foydalanuvchi telefon raqam bilan kiradi.
- CRMda ruxsat berilgan foydalanuvchi bo'lsa davom etadi, aks holda `reject`.
- Botda bo'limlar: `Moliya`, `Xodimlar`.
- `Moliya` oqimi CRMdagi mavjud moliya ustunlari/jadvallari bilan ishlaydi.

## 2) Kerakli oqim (MVP)
1. `/start`
2. `Telefon raqamni kiriting`
3. CRM `users.phone` bo'yicha tekshiruv
4. Menyu: `Moliya | Xodimlar`
5. `Moliya` tanlanganda:
   - `departments` ro'yxati chiqadi
   - bo'lim tanlanadi
   - material nomi yoziladi (yoki mavjud nom)
   - miqdor va summa kiritiladi
   - izoh kiritiladi
6. Saqlash:
   - `raw_materials` (mavjud bo'lmasa yaratish)
   - `material_movements` ga yozish
   - `note` ichida audit: user ismi + telefoni

## 3) CRM bilan bog'lanish (jadval/ustunlar)
- `departments`: bo'lim tanlash uchun
- `raw_materials`: materialni topish/yaratish uchun
- `material_movements`: xarajat yozuvi uchun
  - `department_id`
  - `raw_material_id`
  - `quantity`
  - `total_cost`
  - `unit_price_snapshot`
  - `movement_date`
  - `note` (user audit bilan)

## 4) Xavfsizlik
- Bot backend `SUPABASE_SERVICE_ROLE_KEY` bilan ishlaydi (faqat serverda saqlanadi).
- Telegram userning telefoni CRMdagi ruxsatlar bilan tekshiriladi.
- Har bir yozuvga kim yuborgani (`ism`, `tel`) audit sifatida saqlanadi.

## 5) Xodimlar (bot)
1. `Xodimlar` — har bir xodim uchun shu oy **avans jami** matnda; reply-menyuda tugmalar (2 ustun), yoki 1–N raqam.
2. Tanlangan xodim: CRM **maosh+bonus**, avanslar (sana bo'yicha ro'yxat), shu oy **oylik to'lovlari** ro'yxati.
3. Tugmalar: `Avans kiritish` | `Oylik berish` (bir qatorda), `Ro'yxat`, `Orqaga`.
4. `Avans kiritish` → summa → izoh → `employee_advances`.
5. `Oylik berish` → summa → izoh → `employee_salary_payments`.
6. CRM **Xodimlar**: **Shu oy avansi** (`employee_advances`), **Shu oy oylik** (`employee_salary_payments`, sana + summa), holat nishoni (kutilmoqda / qisman / to'langan), banknota tugmasi bilan CRM dan oylik yozish.

SQL (Supabase): `add_employee_advances.sql` va `add_employee_salary_payments.sql`.

## 6) Keyingi bosqichlar
- Telefon verifikatsiyani Telegram contact share bilan mustahkamlash.
- Sessionni Redis/DB ga ko'chirish (restartga chidamli).
- Department tree bo'yicha child bo'lim tanlash UXni yaxshilash.
- Bot va CRM uchun `bot_user_id` alohida ustun qo'shish (auditni kuchaytirish).

## 7) Ishga tushirish
`telegram-finance-bot/index.js` skelet tayyor.

Token olganingizdan keyin:
1. `telegram-finance-bot/.env` yarating.
2. Quyidagilarni kiriting:
   - `BOT_TOKEN=...`
   - `SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
3. Dependenciyalar:
   - `npm i node-telegram-bot-api @supabase/supabase-js dotenv`
4. Ishga tushirish:
   - `node telegram-finance-bot/index.js`
