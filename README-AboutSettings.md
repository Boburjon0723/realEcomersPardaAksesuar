# About sahifasi header rasmini boshqarish (CRM)

CRM da **Web sayt sozlamalari** sahifasida About sahifasi header rasmini o'zgartirish imkoniyati qo'shildi.

## Qo'shilgan fayllar

1. **src/services/supabase/settings.js** – `uploadAboutHeroImage(file)` funksiyasi qo'shildi
2. **src/components/admin/AboutSettingsSection.jsx** – CRM uchun boshqaruv komponenti

## CRM ga qo'shish

Web sayt sozlamalari sahifangizda `AboutSettingsSection` komponentini import qilib ishlating:

```jsx
import AboutSettingsSection from '@/components/admin/AboutSettingsSection';
// yoki
import AboutSettingsSection from '../components/admin/AboutSettingsSection';

// Sahifa/tab ichida:
<AboutSettingsSection lang="uz" onSuccess={() => console.log('Yangilandi')} />
```

## Imkoniyatlar

- **Rasm yuklash** – yangi rasm faylni tanlash va yuklash (Supabase Storage)
- **URL orqali** – tashqi URL kiritish va saqlash
- **Preview** – hozirgi rasm ko‘rinishi

## Ma'lumotlar bazasi

`settings` jadvalida `about_hero_image` ustuni bo‘lishi kerak. Agar yo‘q bo‘lsa, `add_about_settings.sql` migratsiyasini ishga tushiring.

## Storage (rasm yuklash uchun)

Rasm yuklash uchun Supabase da `settings` bucket yaratilishi kerak. `setup_settings_storage.sql` migratsiyasini SQL Editor da ishga tushiring. Agar `settings` bucket bo‘lmasa, kod avtomatik ravishda `products` bucket dan foydalanadi.
