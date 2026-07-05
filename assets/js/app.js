/* =========================================================
   DAOCAR — логика: каталог, фильтры, калькулятор, избранное
   ========================================================= */
'use strict';

/* ---------- утилиты форматирования ---------- */
const CURRENT_YEAR = new Date().getFullYear();
const fmtRub = n => Math.round(n).toLocaleString('ru-RU') + ' ₽';
const fmtInt = n => Math.round(n).toLocaleString('ru-RU');
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* дефолтные курсы для карточек каталога (совпадают с калькулятором) */
const DEFAULT_CNY = 12.6;

/* =========================================================
   1. SVG-СИЛУЭТЫ АВТО (окрашиваются в accent модели)
   ========================================================= */
function carSVG(car) {
  const tall = /Кроссовер|Внедорожник|Минивэн/.test(car.body);
  const a = car.accent;
  const gid = 'g_' + car.id;
  // Два профиля: низкий (седан/лифтбек) и высокий (кроссовер/внедорожник)
  const bodyPath = tall
    ? 'M24 150 C24 118 46 110 72 108 L118 106 L150 66 C158 54 172 50 190 50 L300 50 C324 50 340 58 352 74 L382 106 L424 110 C450 114 462 124 462 150 L462 158 L24 158 Z'
    : 'M28 152 C28 130 52 122 80 120 L128 118 L168 76 C176 64 190 60 208 60 L292 60 C314 60 328 66 340 80 L372 114 L416 120 C446 124 458 134 458 152 L458 158 L28 158 Z';
  const winPath = tall
    ? 'M158 70 L192 58 L296 58 C314 58 326 64 336 76 L352 96 L158 96 Z'
    : 'M176 80 L208 66 L290 66 C308 66 320 72 330 84 L346 100 L176 100 Z';
  const wx1 = tall ? 120 : 128, wx2 = tall ? 366 : 368;
  return `
  <svg viewBox="0 0 486 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${a}" stop-opacity="1"/>
        <stop offset="1" stop-color="#0c0d10" stop-opacity=".85"/>
      </linearGradient>
      <radialGradient id="${gid}s" cx="50%" cy="50%" r="50%">
        <stop offset="0" stop-color="#000" stop-opacity=".45"/>
        <stop offset="1" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="243" cy="182" rx="210" ry="16" fill="url(#${gid}s)"/>
    <path d="${bodyPath}" fill="url(#${gid})" stroke="rgba(255,255,255,.10)" stroke-width="1.5"/>
    <path d="${winPath}" fill="#0c0d10" opacity=".55"/>
    <path d="${winPath}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/>
    <g>
      <circle cx="${wx1}" cy="160" r="30" fill="#0a0b0e" stroke="rgba(255,255,255,.14)" stroke-width="2"/>
      <circle cx="${wx1}" cy="160" r="14" fill="none" stroke="${a}" stroke-width="4" opacity=".9"/>
      <circle cx="${wx2}" cy="160" r="30" fill="#0a0b0e" stroke="rgba(255,255,255,.14)" stroke-width="2"/>
      <circle cx="${wx2}" cy="160" r="14" fill="none" stroke="${a}" stroke-width="4" opacity=".9"/>
    </g>
    <rect x="440" y="128" width="18" height="8" rx="3" fill="#ff4d4d" opacity=".8"/>
  </svg>`;
}
function visualBg(car) {
  return `background:radial-gradient(120% 120% at 30% 15%, ${car.accent}55, transparent 55%), linear-gradient(160deg,#1a1d24,#101116);`;
}

/* Реальное фото каждой модели (assets/img/<id>.jpg).
   Собраны с Wikimedia; для 2 моделей без фото — студийный запасной кадр по кузову. */
const CAR_IMG = {};
CARS.forEach(c => { CAR_IMG[c.id] = `assets/img/${c.id}.jpg`; });
const carImg = (car, cls) => `<img class="${cls}" src="${CAR_IMG[car.id]}" alt="${car.brand} ${car.model}" loading="lazy">`;

/* =========================================================
   2. ИЗБРАННОЕ (localStorage)
   ========================================================= */
