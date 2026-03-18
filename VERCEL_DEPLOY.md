# Vercel deploy – E-commerce va CRM

**2 ta alohida repo:**
- **E-commerce:** `realEcomersPardaAksesuar` – asosiy sayt
- **CRM:** `CRM-tizimi-` – boshqaruv paneli: https://github.com/Boburjon0723/CRM-tizimi-.git

---

## 1. E-commerce (asosiy sayt)

### 1.1 Repo ulash
1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Repo: `Boburjon0723/realEcomersPardaAksesuar`
3. **Root Directory** bo'sh qoldiring (root tanlangan bo'lsin)
4. **Import**

### 1.2 Environment variables
| Name | Value |
|------|-------|
| `REACT_APP_SUPABASE_URL` | Supabase URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anon key |

### 1.3 Deploy
**Deploy** tugmasini bosing.

---

## 2. CRM (boshqaruv paneli)

### 2.1 Yangi loyiha
1. **Add New** → **Project**
2. Repo: `Boburjon0723/CRM-tizimi-` (alohida CRM repo)
3. **Root Directory** bo'sh qoldiring
4. **Import**

### 2.2 Environment variables
| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

(CRM Next.js ishlatadi, shuning uchun `NEXT_PUBLIC_` prefiksi kerak.)

### 2.3 Deploy
**Deploy** tugmasini bosing.

---

## 3. O'zgarishlarni yuborish

- **E-commerce** o'zgartirsa: `realEcomersPardaAksesuar` repoga push
- **CRM** o'zgartirsa: `CRM-tizimi-` repoga push (lokaldagi `CRM-tizimi--master/CRM-tizimi--master/` papkadagi fayllar)

## 4. Avtomatik deploy
Har bir `git push origin master` dan keyin tegishli Vercel loyihasi avtomatik yangilanadi.
