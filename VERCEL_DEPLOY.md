# Vercel deploy

## 1. Repo ulash
1. [vercel.com](https://vercel.com) ga kiring
2. **Add New** → **Project**
3. GitHub repo: `Boburjon0723/realEcomersPardaAksesuar` tanlang
4. **Import**

## 2. Environment variables
**Project Settings** → **Environment Variables** da qo'shing:

| Name | Value |
|------|-------|
| `REACT_APP_SUPABASE_URL` | Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anon (public) key |

`.env` faylidagi qiymatlarni kiriting. Boshqa ixtiyoriy: `REACT_APP_ADMIN_EMAILS` va hokazo.

## 3. Deploy
- **Deploy** tugmasini bosing
- Yoki: har bir `git push` dan keyin Vercel avtomatik yangilaydi

## 4. Custom domain (ixtiyoriy)
**Project Settings** → **Domains** orqali o'z domeningizni ulashing.