const FAV_KEY = 'daocar_fav';
let favSet = new Set(loadFav());
function loadFav() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch { return []; }
}
function saveFav() {
  try { localStorage.setItem(FAV_KEY, JSON.stringify([...favSet])); } catch {}
}
function toggleFav(id) {
  const car = CARS.find(c => c.id === id);
  if (favSet.has(id)) { favSet.delete(id); toast(`${car.brand} ${car.model} убран из избранного`); }
  else { favSet.add(id); toast(`<b>♥</b> ${car.brand} ${car.model} — в избранном`); }
  saveFav();
  updateFavCount();
  syncFavButtons();
  renderFavDrawer();
  if (showFavOnly) renderCatalog();
}
function updateFavCount() { $('#favCount').textContent = favSet.size; }
function syncFavButtons() {
  $$('.car-fav').forEach(b => b.classList.toggle('active', favSet.has(b.dataset.id)));
}

/* =========================================================
   3. КАТАЛОГ + ФИЛЬТРЫ + СОРТИРОВКА
   ========================================================= */
const state = { search: '', brand: '', body: '', fuel: '', maxPrice: 500000, sort: 'pop' };
let showFavOnly = false;

function fillFilterOptions() {
  const bSel = $('#fBrand'), bodySel = $('#fBody'), fuelSel = $('#fFuel');
  // data-base хранит исходную подпись — к ней добавляем счётчик «(N)»
  BRANDS.forEach(b => bSel.insertAdjacentHTML('beforeend', `<option value="${b}" data-base="${b}">${b}</option>`));
  BODIES.forEach(b => bodySel.insertAdjacentHTML('beforeend', `<option value="${b}" data-base="${b}">${b}</option>`));
  FUELS.forEach(f => fuelSel.insertAdjacentHTML('beforeend', `<option value="${f}" data-base="${f}">${f}</option>`));
}

/* фасетные фильтры: сколько машин даст каждое значение с учётом ОСТАЛЬНЫХ фильтров.
   Значения, дающие 0, гасим (disabled) — в тупик уже не попасть. */
function facetList(exceptKey) {
  return CARS.filter(c => {
    if (showFavOnly && !favSet.has(c.id)) return false;
    if (exceptKey !== 'brand' && state.brand && c.brand !== state.brand) return false;
    if (exceptKey !== 'body'  && state.body  && c.body  !== state.body)  return false;
    if (exceptKey !== 'fuel'  && state.fuel  && c.fuel  !== state.fuel)  return false;
    if (c.price_cny > state.maxPrice) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      if (!(`${c.brand} ${c.model}`.toLowerCase().includes(q))) return false;
    }
    return true;
  });
}
function refreshFacets() {
  [['#fBrand', 'brand', c => c.brand],
   ['#fBody',  'body',  c => c.body],
   ['#fFuel',  'fuel',  c => c.fuel]].forEach(([sel, key, get]) => {
    const counts = {};
    facetList(key).forEach(c => { const v = get(c); counts[v] = (counts[v] || 0) + 1; });
    $$(`${sel} option`).forEach(o => {
      if (o.value === '') return;               // пункт «Все / Любой» не трогаем
      const n = counts[o.value] || 0;
      o.disabled = n === 0;
      o.textContent = `${o.dataset.base} (${n})`;
    });
  });
}

function getFiltered() {
  let list = CARS.filter(c => {
    if (showFavOnly && !favSet.has(c.id)) return false;
    if (state.brand && c.brand !== state.brand) return false;
    if (state.body && c.body !== state.body) return false;
    if (state.fuel && c.fuel !== state.fuel) return false;
    if (c.price_cny > state.maxPrice) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      if (!(`${c.brand} ${c.model}`.toLowerCase().includes(q))) return false;
    }
    return true;
  });
  const s = state.sort;
  list.sort((a, b) => {
    if (s === 'price-asc')  return a.price_cny - b.price_cny;
    if (s === 'price-desc') return b.price_cny - a.price_cny;
    if (s === 'power-desc') return b.power - a.power;
    if (s === 'year-desc')  return b.year - a.year;
    return 0; // pop — исходный порядок
  });
  return list;
}

