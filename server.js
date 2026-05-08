/**
 * apple_hamkor - Premium Smartphone Marketplace
 * Server Entry Point
 */

const express = require('express');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
  secret: 'apple_hamkor_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// ─── File Upload Config ───────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'phones');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Data Layer (JSON-based) ──────────────────────────────────────────────────
const DB_PATH = path.join(__dirname, 'data', 'products.json');

function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) return { phones: [], nextId: 1 };
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch { return { phones: [], nextId: 1 }; }
}

function writeDB(data) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ─── Seed Demo Products if Empty ─────────────────────────────────────────────
function seedIfEmpty() {
  const db = readDB();
  if (db.phones.length === 0) {
    db.phones = [
      {
        id: 1, model: 'iPhone 15 Pro Max', color: 'Natural Titanium',
        storage: '256GB', price: 13999000, description: 'A17 Pro chip. Titanium design. 48MP ProRAW camera system.',
        image: null, badge: 'Bestseller', featured: true
      },
      {
        id: 2, model: 'iPhone 15 Pro', color: 'Black Titanium',
        storage: '128GB', price: 11499000, description: 'Pro-grade titanium. Action Button. USB-C with USB 3.',
        image: null, badge: 'Popular', featured: true
      },
      {
        id: 3, model: 'iPhone 15', color: 'Midnight',
        storage: '128GB', price: 9299000, description: 'Dynamic Island. 48MP main camera. All-day battery life.',
        image: null, badge: null, featured: false
      },
      {
        id: 4, model: 'iPhone 14 Pro Max', color: 'Deep Purple',
        storage: '256GB', price: 10999000, description: 'Always-On display. Dynamic Island. 48MP ProRAW.',
        image: null, badge: 'Sale', featured: false
      },
      {
        id: 5, model: 'iPhone 14', color: 'Starlight',
        storage: '128GB', price: 7999000, description: 'Crash Detection. Emergency SOS via satellite. A15 Bionic.',
        image: null, badge: null, featured: false
      },
      {
        id: 6, model: 'iPhone 13 Pro', color: 'Sierra Blue',
        storage: '256GB', price: 8499000, description: 'ProMotion 120Hz. Macro photography. Cinematic mode.',
        image: null, badge: null, featured: false
      }
    ];
    db.nextId = 7;
    writeDB(db);
  }
}
seedIfEmpty();

// ─── Admin Auth ───────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'admin2024';

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// ─── API Routes ───────────────────────────────────────────────────────────────

// Get all phones
app.get('/api/phones', (req, res) => {
  const db = readDB();
  res.json(db.phones);
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check admin status
app.get('/api/admin/check', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// Add phone (admin)
app.post('/api/admin/phones', requireAdmin, upload.single('image'), (req, res) => {
  const db = readDB();
  const { model, color, storage, price, description, badge, featured } = req.body;
  const phone = {
    id: db.nextId++,
    model, color, storage,
    price: parseInt(price),
    description,
    image: req.file ? `/uploads/phones/${req.file.filename}` : null,
    badge: badge || null,
    featured: featured === 'true'
  };
  db.phones.unshift(phone);
  writeDB(db);
  res.json({ success: true, phone });
});

// Update phone (admin)
app.put('/api/admin/phones/:id', requireAdmin, upload.single('image'), (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const idx = db.phones.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const { model, color, storage, price, description, badge, featured } = req.body;
  db.phones[idx] = {
    ...db.phones[idx], model, color, storage,
    price: parseInt(price), description,
    badge: badge || null,
    featured: featured === 'true',
    ...(req.file ? { image: `/uploads/phones/${req.file.filename}` } : {})
  };
  writeDB(db);
  res.json({ success: true, phone: db.phones[idx] });
});

// Delete phone (admin)
app.delete('/api/admin/phones/:id', requireAdmin, (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  db.phones = db.phones.filter(p => p.id !== id);
  writeDB(db);
  res.json({ success: true });
});

// ─── Page Routes ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ┌─────────────────────────────────────┐`);
  console.log(`  │      apple_hamkor Server Running      │`);
  console.log(`  │   http://localhost:${PORT}               │`);
  console.log(`  │   Admin: http://localhost:${PORT}/admin  │`);
  console.log(`  └─────────────────────────────────────┘\n`);
});
