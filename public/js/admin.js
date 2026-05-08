/**
 * apple_hamkor — Admin Panel JS
 * Full CRUD management for products
 */

// ─── State ────────────────────────────────────────────────────
let allPhones = [];
let deleteTargetId = null;
let isEditing = false;

// ─── Format Price ─────────────────────────────────────────────
const fmt = n => new Intl.NumberFormat('uz-UZ').format(n) + " so'm";

// ─── Auth ─────────────────────────────────────────────────────
async function checkAuth() {
  const res = await fetch('/api/admin/check');
  const data = await res.json();
  if (data.isAdmin) showApp();
}

document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('adminPassword').addEventListener('keydown', e => {
  if (e.key === 'Enter') login();
});

async function login() {
  const password = document.getElementById('adminPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) showApp();
    else errEl.textContent = 'Noto\'g\'ri parol. Qayta urinib ko\'ring.';
  } catch {
    errEl.textContent = 'Xatolik yuz berdi.';
  }
}

function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminApp').style.display = 'flex';
  loadPhones();
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  location.reload();
});

// ─── Sidebar Navigation ───────────────────────────────────────
function switchView(viewId) {
  document.querySelectorAll('.admin-view').forEach(v => v.style.display = 'none');
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

  document.getElementById(`view-${viewId}`).style.display = 'block';
  document.querySelector(`[data-view="${viewId}"]`)?.classList.add('active');

  const titles = { products: 'Mahsulotlar', add: 'Yangi mahsulot', stats: 'Statistika' };
  document.getElementById('adminPageTitle').textContent = titles[viewId] || viewId;
}

document.querySelectorAll('[data-view]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    switchView(link.dataset.view);
  });
});

// ─── Load Phones ──────────────────────────────────────────────
async function loadPhones() {
  const res = await fetch('/api/phones');
  allPhones = await res.json();
  renderTable();
  renderStats();
}

// ─── Render Table ─────────────────────────────────────────────
function getBadgeHtml(badge) {
  if (!badge) return '<span style="color:#6e6e73">—</span>';
  const colors = {
    Bestseller: '#ffd60a', Popular: '#2997ff', Sale: '#ff453a', New: '#34d399', Hot: '#ff9500'
  };
  const color = colors[badge] || '#2997ff';
  return `<span class="table-badge" style="color:${color};background:${color}20;border:1px solid ${color}40">${badge}</span>`;
}