function carCard(car) {
  const rub = car.price_cny * DEFAULT_CNY;
  const fuelClass = car.fuel === 'Электро' ? 'fuel-el' : '';
  const badges = [
    ...(car.tags || []).slice(0, 1).map(t => `<span class="car-badge">${t}</span>`),
    `<span class="car-badge ${fuelClass}">${car.fuel}</span>`
  ].join('');
  const specs = [
    `${car.year} г.`,
    car.body,
    `${car.power} л.с.`,
    car.fuel === 'Электро' ? 'Электро' : `${(car.engine_cc/1000).toFixed(1)} л`,
    car.range_km ? `${fmtInt(car.range_km)} км запас` : car.drive
  ].map(s => `<span class="car-spec">${s}</span>`).join('');
  return `
  <article class="car" data-id="${car.id}">
    <div class="car-visual" style="${visualBg(car)}">
      ${carImg(car, 'car-img')}
      <div class="car-badges">${badges}</div>
      <button class="car-fav ${favSet.has(car.id) ? 'active' : ''}" data-id="${car.id}" data-fav aria-label="В избранное">♥</button>
    </div>
    <div class="car-body">
      <span class="car-brand">${car.brand}</span>
      <span class="car-model">${car.model}</span>
      <div class="car-specs">${specs}</div>
      <div class="car-price">
        <div class="cny">${fmtInt(car.price_cny)} <small>¥</small></div>
        <div class="rub">≈ ${fmtRub(rub)} в Китае</div>
      </div>
      <div class="car-actions">
        <button class="btn btn-primary btn-sm" data-calc="${car.id}">Под ключ →</button>
        <button class="btn btn-ghost btn-sm" data-detail="${car.id}">Детали</button>
      </div>
    </div>
  </article>`;
}

function renderCatalog() {
  const list = getFiltered();
  const grid = $('#carGrid');
  grid.innerHTML = list.map(carCard).join('');
  $('#resultCount').textContent = declCars(list.length);
  $('#emptyState').hidden = list.length !== 0;
  refreshFacets();
}

function resetFilters() {
  Object.assign(state, { search: '', brand: '', body: '', fuel: '', maxPrice: 500000, sort: 'pop' });
  $('#fSearch').value = ''; $('#fBrand').value = ''; $('#fBody').value = '';
  $('#fFuel').value = ''; $('#fSort').value = 'pop'; $('#fPrice').value = 500000;
  $('#priceLabel').textContent = 'до 500 000';
  showFavOnly = false; $('#showFavOnly').setAttribute('aria-pressed', 'false');
  renderCatalog();
}
function declCars(n) {
  const m10 = n % 10, m100 = n % 100;
  let word = 'автомобилей';
  if (m10 === 1 && m100 !== 11) word = 'автомобиль';
  else if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) word = 'автомобиля';
  return `${n} ${word}`;
}

/* =========================================================
   4. КАЛЬКУЛЯТОР РАСТАМОЖКИ (физлицо, личное пользование)
   ========================================================= */
// Таможенная пошлина
function customsDuty({ tsRub, ageYears, engineCc, fuel, eur }) {
  if (fuel === 'Электро' || engineCc === 0) return tsRub * 0.15; // электро — 15% стоимости
  const euroTs = tsRub / eur;
  if (ageYears < 3) {
    let pct, minPerCc;
    if (euroTs <= 8500)        { pct = .54; minPerCc = 2.5; }
    else if (euroTs <= 16700)  { pct = .48; minPerCc = 3.5; }
    else if (euroTs <= 42300)  { pct = .48; minPerCc = 5.5; }
    else if (euroTs <= 84500)  { pct = .48; minPerCc = 7.5; }
    else if (euroTs <= 169000) { pct = .48; minPerCc = 15;  }
    else                       { pct = .48; minPerCc = 20;  }
    return Math.max(euroTs * pct, engineCc * minPerCc) * eur;
  }
  let rate;
  if (ageYears <= 5) {
    if (engineCc <= 1000) rate = 1.5; else if (engineCc <= 1500) rate = 1.7;
    else if (engineCc <= 1800) rate = 2.5; else if (engineCc <= 2300) rate = 2.7;
    else if (engineCc <= 3000) rate = 3.0; else rate = 3.6;
  } else {
    if (engineCc <= 1000) rate = 3.0; else if (engineCc <= 1500) rate = 3.2;
    else if (engineCc <= 1800) rate = 3.5; else if (engineCc <= 2300) rate = 4.8;
    else if (engineCc <= 3000) rate = 5.0; else rate = 5.7;
  }
  return engineCc * rate * eur;
}
// Утилизационный сбор (льготный для физлица)
function utilFee(ageYears) { return 20000 * (ageYears < 3 ? 0.17 : 0.26); }
// Таможенный сбор за оформление (по таможенной стоимости)
function clearanceFee(ts) {
  if (ts <= 200000) return 1067; if (ts <= 450000) return 2134;
  if (ts <= 1200000) return 4269; if (ts <= 2700000) return 11746;
  if (ts <= 4200000) return 16524; if (ts <= 5500000) return 21344;
  if (ts <= 7000000) return 27540; return 30000;
}
const SBKTS = 35000, BROKER = 25000, SERVICE = 200000;

