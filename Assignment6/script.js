// ===== API URLs =====
const API_ALL = "https://openapi.programming-hero.com/api/plants";
const API_CATEGORIES = "https://openapi.programming-hero.com/api/categories";
const API_BY_CATEGORY = (id) => `https://openapi.programming-hero.com/api/category/${id}`;
const API_DETAIL = (id) => `https://openapi.programming-hero.com/api/plant/${id}`;

// ===== DOM =====
const categoryList = document.getElementById('categoryList');
const cardsGrid = document.getElementById('cardsGrid');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const cartList = document.getElementById('cartList');
const cartTotalEl = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCart');

// Modal
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const modalTitle = document.getElementById('modalTitle');
const modalClose = document.getElementById('modalClose');

// ===== State =====
let activeCategory = 'all';
const cart = new Map(); // id -> { item, qty }

// ===== Utils =====
const formatPrice = (p) => `$${Number(p).toLocaleString()}`;
const toggleSpinner = (show) => loading.classList.toggle('hidden', !show);
const setEmpty = (show) => emptyState.classList.toggle('hidden', !show);

function setActiveCategory(id) {
  activeCategory = id;
  document.querySelectorAll('[data-cat-btn]').forEach(btn => {
    const on = btn.dataset.catBtn === String(id);
    btn.classList.toggle('bg-green-600', on);
    btn.classList.toggle('text-white', on);
    btn.classList.toggle('border-green-600', on);
    // Remove hover effect for selected
    if (on) {
      btn.classList.remove('hover:bg-green-50');
    } else {
      btn.classList.add('hover:bg-green-50');
    }
  });
}

// ===== Renderers =====
function renderCategories(list) {
  categoryList.innerHTML = '';
  // "All" pseudo-category
  const allBtn = document.createElement('button');
  allBtn.textContent = 'All Trees';
  allBtn.setAttribute('data-cat-btn', 'all');
  allBtn.className = 'w-full text-left px-3 py-2 rounded-xl border hover:bg-green-50 transition';
  categoryList.appendChild(allBtn);

  // API returns: { id, category_name, small_description }
  list.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat.category_name;           // <-- correct field
    btn.title = cat.small_description || '';
    btn.setAttribute('data-cat-btn', String(cat.id));
    btn.className = 'w-full text-left px-3 py-2 rounded-xl border hover:bg-green-50 transition';
    categoryList.appendChild(btn);
  });

  categoryList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-cat-btn]');
    if (!btn) return;
    const id = btn.dataset.catBtn;
    setActiveCategory(id);
    if (id === 'all') loadAllPlants();
    else loadByCategory(id);
  });

  setActiveCategory('all');
}

function renderCards(plants) {
  cardsGrid.innerHTML = '';
  if (!plants || plants.length === 0) { setEmpty(true); return; }
  setEmpty(false);

  plants.forEach(p => {
    const name = p.name || p.plant_name || "Tree";
    const category = p.category || p.category_name || "Tree";
    const desc = p.description || p.small_description || "Beautiful tree";
    const price = p.price || 0;
    const img = p.img || p.image || "";

    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl shadow p-3 flex flex-col';
    card.setAttribute('data-open-modal', '');
    card.setAttribute('data-id', p.id);
    card.innerHTML = `
      <div class='aspect-video bg-slate-100 rounded-xl overflow-hidden'>
        <img src='${img}' alt='${name}' class='w-full h-full object-cover'/>
      </div>
      <div class='mt-3 flex-1'>
        <h4 class='font-semibold hover:underline cursor-pointer'>${name}</h4>
        <p class='text-xs text-slate-500 mt-1 overflow-hidden text-ellipsis'>${desc.length>90?desc.slice(0,90)+'…':desc}</p>
        <span class='inline-block mt-2 text-xs px-2 py-1 rounded-full bg-green-50 border border-green-600 text-green-700'>${category}</span>
      </div>
      <div class='mt-3 flex items-center justify-between'>
        <span class='font-semibold'>${formatPrice(price)} </span>
        <button
          class='add-to-cart bg-green-600 text-white text-sm px-3 py-1.5 rounded-xl hover:bg-green-500'
          data-id='${p.id}'
          data-name='${name.replace(/'/g,"&#39;")}'
          data-price='${price}'
        >Add to Cart</button>
      </div>`;
    cardsGrid.appendChild(card);
  });
}