function renderTable() {
  const tbody = document.getElementById('adminTableBody');
  document.getElementById('toolbarStats').innerHTML =
    `<span class="toolbar-count">Jami: <strong style="color:#fff">${allPhones.length}</strong> mahsulot</span>`;

  if (!allPhones.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#6e6e73;padding:48px">Hech qanday mahsulot yo'q</td></tr>`;
    return;
  }

  tbody.innerHTML = allPhones.map(p => `
    <tr>
      <td>
        ${p.image
          ? `<img class="table-img" src="${p.image}" alt="${p.model}">`
          : `<div class="table-img-placeholder">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" stroke-width="1"/>
              </svg>
            </div>`}
      </td>
      <td class="table-model">${p.model}</td>
      <td>${p.color}</td>
      <td>${p.storage}</td>
      <td class="table-price">${fmt(p.price)}</td>
      <td>${getBadgeHtml(p.badge)}</td>
      <td>
        <div class="table-actions">
          <button class="btn-table-edit" onclick="editPhone(${p.id})" title="Tahrirlash">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="btn-table-delete" onclick="openDeleteModal(${p.id})" title="O'chirish">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ─── Render Stats ─────────────────────────────────────────────
function renderStats() {
  const featured = allPhones.filter(p => p.featured).length;
  const avgPrice = allPhones.length ? Math.round(allPhones.reduce((s, p) => s + p.price, 0) / allPhones.length) : 0;
  const minPrice = allPhones.length ? Math.min(...allPhones.map(p => p.price)) : 0;
  const maxPrice = allPhones.length ? Math.max(...allPhones.map(p => p.price)) : 0;

  document.getElementById('statsCards').innerHTML = `
    <div class="stat-card">
      <div class="stat-card-icon">📱</div>
      <div class="stat-card-value">${allPhones.length}</div>
      <div class="stat-card-label">Jami mahsulotlar</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon">⭐</div>
      <div class="stat-card-value">${featured}</div>
      <div class="stat-card-label">Tanlangan mahsulotlar</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon">💰</div>
      <div class="stat-card-value" style="font-size:22px">${fmt(avgPrice)}</div>
      <div class="stat-card-label">O'rtacha narx</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon">📉</div>
      <div class="stat-card-value" style="font-size:22px">${fmt(minPrice)}</div>
      <div class="stat-card-label">Eng arzon narx</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon">📈</div>
      <div class="stat-card-value" style="font-size:22px">${fmt(maxPrice)}</div>
      <div class="stat-card-label">Eng qimmat narx</div>
    </div>
  `;
}

// ─── Product Form ─────────────────────────────────────────────
document.getElementById('productForm').addEventListener('submit', submitForm);

async function submitForm(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitBtnText');
  const msgEl = document.getElementById('formMessage');

  submitText.textContent = 'Saqlanmoqda...';
  submitBtn.disabled = true;

  const formData = new FormData();
  formData.append('model', document.getElementById('fModel').value);
  formData.append('color', document.getElementById('fColor').value);
  formData.append('storage', document.getElementById('fStorage').value);
  formData.append('price', document.getElementById('fPrice').value);
  formData.append('description', document.getElementById('fDesc').value);
  formData.append('badge', document.getElementById('fBadge').value);
  formData.append('featured', document.getElementById('fFeatured').value);

  const fileInput = document.getElementById('fImage');
  if (fileInput.files[0]) formData.append('image', fileInput.files[0]);

  const editId = document.getElementById('editId').value;
  const url = editId ? `/api/admin/phones/${editId}` : '/api/admin/phones';
  const method = editId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, { method, body: formData });
    const data = await res.json();
    if (data.success) {
      msgEl.textContent = editId ? 'Mahsulot yangilandi!' : 'Mahsulot qo\'shildi!';
      msgEl.className = 'form-message success';
      await loadPhones();
      setTimeout(() => {
        resetForm();
        switchView('products');
      }, 1200);
    } else throw new Error(data.error);
  } catch (err) {
    msgEl.textContent = 'Xatolik: ' + err.message;
    msgEl.className = 'form-message error';
  } finally {
    submitText.textContent = 'Saqlash';
    submitBtn.disabled = false;
  }
}

function resetForm() {
  document.getElementById('productForm').reset();
  document.getElementById('editId').value = '';
  document.getElementById('formTitle').textContent = 'Yangi mahsulot qo\'shish';
  document.getElementById('formMessage').textContent = '';
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'flex';
  isEditing = false;
}

function cancelEdit() {
  resetForm();
  switchView('products');
}

// ─── Edit Phone ───────────────────────────────────────────────
function editPhone(id) {
  const phone = allPhones.find(p => p.id === id);
  if (!phone) return;
  isEditing = true;
  document.getElementById('editId').value = id;
  document.getElementById('fModel').value = phone.model;
  document.getElementById('fColor').value = phone.color;
  document.getElementById('fStorage').value = phone.storage;
  document.getElementById('fPrice').value = phone.price;
  document.getElementById('fDesc').value = phone.description;
  document.getElementById('fBadge').value = phone.badge || '';
  document.getElementById('fFeatured').value = phone.featured ? 'true' : 'false';
  document.getElementById('formTitle').textContent = `Tahrirlash: ${phone.model}`;
  document.getElementById('formMessage').textContent = '';

  if (phone.image) {
    const preview = document.getElementById('imagePreview');
    preview.src = phone.image;
    preview.style.display = 'block';
    document.getElementById('uploadPlaceholder').style.display = 'none';
  }

  switchView('add');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Delete ───────────────────────────────────────────────────
function openDeleteModal(id) {
  deleteTargetId = id;
  document.getElementById('deleteOverlay').style.display = 'flex';
}
function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('deleteOverlay').style.display = 'none';
}

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  if (!deleteTargetId) return;
  try {
    const res = await fetch(`/api/admin/phones/${deleteTargetId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { await loadPhones(); closeDeleteModal(); }
  } catch (err) { alert('O\'chirishda xatolik: ' + err.message); }
});

// ─── Image Upload Preview ─────────────────────────────────────
const uploadZone = document.getElementById('imageUploadZone');
const fileInput = document.getElementById('fImage');
const imagePreview = document.getElementById('imagePreview');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');

uploadZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) showPreview(file);
});

uploadZone.addEventListener('dragover', e => {
  e.preventDefault(); uploadZone.classList.add('drag-over');
});
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault(); uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const dt = new DataTransfer(); dt.items.add(file);
    fileInput.files = dt.files;
    showPreview(file);
  }
});

function showPreview(file) {
  const reader = new FileReader();
  reader.onload = e => {
    imagePreview.src = e.target.result;
    imagePreview.style.display = 'block';
    uploadPlaceholder.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// ─── Init ─────────────────────────────────────────────────────
checkAuth();