function calcAll() {
  const price = +$('#cPrice').value || 0;
  const fuel = $('#cFuel').value;                       // Бензин | Гибрид | Электро
  const liters = +$('#cEngine').value || 0;
  const engine = fuel === 'Электро' ? 0 : Math.round(liters * 1000); // см³ для формулы
  const year = +$('#cYear').value || CURRENT_YEAR;
  const cny = +$('#cCny').value || DEFAULT_CNY;
  const eur = +$('#cEur').value || 100;
  const delivery = +$('#cDelivery').value || 0;
  const age = Math.max(0, CURRENT_YEAR - year);

  const ts = price * cny;
  const duty = customsDuty({ tsRub: ts, ageYears: age, engineCc: engine, fuel, eur });
  const util = utilFee(age);
  const clear = clearanceFee(ts);
  const total = ts + duty + util + clear + SBKTS + BROKER + delivery + SERVICE;

  const rows = [
    ['Стоимость авто в Китае', ts],
    ['Таможенная пошлина', duty],
    ['Утилизационный сбор', util],
    ['Таможенный сбор за оформление', clear],
    ['СБКТС + ЭРА-ГЛОНАСС', SBKTS],
    ['Брокер и оформление', BROKER],
    ['Доставка до региона', delivery],
    ['Услуги DAOCAR «под ключ»', SERVICE],
  ];
  $('#calcBreak').innerHTML = rows.map(([l, v]) =>
    `<li><span>${l}</span><b>${fmtRub(v)}</b></li>`).join('') +
    `<li class="accent"><span>Итого под ключ</span><b>${fmtRub(total)}</b></li>`;

  $('#rTotal').textContent = fmtRub(total);
  const ageLabel = age < 3 ? 'до 3 лет' : age <= 5 ? '3–5 лет' : 'старше 5 лет';
  $('#rSub').textContent = fuel === 'Электро'
    ? 'электромобиль · пошлина 15% от стоимости'
    : `${fuel} · ${liters.toFixed(1)} л · возраст ${ageLabel}`;

  // защита от опечатки в цене (например 199 вместо 199 000)
  const ph = $('#priceHint');
  if (price > 0 && price < 30000) {
    ph.textContent = '⚠ Похоже на опечатку — цена обычно 100 000–500 000 ¥';
    ph.classList.add('warn');
  } else {
    ph.textContent = 'Средняя цена на внутреннем рынке КНР';
    ph.classList.remove('warn');
  }
  return total;
}

/* поле объёма неактивно для электромобиля */
function toggleEngineField() {
  const isEl = $('#cFuel').value === 'Электро';
  const el = $('#cEngine');
  el.disabled = isEl;
  $('#engineHint').textContent = isEl ? 'Не требуется для электромобиля' : 'Рабочий объём в литрах';
  if (isEl) el.value = '';
}

/* применить характеристики выбранной модели */
function applyCar(car) {
  $('#cPrice').value = car.price_cny;
  $('#cFuel').value = car.fuel;
  toggleEngineField();
  if (car.fuel !== 'Электро') $('#cEngine').value = (car.engine_cc / 1000).toFixed(1);
  $('#cYear').value = car.year;
  $('#calcCarPick').hidden = false;
  $('#calcCarName').textContent = `${car.brand} ${car.model}, ${car.year}`;
  calcAll();
}

/* предзаполнение калькулятора из карточки/модалки */
function fillCalcFromCar(id) {
  const car = CARS.find(c => c.id === id);
  if (!car) return;
  $('#cModel').value = id;
  applyCar(car);
  $('#calc').scrollIntoView({ behavior: 'smooth' });
}
function clearCalcCar() {
  $('#cModel').value = '';
  $('#calcCarPick').hidden = true;
  calcAll();
}

/* =========================================================
   5. МОДАЛКА АВТО
   ========================================================= */
