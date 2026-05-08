/**
 * apple_hamkor — Main Frontend JS
 * Premium interactions & product rendering
 */

// ─── Preloader ────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('hidden');
    preloader.addEventListener('transitionend', () => preloader.remove());
  }, 1600);
});

// ─── Navbar Scroll Effect ─────────────────────────────────────
const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  navbar.classList.toggle('scrolled', scrollY > 20);
  lastScroll = scrollY;
});

// ─── Mobile Menu ──────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
navToggle?.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu?.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ─── Smooth Scroll ────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── Animated Counter ─────────────────────────────────────────
function animateCount(el, end, duration = 1500) {
  let start = 0;
  const step = Math.ceil(end / (duration / 16));
  const timer = setInterval(() => {
    start += step;
    if (start >= end) { start = end; clearInterval(timer); }
    el.textContent = start + (el.dataset.suffix || '');
  }, 16);
}

const counters = document.querySelectorAll('[data-count]');
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target, parseInt(entry.target.dataset.count));
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => countObserver.observe(c));

// ─── Scroll Reveal ────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .stat-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObserver.observe(el);
});

// ─── Format Price ─────────────────────────────────────────────
function formatPrice(price) {
  return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
}

// ─── Get Badge Class ──────────────────────────────────────────
function getBadgeClass(badge) {
  const map = {
    'Bestseller': 'badge-bestseller',
    'Popular': 'badge-popular',
    'Sale': 'badge-sale',
    'New': 'badge-new',
    'Hot': 'badge-hot',
  };
  return map[badge] || 'badge-new';
}

// ─── Phone Placeholder SVG ────────────────────────────────────
function phonePlaceholder() {
  return `<div class="card-placeholder">
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" stroke-width="1"/>
      <circle cx="12" cy="18" r="1" fill="currentColor"/>
    </svg>
    <span>Rasm yuklanmagan</span>
  </div>`;
}

// ─── Build Product Card ───────────────────────────────────────
function buildCard(phone, index) {
  const badge = phone.badge ? `<div class="card-badge ${getBadgeClass(phone.badge)}">${phone.badge}</div>` : '';
  const imgHtml = phone.image
    ? `<img class="card-img" src="${phone.image}" alt="${phone.model}" loading="lazy">`
    : phonePlaceholder();

  return `
    <div class="product-card" data-id="${phone.id}" style="animation-delay:${index * 0.06}s">
      <div class="card-image-wrap">
        ${badge}
        ${imgHtml}
      </div>
      <div class="card-body">
        <div class="card-model">${phone.model}</div>
        <div class="card-meta">
          <span class="card-tag">${phone.color}</span>
          <span class="card-tag">${phone.storage}</span>
        </div>
        <div class="card-desc">${phone.description}</div>
        <div class="card-footer">
          <div class="card-price">${formatPrice(phone.price)}</div>
          <button class="card-cta" onclick="openModal(${phone.id}, event)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Ko'rish
          </button>
        </div>
      </div>
    </div>`;
}

// ─── Products State ───────────────────────────────────────────
let allPhones = [];
let activeFilter = 'all';

// ─── Load Products ────────────────────────────────────────────
async function loadProducts() {
  try {
    const res = await fetch('/api/phones');
    allPhones = await res.json();
    renderProducts(allPhones);
  } catch (err) {
    console.error('Failed to load products:', err);
  }
}

// ─── Render Products ──────────────────────────────────────────
function renderProducts(phones) {
  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('productsEmpty');
  if (!phones.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = phones.map((p, i) => buildCard(p, i)).join('');
}

// ─── Filter ───────────────────────────────────────────────────
function filterPhones(filter) {
  activeFilter = filter;
  let filtered;
  if (filter === 'all') filtered = allPhones;
  else if (filter === 'featured') filtered = allPhones.filter(p => p.featured);
  else filtered = allPhones.filter(p => p.model.toLowerCase().includes(filter.replace('iphone', 'iphone ')));
  renderProducts(filtered);
}

document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    filterPhones(tab.dataset.filter);
  });
});

// ─── Modal ────────────────────────────────────────────────────
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');

function openModal(id, e) {
  if (e) e.stopPropagation();
  const phone = allPhones.find(p => p.id === id);
  if (!phone) return;

  const imgHtml = phone.image
    ? `<img class="modal-img" src="${phone.image}" alt="${phone.model}">`
    : `<div class="modal-img-placeholder">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="2" width="14" height="20" rx="3" stroke="#6e6e73" stroke-width="1"/>
          <circle cx="12" cy="18" r="1" fill="#6e6e73"/>
        </svg>
      </div>`;

  const badge = phone.badge ? `<span class="card-badge ${getBadgeClass(phone.badge)}" style="position:static;margin-bottom:12px;">${phone.badge}</span>` : '';

  modalContent.innerHTML = `
    ${imgHtml}
    ${badge}
    <div class="modal-model">${phone.model}</div>
    <div class="modal-price">${formatPrice(phone.price)}</div>
    <div class="modal-meta">
      <span class="card-tag">${phone.color}</span>
      <span class="card-tag">${phone.storage}</span>
    </div>
    <div class="modal-desc">${phone.description}</div>
    <a href="https://t.me/Odil_122" target="_blank">
      <button class="modal-action">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.018 9.509c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.881.712z"/>
        </svg>
        Telegram orqali buyurtma berish
      </button>
    </a>
  `;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Card click opens modal too
document.getElementById('productsGrid').addEventListener('click', e => {
  const card = e.target.closest('.product-card');
  if (card && !e.target.closest('.card-cta')) {
    openModal(parseInt(card.dataset.id));
  }
});

document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ─── Init ─────────────────────────────────────────────────────
loadProducts();
