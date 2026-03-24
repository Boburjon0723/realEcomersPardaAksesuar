# Loyiha sozlash va ishga tushirish yo‘riqnomasi

Bu hujjat loyihada qo‘shilgan funksiyalar uchun **nima qilish kerakligini** bosqichma-bosqich ko‘rsatadi. Barcha qadamlarni bajarib, keyin saytni tekshiring.

---

## 1. Umumiy: `.env` (React)

Loyiha ildizida `.env` fayli bo‘lishi kerak (`.env.example` bo‘lsa, nusxa oling).

| O‘zgaruvchi | Majburiy | Tavsif |
|-------------|----------|--------|
| `REACT_APP_SUPABASE_URL` | Ha | Supabase loyiha URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Ha | Supabase anon (public) kalit |
| `REACT_APP_CONTACT_MAP_EMBED_URL` | Yo‘q | Aloqa sahifasidagi xarita uchun **to‘liq iframe `src`** (masalan Yandex/Google embed havolasi). Bo‘lmasa, quyidagi `settings` maydonlari ishlatiladi. |
| `REACT_APP_PASSWORD_RESET_REDIRECT` | Yo‘q | Hozircha kodda ishlatilmaydi; parol tiklash `redirectTo` sifatida **`window.location.origin + '/'`** ishlatiladi. |

`.env` o‘zgargandan keyin dev serverni qayta ishga tushiring: `npm start`.

---

## 2. Aloqa sahifasi — xarita (Contact)

### 2.1. Kodda nima bo‘lgani

- Xarita endi **statik rasm emas**: `settings` dan kelgan ma’lumot yoki `.env` dagi embed URL ishlatiladi.
- Mantiq: `src/utils/contactMap.js` (embed URL qurish).

### 2.2. Siz nima qilishingiz kerak

**Variant A — Supabase `settings` jadvali (tavsiya etiladi)**

1. Supabase → **Table Editor** → `settings` (yoki CRM orqali).
2. Quyidagilardan **kamida bittasini** to‘ldiring:
   - **`latitude`** va **`longitude`** — aniq nuqta (masalan Toshkent markazi: `41.2995`, `69.2401`).
   - Yoki faqat **`address`** — to‘liq manzil matni (xarita manzil bo‘yicha ochiladi).
3. Sahifani yangilab tekshiring: **Aloqa** → xarita blokida iframe yoki manzil bo‘yicha xarita.

**Variant B — Tashqi embed (Yandex / Google Maps HTML)**

1. Xarita xizmatidan **embed** kodidagi `src="..."` qiymatini oling.
2. `.env` ga qo‘shing:
   ```env
   REACT_APP_CONTACT_MAP_EMBED_URL=https://...
   ```
3. Qayta build / dev restart.

**Hech narsa kiritilmasa**

- Placeholder rasm va matn ko‘rinadi (`contactMapFallback` tarjimasi).
- Pastda **«Xaritada ochish»** havolasi — faqat manzil yoki koordinata bo‘lsa ishlaydi.

---

## 3. Kirish — «Parolni unutdingizmi?» va email orqali tiklash

### 3.1. Kodda nima bo‘lgani

- Kirish oynasida tugma bosilganda **parolni tiklash** rejimi ochiladi, emailga havola yuboriladi (`resetPasswordForEmail`).
- Pochtadagi havola orqali kirganda **`PASSWORD_RECOVERY`** hodisasi bilan **yangi parol** kiritish oynasi ochiladi.

### 3.2. Supabase Dashboard — majburiy sozlamalar

1. **Authentication** → **URL Configuration**
   - **Site URL**: production manzilingiz, masalan `https://sizning-domen.uz`
   - **Redirect URLs**: shu domenni qo‘shing, masalan:
     - `https://sizning-domen.uz`
     - `https://sizning-domen.uz/**` (kerak bo‘lsa)
   - Lokal test: `http://localhost:3000` ham qo‘shishingiz mumkin.

2. **Authentication** → **Providers** → **Email** yoqilgan bo‘lsin.

3. **Authentication** → **Email Templates** → **Reset password** shabloni yoqilgan va jo‘natuvchi sozlangan bo‘lsin (Supabase default ishlashi mumkin).

### 3.3. Tekshiruv

1. Saytda **Kirish** → **Parolni unutdingizmi?** → haqiqiy ro‘yxatdan o‘tgan email.
2. Pochtada **tiklash havolasini** oching — sayt ochilishi va **yangi parol** kiritish oynasi chiqishi kerak.
3. Agar havola ochilmasa yoki xato bersa: **Redirect URLs** va **Site URL** ni qayta tekshiring.

---

## 4. Checkout — O‘zbekiston yetkazib berish (viloyat / shahar)

### 4.1. Kodda nima bo‘lgani

- `src/data/uzbekistanDelivery.js` — viloyatlar va shaharlar ro‘yxati.
- `CheckoutPage` — foydalanuvchi `country` **O‘zbekiston** bo‘lsa: viloyat → shahar/tuman; **Boshqa (qo‘lda)** variantlari.
- Buyurtma manzili `buildDeliveryAddressLine()` orqali bir qatorga yig‘iladi.

### 4.2. Siz nima qilishingiz kerak

- Foydalanuvchi profilida **`country`** to‘g‘ri saqlanishi kerak (masalan `uzbekistan`), aks holda UI boshqa davlat rejimida bo‘lishi mumkin.
- Kerak bo‘lsa, `uzbekistanDelivery.js` ichidagi shahar nomlarini va tarjimalarni (`translations.js`) loyiha tili bo‘yicha to‘ldiring.

---

## 5. Ishlab chiqarish (production) tekshiruv ro‘yxati

- [ ] `.env` production uchun to‘g‘ri (Supabase URL/anon key).
- [ ] `npm run build` xatosiz tugaydi.
- [ ] Aloqa sahifasida xarita yoki placeholder mantiqiy ishlaydi.
- [ ] Supabase **Redirect URLs** production domenni qamrab oladi.
- [ ] Parol tiklash emaili keladi va havola saytni ochadi, yangi parol saqlanadi.

---

## 6. Tez havola: fayllar

| Mavzu | Asosiy fayl |
|-------|-------------|
| Xarita URL | `src/utils/contactMap.js` |
| Aloqa UI | `src/pages/ContactPage.jsx` |
| Parol tiklash API | `src/services/supabase/auth.js` |
| Kirish / tiklash UI | `src/components/auth/AuthModal.jsx` |
| Tiklashdan keyin modal | `src/App.jsx` + `src/contexts/AppContext.jsx` |
| Checkout manzil | `src/pages/CheckoutPage.jsx`, `src/data/uzbekistanDelivery.js` |

---

*Oxirgi yangilanish: loyiha ichidagi funksiyalar bilan mos kelishi uchun ushbu faylni yangi funksiya qo‘shilganda yangilab turing.*