function openModal(id) {
  const car = CARS.find(c => c.id === id);
  if (!car) return;
  const rub = car.price_cny * DEFAULT_CNY;
  const specs = [
    ['Год', car.year], ['Кузов', car.body], ['Привод', car.drive],
    ['Мощность', car.power + ' л.с.'],
    ['Двигатель', car.fuel === 'Электро' ? 'Электро' : (car.engine_cc/1000).toFixed(1) + ' л'],
    ['Запас хода', car.range_km ? fmtInt(car.range_km) + ' км' : '—'],
  ];
  $('#modalBody').innerHTML = `
    <div class="modal-visual" style="${visualBg(car)}">${carImg(car, 'modal-img')}</div>
    <div class="modal-inner">
      <span class="car-brand">${car.brand} · ${car.fuel}</span>
      <h3>${car.model}</h3>
      <div class="spec-grid">
        ${specs.map(([l, v]) => `<div><span>${l}</span><b>${v}</b></div>`).join('')}
      </div>
      <div class="modal-price">
        <div><span class="car-brand">Цена на рынке КНР</span><div class="cny">${fmtInt(car.price_cny)} ¥</div></div>
        <div class="rub">≈ ${fmtRub(rub)}<br><small class="muted" style="font-weight:400">без учёта растаможки</small></div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" data-calc="${car.id}" data-close>Рассчитать под ключ →</button>
        <button class="btn btn-ghost" data-lead="${car.id}" data-close>Оставить заявку</button>
      </div>
    </div>`;
  $('#carModal').hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeModal() { $('#carModal').hidden = true; document.body.style.overflow = ''; }

/* =========================================================
   6. DRAWER ИЗБРАННОГО
   ========================================================= */
function renderFavDrawer() {
  const body = $('#favBody');
  const favs = CARS.filter(c => favSet.has(c.id));
  if (!favs.length) {
    body.innerHTML = `<p class="fav-empty">Пока пусто.<br>Добавляйте авто кнопкой ♥ в каталоге.</p>`;
    return;
  }
  body.innerHTML = favs.map(c => `
    <div class="fav-row">
      <div class="fav-thumb" style="${visualBg(c)}">${carImg(c, 'fav-img')}</div>
      <div class="fav-info">
        <b>${c.brand} ${c.model}</b>
        <span>${fmtInt(c.price_cny)} ¥ · ${c.year} г.</span>
      </div>
      <button class="fav-remove" data-fav data-id="${c.id}" aria-label="Убрать">×</button>
    </div>`).join('');
}
function openFavDrawer() { renderFavDrawer(); $('#favDrawer').hidden = false; document.body.style.overflow = 'hidden'; }
function closeFavDrawer() { $('#favDrawer').hidden = true; document.body.style.overflow = ''; }

/* =========================================================
   7. ФОРМА ЗАЯВКИ (валидация + маска телефона)
   ========================================================= */
function maskPhone(el) {
  el.addEventListener('input', () => {
    let d = el.value.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (!d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    let out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ') ' + d.slice(4, 7);
    if (d.length >= 7) out += '-' + d.slice(7, 9);
    if (d.length >= 9) out += '-' + d.slice(9, 11);
    el.value = out;
  });
}
function validateLead(e) {
  e.preventDefault();
  const name = $('#lName'), phone = $('#lPhone'), consent = $('#lConsent');
  let ok = true;
  const setErr = (el, msg) => {
    el.classList.toggle('invalid', !!msg);
    const box = $(`.err[data-for="${el.id}"]`);
    if (box) box.textContent = msg || '';
    if (msg) ok = false;
  };
  setErr(name, name.value.trim().length < 2 ? 'Укажите имя' : '');
  const digits = phone.value.replace(/\D/g, '');
  setErr(phone, digits.length < 11 ? 'Введите телефон полностью' : '');
  if (!consent.checked) { ok = false; toast('Нужно согласие на обработку данных'); }
  if (!ok) return;

  $('#leadForm').querySelectorAll('input,textarea,button').forEach(el => el.disabled = true);
  $('#formSuccess').hidden = false;
  toast('<b>✓</b> Заявка отправлена!');
  // здесь была бы реальная отправка на бэкенд / в мессенджер
}

/* =========================================================
   8. ПРОЧЕЕ: тост, счётчики, бургер
   ========================================================= */
let toastTimer;
function toast(html) {
  const t = $('#toast');
  t.innerHTML = html; t.hidden = false;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => (t.hidden = true), 260);
  }, 2600);
}

