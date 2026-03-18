# Rang boshqaruvi - Ko'p tilli nomlar (UZ/RU/EN)

Boshqaruv panelida yangi rang qo'shganda O'zbekcha, Ruscha, Inglizcha nomlarni kiritish imkoniyati qo'shildi.

## 📋 O'zgarishlar

### 1. Ma'lumotlar bazasi migratsiyasi

Supabase SQL Editor da `add_product_colors_multilingual.sql` faylini ishlating:

```sql
-- product_colors jadvaliga name_uz, name_ru, name_en ustunlari qo'shiladi
```

### 2. Yangi API funksiyalari (`src/services/supabase/products.js`)

- **getAllColors()** – name_uz, name_ru, name_en qaytaradi
- **addColor({ name_uz, name_ru, name_en, hex_code })** – yangi rang qo'shish
- **updateColor(id, { name_uz, name_ru, name_en, hex_code })** – rangni tahrirlash
- **deleteColor(id)** – rangni o'chirish

### 3. ColorManagement komponenti

`src/components/admin/ColorManagement.jsx` – CRM boshqaruv paneliga qo'shiladigan komponent.

**CRM-tizimi--master da ishlatish:**

```jsx
// CRM loyihangizda (masalan, products yoki settings bo'limida)
import ColorManagement from '../../../techgear-ecommerce/src/components/admin/ColorManagement';

// Sahifa yoki tab ichida:
<ColorManagement lang="uz" />
```

Yoki CRM `src` papkasiga nusxalab:

```bash
cp techgear-ecommerce/src/components/admin/ColorManagement.jsx CRM-tizimi--master/CRM-tizimi--master/src/components/
cp techgear-ecommerce/src/services/supabase/products.js  # addColor, updateColor, deleteColor uchun
```

**Import talablari:** `getAllColors`, `addColor`, `updateColor`, `deleteColor` – ular `products.js` dan import qilinadi. CRM loyihangizda Supabase client sozlangan bo'lishi kerak.

### 4. Tarjima mantiqi

`LanguageContext` da `translateColor()` endi avval `product_colors` jadvalidagi `name_uz`, `name_ru`, `name_en` dan o'qiydi. Agar rang DB da topilmasa, `translations.js` dan qidiradi.

## 🎯 Yangi rang qo'shish forma

- **Nom (O'zbekcha)** – mahsulot ranglari ro'yxatida O'zbekcha ko'rinadi
- **Nom (Ruscha)** – Rus tilida
- **Nom (Inglizcha)** – Ingliz tilida
- **Hex kodi** – rang uchun hex qiymat (#000000) yoki color picker

Kamida bitta til uchun nom kiritish majburiy.
