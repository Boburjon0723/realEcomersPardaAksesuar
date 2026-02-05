# TechGear E-commerce CRM Integration Guide

Bu qo'llanma TechGear e-commerce saytini boshqarish komponentini sizning CRM tizimingizga qanday integratsiya qilishni ko'rsatadi.

## 📁 Fayllar

Quyidagi fayllar yaratildi:

1. **techgear-api.js** - Backend API bilan bog'lanish uchun service
2. **TechGearManagement.jsx** - Asosiy boshqaruv komponenti
3. **README-CRM-Integration.md** - Bu qo'llanma

## 🚀 Integratsiya Bosqichlari

### 1. Fayllarni CRM tizimiga ko'chirish

```bash
# Fayllarni CRM loyihangizdagi kerakli papkaga ko'chiring
# Masalan:
cp techgear-api.js /path/to/your-crm/src/services/
cp TechGearManagement.jsx /path/to/your-crm/src/components/
```

### 2. API Endpoint Sozlash

`techgear-api.js` faylida API manzilini o'zgartiring:

```javascript
const API_BASE_URL = 'https://your-backend-api.com/api';
// Bu yerga TechGear backend API manzilini kiriting
```

### 3. CRM Tizimiga Qo'shish

CRM tizimingizda yangi sahifa yoki tab yarating:

```jsx
// CRM tizimingizda (masalan, App.jsx yoki Routes.jsx)
import TechGearManagement from './components/TechGearManagement';

function CRMApp() {
  return (
    <div>
      {/* Boshqa CRM komponentlari */}
      
      {/* TechGear boshqaruv sahifasi */}
      <Route path="/techgear" element={<TechGearManagement />} />
    </div>
  );
}
```

### 4. Autentifikatsiya Token

API so'rovlari uchun CRM tokenini saqlang:

```javascript
// Login qilganda
localStorage.setItem('crm_token', 'your-auth-token');

// techgear-api.js avtomatik ravishda bu tokenni ishlatadi
```

## 🔧 Backend API Talablari

Backend API quyidagi endpointlarni qo'llab-quvvatlashi kerak:

### Mahsulotlar (Products)
- `GET /api/products` - Barcha mahsulotlar
- `GET /api/products/:id` - Bitta mahsulot
- `POST /api/products` - Yangi mahsulot
- `PUT /api/products/:id` - Mahsulotni yangilash
- `DELETE /api/products/:id` - Mahsulotni o'chirish
- `POST /api/products/:id/image` - Rasm yuklash

### Buyurtmalar (Orders)
- `GET /api/orders` - Barcha buyurtmalar
- `GET /api/orders/:id` - Bitta buyurtma
- `PATCH /api/orders/:id/status` - Status yangilash
- `DELETE /api/orders/:id` - Buyurtmani o'chirish
- `GET /api/orders/stats` - Statistika

### Foydalanuvchilar (Users)
- `GET /api/users` - Barcha foydalanuvchilar
- `GET /api/users/:id` - Bitta foydalanuvchi
- `PUT /api/users/:id` - Foydalanuvchini yangilash
- `DELETE /api/users/:id` - Foydalanuvchini o'chirish
- `GET /api/users/:id/orders` - Foydalanuvchi buyurtmalari

### Statistika (Analytics)
- `GET /api/analytics/dashboard` - Dashboard ma'lumotlari
- `GET /api/analytics/sales` - Savdo statistikasi
- `GET /api/analytics/top-products` - Top mahsulotlar
- `GET /api/analytics/users` - Foydalanuvchilar statistikasi

### Kategoriyalar (Categories)
- `GET /api/categories` - Barcha kategoriyalar
- `POST /api/categories` - Yangi kategoriya
- `PUT /api/categories/:id` - Kategoriyani yangilash
- `DELETE /api/categories/:id` - Kategoriyani o'chirish

## 📊 API Response Formatlari

### Dashboard Response
```json
{
  "totalProducts": 156,
  "totalOrders": 89,
  "totalUsers": 1234,
  "totalRevenue": 45000000,
  "recentOrders": [
    {
      "id": "ORD-001",
      "customerName": "Ali Valiyev",
      "total": 250000,
      "date": "2025-12-18"
    }
  ]
}
```

### Product Response
```json
{
  "id": "PROD-001",
  "name": "Parda halqasi",
  "category": "Aksessuarlar",
  "price": 15000,
  "stock": 100,
  "image": "https://example.com/image.jpg",
  "description": "Mahsulot tavsifi"
}
```

### Order Response
```json
{
  "id": "ORD-001",
  "customerName": "Ali Valiyev",
  "customerEmail": "ali@example.com",
  "customerPhone": "+998901234567",
  "total": 250000,
  "status": "pending",
  "date": "2025-12-18T10:30:00Z",
  "items": [
    {
      "productId": "PROD-001",
      "productName": "Parda halqasi",
      "quantity": 2,
      "price": 15000
    }
  ]
}
```

## 🎨 Styling

Komponent Tailwind CSS ishlatadi. CRM tizimingizda Tailwind CSS o'rnatilganligiga ishonch hosil qiling:

```bash
npm install -D tailwindcss
```

Agar boshqa CSS framework ishlatayotgan bo'lsangiz, komponentdagi classlarni o'zgartirishingiz kerak.

## 🔐 Xavfsizlik

1. **CORS**: Backend API CORS sozlamalarini to'g'ri sozlang
2. **Authentication**: Har bir so'rovda Bearer token yuboriladi
3. **Validation**: Backend validatsiyani amalga oshiring
4. **Rate Limiting**: API rate limiting qo'shing

## 🛠️ Customization

### Ranglarni o'zgartirish

```jsx
// TechGearManagement.jsx da
const colorClasses = {
  blue: 'bg-blue-500',    // O'zingizning ranglaringizga o'zgartiring
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};
```

### Yangi funksiyalar qo'shish

```jsx
// techgear-api.js ga yangi endpoint qo'shish
export const customAPI = {
  customEndpoint: async () => {
    return await apiRequest('/custom-endpoint');
  },
};
```

## 📝 Misol: To'liq integratsiya

```jsx
// CRM tizimingizda (masalan, src/App.jsx)
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TechGearManagement from './components/TechGearManagement';
import CRMDashboard from './components/CRMDashboard';
import CRMSidebar from './components/CRMSidebar';

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <CRMSidebar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<CRMDashboard />} />
            <Route path="/techgear" element={<TechGearManagement />} />
            {/* Boshqa routelar */}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

## 🐛 Debugging

Agar muammolar yuzaga kelsa:

1. Browser console'ni tekshiring
2. Network tab'da API so'rovlarini ko'ring
3. Backend loglarni tekshiring
4. API_BASE_URL to'g'ri sozlanganligini tekshiring
5. Token to'g'ri saqlanganligini tekshiring

```javascript
// Debug uchun
console.log('API Base URL:', API_BASE_URL);
console.log('Token:', localStorage.getItem('crm_token'));
```

## 📞 Yordam

Agar qo'shimcha yordam kerak bo'lsa:
- Backend API dokumentatsiyasini yarating
- API testlarini yozing
- Error handling'ni yaxshilang

## ✅ Checklist

- [ ] Fayllarni CRM tizimiga ko'chirdim
- [ ] API_BASE_URL ni to'g'ri sozladim
- [ ] Backend API endpointlarini yaratdim
- [ ] Autentifikatsiya tokenini sozladim
- [ ] Tailwind CSS o'rnatdim
- [ ] Komponentni CRM routing'ga qo'shdim
- [ ] Test qildim va ishlayapti

---

**Muvaffaqiyatlar!** 🚀