function animateCounters() {
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count, suf = el.dataset.suffix || '', pre = el.dataset.prefix || '';
    const dur = 1400, t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      const val = Math.round(to * (1 - Math.pow(1 - p, 3)));
      el.textContent = pre + fmtInt(val) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* =========================================================
   9. ИНИЦИАЛИЗАЦИЯ
   ========================================================= */
function init() {
  // фильтры
  fillFilterOptions();
  // год выпуска в калькуляторе
  const ySel = $('#cYear');
  for (let y = CURRENT_YEAR; y >= CURRENT_YEAR - 12; y--) {
    ySel.insertAdjacentHTML('beforeend', `<option value="${y}"${y === CURRENT_YEAR - 1 ? ' selected' : ''}>${y}</option>`);
  }
  // модели в калькуляторе (сгруппированы по кузову, с реальной ценой)
  const mSel = $('#cModel');
  BODIES.forEach(body => {
    const group = CARS.filter(c => c.body === body);
    if (!group.length) return;
    const og = document.createElement('optgroup');
    og.label = body;
    og.innerHTML = group.map(c => `<option value="${c.id}">${c.brand} ${c.model} — ${fmtInt(c.price_cny)} ¥</option>`).join('');
    mSel.appendChild(og);
  });

  renderCatalog();
  updateFavCount();
  calcAll();

  // --- слушатели фильтров ---
  $('#fSearch').addEventListener('input', e => { state.search = e.target.value; renderCatalog(); });
  $('#fBrand').addEventListener('change', e => { state.brand = e.target.value; renderCatalog(); });
  $('#fBody').addEventListener('change', e => { state.body = e.target.value; renderCatalog(); });
  $('#fFuel').addEventListener('change', e => { state.fuel = e.target.value; renderCatalog(); });
  $('#fSort').addEventListener('change', e => { state.sort = e.target.value; renderCatalog(); });
  $('#fPrice').addEventListener('input', e => {
    state.maxPrice = +e.target.value;
    $('#priceLabel').textContent = 'до ' + fmtInt(state.maxPrice);
    renderCatalog();
  });
  $('#resetFilters').addEventListener('click', resetFilters);
  $('#showFavOnly').addEventListener('click', e => {
    showFavOnly = !showFavOnly;
    e.currentTarget.setAttribute('aria-pressed', String(showFavOnly));
    renderCatalog();
  });

  // --- делегирование кликов по каталогу/модалке ---
  document.addEventListener('click', e => {
    const favBtn = e.target.closest('[data-fav]');
    if (favBtn) { toggleFav(favBtn.dataset.id); return; }
    const calcBtn = e.target.closest('[data-calc]');
    if (calcBtn) { fillCalcFromCar(calcBtn.dataset.calc); if (calcBtn.hasAttribute('data-close')) closeModal(); return; }
    const detailBtn = e.target.closest('[data-detail]');
    if (detailBtn) { openModal(detailBtn.dataset.detail); return; }
    const leadBtn = e.target.closest('[data-lead]');
    if (leadBtn) {
      const car = CARS.find(c => c.id === leadBtn.dataset.lead);
      if (car) { $('#lCar').value = `${car.brand} ${car.model} ${car.year}`; if ($('#lWish').value === '') $('#lWish').value = `Интересует ${car.brand} ${car.model}`; }
      if (leadBtn.hasAttribute('data-close')) closeModal();
      $('#lead').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (e.target.closest('#emptyReset')) { resetFilters(); return; }
    if (e.target.closest('[data-close]')) closeModal();
    if (e.target.closest('[data-close-fav]')) closeFavDrawer();
  });

  // --- калькулятор пересчёт на любой ввод ---
  $('#calcForm').addEventListener('input', calcAll);
  $('#cModel').addEventListener('change', e => {
    const car = CARS.find(c => c.id === e.target.value);
    if (car) applyCar(car); else clearCalcCar();
  });
  $('#cFuel').addEventListener('change', () => { toggleEngineField(); calcAll(); });
  $('#calcClearCar').addEventListener('click', clearCalcCar);
  $('#calcToLead').addEventListener('click', () => {
    $('#lCar').value = `Расчёт: ${$('#rTotal').textContent}`;
    if ($('#lWish').value === '') $('#lWish').value = `Прошу подтвердить расчёт под ключ ≈ ${$('#rTotal').textContent}`;
  });

  // --- избранное drawer ---
  $('#favToggle').addEventListener('click', openFavDrawer);

  // --- форма ---
  maskPhone($('#lPhone'));
  $('#leadForm').addEventListener('submit', validateLead);

  // --- бургер ---
  $('#burger').addEventListener('click', () => $('.nav').classList.toggle('open'));
  $$('.nav a').forEach(a => a.addEventListener('click', () => $('.nav').classList.remove('open')));

  // --- ESC закрывает оверлеи ---
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeFavDrawer(); }
  });

  // --- счётчики при появлении hero ---
  animateCounters();
}

document.addEventListener('DOMContentLoaded', init);