function renderCart() {
  cartList.innerHTML = '';
  let total = 0;
  cart.forEach(({ item, qty }) => {
    total += (item.price || 0) * qty;
    const li = document.createElement('li');
    li.className = 'py-2 flex items-center justify-between gap-3';
    li.innerHTML = `
      <div class='min-w-0'>
        <p class='truncate text-sm'>${item.name}</p>
        <p class='text-xs text-slate-500'>${qty} × $${item.price}</p>
      </div>
      <div class='flex items-center gap-2'>
        <button class='dec px-2 py-1 rounded-lg border' data-id='${item.id}'>-</button>
        <button class='inc px-2 py-1 rounded-lg border' data-id='${item.id}'>+</button>
        <button class='remove text-red-600' title='Remove' data-id='${item.id}'>✕</button>
      </div>`;
    cartList.appendChild(li);
  });
  cartTotalEl.textContent = formatPrice(total);
}

// ===== Cart Ops =====
function addToCart(item) {
  const row = cart.get(item.id) || { item, qty: 0 };
  row.qty += 1;
  cart.set(item.id, row);
  renderCart();
}

function updateQty(id, delta) {
  const row = cart.get(id);
  if (!row) return;
  row.qty += delta;
  if (row.qty <= 0) cart.delete(id);
  renderCart();
}

function removeFromCart(id) { cart.delete(id); renderCart(); }

cartList.addEventListener('click', (e) => {
  const id = e.target.dataset.id;
  if (!id) return;
  if (e.target.classList.contains('inc')) updateQty(id, 1);
  else if (e.target.classList.contains('dec')) updateQty(id, -1);
  else if (e.target.classList.contains('remove')) removeFromCart(id);
});

clearCartBtn.addEventListener('click', () => { cart.clear(); renderCart(); });

// ===== Modal =====
function openModal() { modal.classList.remove('hidden'); document.body.classList.add('no-scroll'); }
function closeModal() { modal.classList.add('hidden'); document.body.classList.remove('no-scroll'); }
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

async function showDetails(id) {
  modalBody.innerHTML = '<div class="p-6"><div class="spinner mx-auto"></div></div>';
  openModal();
  try {
    const res = await fetch(API_DETAIL(id));
  const data = await res.json();
  const item = data?.plants || data?.plant || data?.data || data;
    const name = item?.name || item?.plant_name || 'Tree';
    const category = item?.category || item?.category_name || 'Tree';
    const desc = item?.description || item?.small_description || '—';
    const price = item?.price || 0;
    const img = item?.img || item?.image || '';

    modalTitle.textContent = name;
    modalBody.innerHTML = `
      <div class='w-full h-48 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden mb-4'>
        ${img ? `<img src='${img}' class='w-full h-full object-cover' alt='${name}'/>` : `<div class='w-full h-full flex items-center justify-center text-slate-400'>No Image</div>`}
      </div>
      <div>
        <p class='text-sm text-slate-600'>${desc}</p>
        <p class='mt-2 text-sm'><span class='font-semibold'>Category:</span> ${category}</p>
        <p class='mt-1 text-sm'><span class='font-semibold'>Price:</span> $${price}</p>
        <button id='modalAdd' class='mt-3 bg-green-600 text-white px-4 py-2 rounded-xl'>Add to Cart</button>
      </div>`;
    document.getElementById('modalAdd')
      .addEventListener('click', () => addToCart({ id: item.id, name, price }));
  } catch (err) {
    modalBody.innerHTML = '<div class="p-6 text-sm text-red-600">Failed to load details.</div>';
  }
}

// ===== Fetch helpers =====
async function fetchJson(url) {
  toggleSpinner(true);
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } finally {
    toggleSpinner(false);
  }
}

async function loadCategories() {
  try {
    const data = await fetchJson(API_CATEGORIES);
    const cats = Array.isArray(data?.categories) ? data.categories : [];
    renderCategories(cats);
  } catch (_) {
    categoryList.innerHTML = '<p class="text-sm text-red-600">Failed to load categories.</p>';
  }
}

async function loadAllPlants() {
  const data = await fetchJson(API_ALL);
  const plants = data?.plants || data?.data || [];
  renderCards(plants);
}

async function loadByCategory(id) {
  const data = await fetchJson(API_BY_CATEGORY(id));
  const plants = data?.plants || data?.data || [];
  renderCards(plants);
}

// ===== Delegated listeners for cards =====
cardsGrid.addEventListener('click', (e) => {
  const addBtn = e.target.closest('button.add-to-cart');
  const cardEl = e.target.closest('[data-open-modal]');

  if (addBtn) {
    const id = addBtn.dataset.id;
    const name = addBtn.dataset.name || 'Tree';
    const price = Number(addBtn.dataset.price || 0);
    addToCart({ id, name, price });
    e.stopPropagation();
    return;
  }
  if (cardEl) {
    const id = cardEl.dataset.id;
    showDetails(id);
  }
});

// Donation form
document.getElementById('donationForm').addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('donationThanks').classList.remove('hidden');
  e.target.reset();
});

// Init
loadCategories();
loadAllPlants();
