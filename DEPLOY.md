# Deploy qo'llanmasi (Vercel)

Bu repoda 2 ta alohida loyiha bor. Har birini **alohida Vercel proyekti** sifatida deploy qilishingiz kerak.

---

## 1. E-commerce (do‘kon vebsayti)

### Vercel da yangi proyekt

1. [vercel.com](https://vercel.com) → Add New Project
2. Git reponi ulang (GitHub/GitLab/Bitbucket)
3. **Root Directory:** `./` (bo‘sh qoldiring – root)
4. **Framework Preset:** Create React App (avtomatik tanlansa)
5. **Build Command:** `npm run build` (default)
6. **Output Directory:** `build` (default)

### Environment Variables (majburiy)

Vercel → Project → Settings → Environment Variables:

| Nom                      | Qiymat                          |
|--------------------------|---------------------------------|
| `REACT_APP_SUPABASE_URL` | `https://xxx.supabase.co`       |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anon key      |
| `REACT_APP_ADMIN_EMAILS` | `admin@example.com` (ixtiyoriy) |

### Deploy

Deploy tugmasini bosing yoki `git push` qiling.

---

## 2. CRM (boshqaruv paneli)

### Vercel da yangi proyekt

1. [vercel.com](https://vercel.com) → Add New Project
2. **Xuddi shu** Git reponi tanlang
3. **Root Directory:** `CRM-tizimi--master/CRM-tizimi--master` (muhim)
4. **Framework Preset:** Next.js (avtomatik tanlansa)
5. **Build Command:** `npm run build` (default)

### Environment Variables (majburiy)

| Nom                           | Qiymat                     |
|-------------------------------|-----------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`    | `https://xxx.supabase.co`   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key        |

### Deploy

Deploy tugmasini bosing yoki `git push` qiling.

---

## Xato bo‘lsa

### E-commerce

- **Build xato:** Vercel loglarini tekshiring. `REACT_APP_SUPABASE_URL` va `REACT_APP_SUPABASE_ANON_KEY` qo‘shilganligini tekshiring.
- **404:** SPA routing uchun `vercel.json` da `rewrites` bor – qayta deploy qiling.

### CRM

- **Root Directory:** `CRM-tizimi--master/CRM-tizimi--master` bo‘lishi kerak.
- **Build xato:** `NEXT_PUBLIC_` bilan boshlanuvchi o‘zgaruvchilar qo‘shilganligini tekshiring.

### Umumiy

- `.env` fayllar Git ga commit qilinmaydi – qiymatlarni Vercel Environment Variables orqali berishingiz kerak.
- Birinchi marta deploy 2–5 daqiqa vaqt olishi mumkin.
