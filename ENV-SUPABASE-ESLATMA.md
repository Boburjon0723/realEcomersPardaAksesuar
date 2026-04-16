# Supabase sozlash — eslatma (o‘zgartirish talab qilmaydi)

Bu fayl faqat **qaysi o‘zgaruvchilar qayerda** ekanini eslab qolish uchun. Kod yoki mavjud `.env.example` larni o‘zgartirish shart emas.

## Umumiy qoida

Veb-do‘kon (React) va CRM (Next.js) **bir-biri bilan alohida HTTP API orqali emas**, **bir xil Supabase loyihasiga** ulanadi. Shuning uchun **URL va anon kalit qiymatlari bir xil bo‘lishi kerak** — faqat **o‘zgaruvchi nomlari boshqacha**.

## Qayerda nima

| Qayer | Fayl | O‘zgaruvchilar |
|--------|------|----------------|
| Veb-do‘kon (ildizdagi React) | `.env.local` yoki hosting panel | `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY` |
| CRM | `CRM-tizimi--master/CRM-tizimi--master/.env.local` yoki Vercel | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Telegram moliya boti | `telegram-finance-bot/.env` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` (bot uchun service role ham bo‘lishi mumkin — botning `.env.example` ga qarang) |

**Xato:** faqat bitta joydagi nomlarni to‘ldirib, ikkinchi ilovani unutish — bitta tomonda “bazaga ulanmayapti” ko‘rinadi.

## Yangi muhit / yangi kompyuter checklist

1. Supabase loyihasidan **Project URL** va **anon (public) key** ni oling.
2. React do‘kon: `REACT_APP_SUPABASE_*` juftini qo‘ying.
3. CRM: `NEXT_PUBLIC_SUPABASE_*` juftini **shu bilan bir xil qiymatlar** bilan qo‘ying.
4. Ikkalasini ham qayta build / qayta ishga tushiring.

## Boshqa

- `README-CRM-Integration.md` ichidagi REST API / TechGear sxemasi loyihaning asosiy yo‘li (Supabase) bilan to‘liq mos kelmasligi mumkin — asosiy ishonch manbai: yuqoridagi juftlar va Supabase Dashboard.
- CRM `output: 'export'` — serverda o‘z API yo‘q; barcha so‘rovlar klientdan Supabase ga. Production xavfsizligi uchun RLS va kalitlar siyosatini Supabase tomonda tekshiring.
