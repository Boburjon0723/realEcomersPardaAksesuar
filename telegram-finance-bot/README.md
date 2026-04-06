# Moliya Telegram bot (NuurHome CRM)

Telegram orqali moliya va xodimlar (avans / oylik) yozuvlari — Supabase bilan integratsiya.

Repozitoriya: [github.com/Boburjon0723/moliyanuurhome](https://github.com/Boburjon0723/moliyanuurhome)

## Ishga tushirish (lokal)

```bash
cp .env.example .env
# .env ni to'ldiring
npm install
npm start
```

## Railway da deploy

1. [Railway](https://railway.app) ga kiring → **New Project** → **Deploy from GitHub repo** → `Boburjon0723/moliyanuurhome` ni tanlang.
2. Loyiha sozlamalarida **Variables** (Environment):
   - `BOT_TOKEN` — [@BotFather](https://t.me/BotFather) dan olingan token
   - `SUPABASE_URL` — Supabase loyiha URL
   - `SUPABASE_SERVICE_ROLE_KEY` — **tavsiya** (server uchun; RLS dan tashqari to‘liq huquq)
   - `SUPABASE_ANON_KEY` — ixtiyoriy (service role bo‘lmasa)
   - `BOT_USERS_TABLE` — ixtiyoriy, default `bot_users`
3. **Settings → Deploy**: **Start Command** bo‘sh qoldiring yoki `npm start` (default).
4. **Root Directory**: repoda faqat bot fayllari bo‘lsa o‘zgartirish shart emas.
5. Deploy tugagach logda `Auth lookup table` qatori chiqishi kerak; bot **polling** rejimida ishlaydi — **port ochilmaydi**, Railway faqat jarayonni ushlab turadi.

> **Eslatma:** `SUPABASE_SERVICE_ROLE_KEY` ni hech qachon GitHubga commit qilmang — faqat Railway Variables da.

## Fayllar

| Fayl | Tavsif |
|------|---------|
| `index.js` | Bot mantiq |
| `create_bot_users_access.sql` | `bot_users` jadvali / RLS namunasi |
| `.env.example` | Kerakli o‘zgaruvchilar ro‘yxati |
