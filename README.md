# apple_hamkor — Premium Smartphone Marketplace

> O'zbekistondagi eng premium Apple mahsulotlari platformasi

---

## 🚀 Ishga tushirish

### 1. Dependencies o'rnatish
```bash
npm install
```

### 2. Serverni ishga tushirish
```bash
node server.js
```

Sayt: `http://localhost:3000`

---

## 📁 Papka tuzilishi

```
apple_hamkor/
├── server.js              # Asosiy server
├── package.json
├── data/
│   └── products.json      # Mahsulotlar bazasi (avtomatik yaratiladi)
├── uploads/
│   └── phones/            # Yuklangan rasmlar
└── public/
    ├── index.html         # Asosiy sahifa
    ├── admin.html         # Admin panel
    ├── logo/
    │   └── logo.png       # ← Logotipingizni shu yerga qo'ying
    ├── css/
    │   ├── main.css
    │   └── admin.css
    └── js/
        ├── main.js
        └── admin.js
```

---

## 🖼️ Logo qo'shish

1. Logotip faylini `public/logo/logo.png` sifatida saqlang
2. Serverni restart qiling yoki shunchaki sahifani yangilang
3. Logo avtomatik ko'rinadi

**Qo'llab-quvvatlanadigan formatlar:** PNG, SVG, JPG, WEBP

---

## 🔐 Admin Panel

**URL:** `http://localhost:3000/admin`  
**Parol:** `admin2024`

### Imkoniyatlar:
- ✅ Mahsulot qo'shish (rasm bilan)
- ✅ Mahsulot tahrirlash
- ✅ Mahsulot o'chirish
- ✅ Narxni o'zgartirish
- ✅ Badge boshqaruvi
- ✅ Statistika

---

## 🌐 Ngrok bilan ishlatish

```bash
# 1. Ngrok o'rnating: https://ngrok.com
# 2. Server ishga tushiring
node server.js

# 3. Boshqa terminalda
ngrok http 3000
```

Ngrok URL'ni oling va ishlating. Barcha funksiyalar ishlaydi!

---

## 📱 Telegram

Saytdagi "Bog'lanish" tugmasi `@Odil_122` ga to'g'ridan-to'g'ri olib boradi.

---

## ⚙️ Konfiguratsiya

`server.js` da o'zgartirish mumkin:
```js
const PORT = 3000;              // Port
const ADMIN_PASSWORD = 'admin2024';  // Admin paroli
```

---

## 💡 Maslahat

Parolni o'zgartirish uchun `server.js` da `ADMIN_PASSWORD` konstantasini tahrirlang.
