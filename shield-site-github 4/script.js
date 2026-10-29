// Shiny sweeping-border effect on CTA buttons
if (window.ShinyButton) {
  window.ShinyButton.initShinyButtons('.btn');
}

// Logo — scroll to the very top (header is sticky, so #top alone won't move the page)
document.querySelectorAll('.logo--home').forEach(logo => {
  logo.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('is-open');
  });
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mainNav.classList.remove('is-open'));
  });
}

// Accordions (services list + FAQ)
function setupAccordion(container, opts = {}) {
  if (!container) return;
  const items = Array.from(container.querySelectorAll('.accordion-item'));

  function sizeOpenPanel(item) {
    const panel = item.querySelector('.accordion-panel');
    panel.style.maxHeight = panel.scrollHeight + 'px';
  }

  items.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');
    if (item.classList.contains('is-open')) {
      sizeOpenPanel(item);
    }
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      if (opts.singleOpen) {
        items.forEach(other => {
          if (other !== item) {
            other.classList.remove('is-open');
            other.querySelector('.accordion-panel').style.maxHeight = null;
          }
        });
      }
      if (isOpen) {
        item.classList.remove('is-open');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        sizeOpenPanel(item);
      }
    });
  });

  window.addEventListener('resize', () => {
    items.forEach(item => {
      if (item.classList.contains('is-open')) sizeOpenPanel(item);
    });
  });
}

setupAccordion(document.getElementById('servicesAccordion'), { singleOpen: true });
setupAccordion(document.getElementById('faqAccordion'), { singleOpen: true });

// Consultation direction pills
const pillGroup = document.getElementById('pillGroup');
const directionInput = document.getElementById('directionInput');
if (pillGroup) {
  pillGroup.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      pillGroup.querySelectorAll('.pill').forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      directionInput.value = pill.dataset.value;
    });
  });
}

// Consultation form submit
const consultationForm = document.getElementById('consultationForm');
const formSuccess = document.getElementById('formSuccess');
if (consultationForm) {
  consultationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    consultationForm.reset();
    pillGroup.querySelectorAll('.pill').forEach(p => p.classList.remove('is-active'));
    pillGroup.querySelector('.pill').classList.add('is-active');
    directionInput.value = pillGroup.querySelector('.pill').dataset.value;
    formSuccess.classList.add('is-visible');
  });
}

// AJAX equipment kit builder — 3-step wizard: premise type -> parameters -> generated kit
(function () {
  const V = '20261020p';

  const PREMISE_TYPES = [
    { id: 'apartment', label: 'Квартира', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="1" stroke="currentColor" stroke-width="1.6"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' },
    { id: 'house', label: 'Будинок', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 11 12 4l8 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 20v-5h4v5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>' },
    { id: 'office', label: 'Офіс', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="10" height="18" rx="1" stroke="currentColor" stroke-width="1.6"/><path d="M10 7h1M13 7h1M10 11h1M13 11h1M10 15h1M13 15h1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' },
    { id: 'business', label: "Бізнес (магазин, склад, кафе тощо)", icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 9V6l1.5-2h13L20 6v3" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 20v-5h6v5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>' },
  ];

  const PARAMS = [
    { key: 'floors', only: ['office', 'house'], label: 'Поверхи', hint: "Стабільний зв'язок між хабом і бездротовими пристроями в багатоповерхових будівлях забезпечують ретранслятори радіосигналу", icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="m12 3 9 4.5-9 4.5L3 7.5 12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="m3 12 9 4.5 9-4.5M3 16.5 12 21l9-4.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>', min: 0, def: 0 },
    { key: 'rooms', label: "Кімнати, зокрема кухня", hint: 'Безпеку й автоматизацію в кожній кімнаті гарантують пристрої різного призначення', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 3v18M3 3h13l5 5v13" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 14h8v7H3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>', min: 0, def: 0 },
    { key: 'entries', label: 'Входи', hint: 'Кожен вхід у приміщення має бути захищений', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 3v18l11-3V6L6 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="9.3" cy="12" r=".9" fill="currentColor"/></svg>', min: 0, def: 0 },
    { key: 'windows', label: 'Вікна', hint: 'Кожне вікно, до якого можна дістатися на вулиці, має бути захищене', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" stroke="currentColor" stroke-width="1.6"/><path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="1.6"/></svg>', min: 0, def: 0 },
    { key: 'area', needs: 'outdoor', step: 100, max: 10000, label: 'Площа території (м²)', hint: 'Стабільний зв\'язок між хабом і бездротовими пристроями на великих територіях забезпечують ретранслятори радіосигналу', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" stroke="currentColor" stroke-width="1.6"/><path d="M4 12 12 4M4 20 20 4M12 20l8-8" stroke="currentColor" stroke-width="1.4"/></svg>', min: 0, def: 0 },
  ];

  // Step 2: system functions (intrusion protection group, like in the Ajax configurator)
  const FUNCTIONS = [
    { id: 'indoor', label: 'Охорона приміщень', hint: 'Захистіть приміщення за допомогою пристроїв, що миттєво виявляють вторгнення' },
    { id: 'outdoor', only: ['house'], label: 'Вулична безпека', hint: 'Поширте зону покриття системи безпеки на прилеглу територію' },
  ];
  const PH = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="11" y="8" width="26" height="32" rx="6" fill="#eef1f6" stroke="#b9c2d3" stroke-width="1.5"/><circle cx="24" cy="20" r="4" fill="#b9c2d3"/><rect x="17" y="29" width="14" height="3" rx="1.5" fill="#b9c2d3"/></svg>');

  // Base kit generated automatically from the parameters
  const BASE_CATALOG = [
    { id: 'hub', name: 'Hub 2 (2G) Jeweller', desc: 'Бездротова централь з підтримкою фотоверифікації. Працює з Ethernet та двома SIM-картами (2G)', img: 'media/ajax-products/hub.webp', price: 8799, qty: (p, f) => (f.indoor || f.outdoor ? 1 : 0) },
    { id: 'motion', name: 'MotionProtect Jeweller', desc: 'Бездротовий ІЧ датчик руху', img: 'media/ajax-products/motion.webp', price: 1849, qty: (p, f) => (f.indoor ? Math.max(1, p.rooms) : 0) },
    { id: 'door', name: 'DoorProtect Jeweller', desc: 'Бездротовий датчик відчинення з герконом', img: 'media/ajax-products/door.webp', price: 1359, qty: (p, f) => (f.indoor ? Math.max(1, p.entries) : 0) },
    { id: 'window', name: 'GlassProtect Jeweller', desc: 'Бездротовий датчик розбиття скла з мікрофоном', img: 'media/ajax-products/window.webp', price: 2199, qty: (p, f) => (f.indoor ? Math.max(1, p.windows) : 0) },
    { id: 'siren', name: 'HomeSiren Jeweller', desc: 'Бездротова сирена', img: 'media/ajax-products/siren.webp', price: 2199, qty: (p, f) => (f.indoor ? 1 : 0) },
    { id: 'motionout', name: 'MotionProtect Outdoor Jeweller', desc: 'Бездротовий ІЧ датчик руху для використання на вулиці та в приміщенні', img: 'media/ajax-products/c/motionout.webp', price: 6199, qty: (p, f) => (f.outdoor ? 2 : 0) },
    { id: 'hood', name: 'Hood', desc: 'Навіс для захисту системи антимаскування від дощу та снігу', img: 'media/ajax-products/c/hood.webp', price: 429, qty: (p, f) => (f.outdoor ? 0 : -1), showZero: true },
    { id: 'streetsiren', name: 'StreetSiren Jeweller', desc: 'Бездротова сирена для використання в приміщенні й на вулиці', img: 'media/ajax-products/c/streetsiren-b.webp', price: 4399, qty: (p, f) => (f.outdoor ? 1 : 0) },
    { id: 'rexj', name: 'ReX Jeweller', desc: 'Бездротовий ретранслятор радіосигналу', img: 'media/ajax-products/rex.webp', price: 4399, qty: (p, f) => (f.outdoor && p.area > 2000 ? 1 : 0) },
  ];

  const ADDON_CATALOG = [
    { id: 'button', name: 'Button Jeweller', desc: 'Тривожна кнопка виклику допомоги', img: 'media/ajax-products/button.webp', price: 859 },
    { id: 'keypad', name: 'KeyPad Jeweller', desc: 'Клавіатура керування режимами охорони', img: 'media/ajax-products/keypad.webp', price: 2419 },
    { id: 'fire', name: 'FireProtect Jeweller', desc: 'Дим, температура, чадний газ', img: 'media/ajax-products/fire.webp', price: 2069 },
    { id: 'leak', name: 'LeaksProtect Jeweller', desc: 'Прорив труби, протікання техніки', img: 'media/ajax-products/leak.webp', price: 1379 },
    { id: 'socket', name: 'Socket', desc: 'Розумна розетка для автоматизації сценаріїв', img: 'media/ajax-products/socket.webp', price: 1209 },
    { id: 'rex', name: 'ReX 2 Jeweller', desc: 'Підсилювач покриття радіомережі', img: 'media/ajax-products/rex.webp', price: 3449 },
  ];

  const ajaxPicker = document.getElementById('ajaxPicker');
  if (!ajaxPicker) return;

  const ajaxPickerOpen = document.getElementById('ajaxPickerOpen');
  const ajaxPickerClose = document.getElementById('ajaxPickerClose');
  const ajaxPickerBackdrop = document.getElementById('ajaxPickerBackdrop');
  const ajaxPickerContact = document.getElementById('ajaxPickerContact');
  const typeList = document.getElementById('ajaxTypeList');
  const paramList = document.getElementById('ajaxParamList');
  const kitList = document.getElementById('ajaxPickerList');
  const addonList = document.getElementById('ajaxAddonList');
  const addonToggle = document.getElementById('ajaxAddToggle');
  const stepsNav = document.getElementById('ajaxPickerSteps');
  const backBtn = document.getElementById('ajaxPickerBack');
  const nextBtn = document.getElementById('ajaxPickerNext');
  const footer = document.getElementById('ajaxPickerFooter');
  const totalEl = document.getElementById('ajaxPickerTotal');
  const screens = ajaxPicker.querySelectorAll('.ajax-picker-screen');

  const state = {
    step: 1,
    premise: null,
    params: { rooms: 0, entries: 0, windows: 0, floors: 0, area: 0 },
    funcs: {},
    kit: {}, // id -> qty, populated when entering step 3
    generated: false,
  };

  function formatUAH(n) {
    return n.toLocaleString('uk-UA') + ' грн';
  }

  // ---------- Step 1: premise type ----------
  PREMISE_TYPES.forEach((type) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'ajax-type-item';
    row.dataset.id = type.id;
    row.innerHTML = `
      <span class="ajax-type-radio" aria-hidden="true"></span>
      <span class="ajax-type-icon">${type.icon}</span>
      <span class="ajax-type-label">${type.label}</span>
    `;
    row.addEventListener('click', () => {
      state.premise = type.id;
      if (typeof syncFuncRows === 'function') syncFuncRows();
      if (typeof syncParamRows === 'function') syncParamRows();
      typeList.querySelectorAll('.ajax-type-item').forEach((el) => el.classList.remove('is-active'));
      row.classList.add('is-active');
      nextBtn.disabled = false;
    });
    typeList.appendChild(row);
  });

  // ---------- Step 2: functions ----------
  const funcList = document.getElementById('ajaxFuncList');
  const funcRows = [];
  function anyFunc() {
    return FUNCTIONS.some((f) => state.funcs[f.id] && (!f.only || f.only.indexOf(state.premise) >= 0));
  }
  function syncFuncRows() {
    funcRows.forEach((r) => {
      const ok = !r.only || r.only.indexOf(state.premise) >= 0;
      r.el.style.display = ok ? '' : 'none';
      if (!ok) { state.funcs[r.id] = false; r.input.checked = false; r.el.classList.remove('is-checked'); }
    });
  }
  if (funcList) {
    const box = document.createElement('div');
    box.className = 'ajax-func-group is-open';
    box.innerHTML = '<div class="ajax-func-head"><span>Захист від вторгнення</span></div><div class="ajax-func-body"></div>';
    const body = box.querySelector('.ajax-func-body');
    FUNCTIONS.forEach((f) => {
      const row = document.createElement('label');
      row.className = 'ajax-check';
      row.innerHTML = `<input type="checkbox"><span class="ajax-check-box" aria-hidden="true"></span><span class="ajax-check-text"><b>${f.label}</b><em>${f.hint}</em></span>`;
      const input = row.querySelector('input');
      input.addEventListener('change', () => {
        state.funcs[f.id] = input.checked;
        row.classList.toggle('is-checked', input.checked);
        state.generated = false;
        nextBtn.disabled = !anyFunc();
      });
      funcRows.push({ el: row, id: f.id, only: f.only, input });
      body.appendChild(row);
    });
    funcList.appendChild(box);
  }

  // ---------- Step 3: parameters ----------
  const paramRows = [];
  function syncParamRows() {
    paramRows.forEach((r) => {
      const ok = (!r.only || r.only.indexOf(state.premise) >= 0) && (!r.needs || state.funcs[r.needs]);
      r.el.style.display = ok ? '' : 'none';
    });
  }
  PARAMS.forEach((param) => {
    state.params[param.key] = param.def;
    const row = document.createElement('div');
    row.className = 'ajax-param-item';
    paramRows.push({ el: row, only: param.only, needs: param.needs, key: param.key, def: param.def });
    row.innerHTML = `
      <span class="ajax-param-icon">${param.icon}</span>
      <div class="ajax-param-info">
        <h4>${param.label}</h4>
        <span>${param.hint}</span>
      </div>
      <div class="ajax-picker-stepper">
        <button type="button" data-action="minus" aria-label="Менше">−</button>
        <input type="text" inputmode="numeric" value="${param.def}" readonly>
        <button type="button" data-action="plus" aria-label="Більше">+</button>
      </div>
    `;
    const input = row.querySelector('input');
    paramRows[paramRows.length - 1].input = input;
    row.querySelector('[data-action="minus"]').addEventListener('click', () => {
      state.params[param.key] = Math.max(param.min, state.params[param.key] - (param.step || 1));
      input.value = state.params[param.key];
    });
    row.querySelector('[data-action="plus"]').addEventListener('click', () => {
      state.params[param.key] = Math.min(param.max || 10, state.params[param.key] + (param.step || 1));
      input.value = state.params[param.key];
    });
    paramList.appendChild(row);
  });

  // ---------- Step 3: generated kit ----------
  function renderTotal() {
    let total = 0;
    BASE_CATALOG.forEach((p) => { total += p.price * (state.kit[p.id] || 0); });
    ADDON_CATALOG.forEach((p) => { total += p.price * (state.kit[p.id] || 0); });
    totalEl.textContent = formatUAH(total);
  }

  function buildRow(product, qty) {
    const row = document.createElement('div');
    row.className = 'ajax-picker-item';
    row.dataset.id = product.id;
    row.innerHTML = `
      <img class="ajax-picker-item-thumb" src="${product.img.indexOf('data:') === 0 ? product.img : product.img + '?v=' + V}" alt="" aria-hidden="true">
      <div class="ajax-picker-item-info">
        <h4>${product.name}</h4>
        <span>${product.desc}</span>
      </div>
      <div class="ajax-picker-stepper">
        <button type="button" data-action="minus" aria-label="Менше">−</button>
        <input type="text" inputmode="numeric" value="${qty}" readonly>
        <button type="button" data-action="plus" aria-label="Більше">+</button>
      </div>
      <div class="ajax-picker-item-price">
        <b>${formatUAH(product.price * qty)}</b>
      </div>
      <button type="button" class="ajax-picker-item-remove" aria-label="Видалити">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    `;
    const input = row.querySelector('input');
    const priceB = row.querySelector('.ajax-picker-item-price b');
    function sync() {
      input.value = state.kit[product.id];
      priceB.textContent = formatUAH(product.price * state.kit[product.id]);
      renderTotal();
    }
    row.querySelector('[data-action="minus"]').addEventListener('click', () => {
      state.kit[product.id] = Math.max(0, (state.kit[product.id] || 0) - 1);
      sync();
    });
    row.querySelector('[data-action="plus"]').addEventListener('click', () => {
      state.kit[product.id] = Math.min(['motion', 'door', 'window'].indexOf(product.id) >= 0 ? 10 : 50, (state.kit[product.id] || 0) + 1);
      sync();
    });
    row.querySelector('.ajax-picker-item-remove').addEventListener('click', () => {
      delete state.kit[product.id];
      row.remove();
      renderTotal();
    });
    return row;
  }

  function generateKit() {
    kitList.innerHTML = '';
    BASE_CATALOG.forEach((product) => {
      const qty = product.qty(state.params, state.funcs);
      if (qty < 0 || (qty === 0 && !product.showZero)) return;
      state.kit[product.id] = qty;
      kitList.appendChild(buildRow(product, qty));
    });
    renderTotal();
    state.generated = true;
  }

  addonList.innerHTML = '';
  ADDON_CATALOG.forEach((product) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'ajax-addon-item';
    row.innerHTML = `
      <img src="${product.img.indexOf('data:') === 0 ? product.img : product.img + '?v=' + V}" alt="" aria-hidden="true">
      <span class="ajax-addon-info"><b>${product.name}</b><em>${formatUAH(product.price)}</em></span>
      <span class="ajax-addon-plus">+</span>
    `;
    row.addEventListener('click', () => {
      if (kitList.querySelector(`[data-id="${product.id}"]`)) return;
      state.kit[product.id] = 1;
      kitList.appendChild(buildRow(product, 1));
      renderTotal();
    });
    addonList.appendChild(row);
  });
  if (addonToggle) {
    addonToggle.addEventListener('click', () => {
      const hidden = addonList.hasAttribute('hidden');
      if (hidden) addonList.removeAttribute('hidden'); else addonList.setAttribute('hidden', '');
      addonToggle.textContent = hidden ? '− Сховати список' : '+ Додати ще пристрій';
    });
  }

  // ---------- Wizard navigation ----------
  function showStep(n) {
    state.step = n;
    if (n < 4) state.generated = false; // parameters may change, so the kit is rebuilt on the way back
    screens.forEach((s) => s.classList.toggle('is-active', Number(s.dataset.screen) === n));
    stepsNav.querySelectorAll('.ajax-picker-step').forEach((s) => s.classList.toggle('is-active', Number(s.dataset.step) === n));
    backBtn.hidden = n === 1;
    nextBtn.hidden = n === 4;
    footer.hidden = n !== 4;
    if (n === 1) nextBtn.disabled = !state.premise;
    if (n === 2) nextBtn.disabled = !anyFunc();
    if (n === 3) syncParamRows();
    if (n === 4 && !state.generated) generateKit();
    state.maxStep = Math.max(state.maxStep || 1, n);
    stepsNav.querySelectorAll('.ajax-picker-step').forEach((s) => s.classList.toggle('is-reachable', Number(s.dataset.step) <= state.maxStep));
    const dialog = ajaxPicker.querySelector('.ajax-picker-dialog');
    if (dialog) dialog.scrollTop = 0;
  }

  // the step tabs at the top: click to go back (or forward to a step already visited)
  stepsNav.querySelectorAll('.ajax-picker-step').forEach((tab) => {
    tab.setAttribute('role', 'button');
    tab.setAttribute('tabindex', '0');
    const go = () => {
      const n = Number(tab.dataset.step);
      if (n === state.step || n > (state.maxStep || 1)) return;
      showStep(n);
    };
    tab.addEventListener('click', go);
    tab.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });

  nextBtn.addEventListener('click', () => {
    if (state.step === 1 && !state.premise) return;
    if (state.step === 2 && !anyFunc()) return;
    if (state.step < 4) showStep(state.step + 1);
  });
  backBtn.addEventListener('click', () => {
    if (state.step > 1) showStep(state.step - 1);
  });

  // ---------- Open / close ----------
  // every time the calculator is opened everything starts from zero / empty
  function resetAll() {
    state.premise = null;
    state.maxStep = 1;
    state.funcs = {};
    state.kit = {};
    paramRows.forEach((r) => { state.params[r.key] = r.def; r.input.value = r.def; });
    typeList.querySelectorAll('.ajax-type-item').forEach((el) => el.classList.remove('is-active'));
    funcRows.forEach((r) => { r.input.checked = false; r.el.classList.remove('is-checked'); });
    syncFuncRows();
    syncParamRows();
  }
  function openPicker() {
    resetAll();
    ajaxPicker.classList.add('is-open');
    ajaxPicker.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    state.step = 1;
    state.generated = false;
    showStep(1);
  }
  function closePicker() {
    ajaxPicker.classList.remove('is-open');
    ajaxPicker.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (ajaxPickerOpen) ajaxPickerOpen.addEventListener('click', openPicker);
  if (ajaxPickerClose) ajaxPickerClose.addEventListener('click', closePicker);
  if (ajaxPickerBackdrop) ajaxPickerBackdrop.addEventListener('click', closePicker);
  if (ajaxPickerContact) ajaxPickerContact.addEventListener('click', closePicker);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ajaxPicker.classList.contains('is-open')) closePicker();
  });

  var servicesBgVideo = document.querySelector('.services-bg-video');
  if (servicesBgVideo) {
    servicesBgVideo.addEventListener('loadedmetadata', function () {
      servicesBgVideo.playbackRate = 1.6;
    });
    servicesBgVideo.playbackRate = 1.6;
  }

  // Auto-scrolling horizontal carousel (mobile only): slowly drifts sideways
  // on its own, pauses while the user is touching/scrolling it, loops back
  // to the start once it reaches the end.
  function autoScrollCarousel(selector, speed) {
    var el = document.querySelector(selector);
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(max-width: 768px)').matches) return;

    var paused = false;
    var resumeTimer;
    ['touchstart', 'mousedown', 'wheel'].forEach(function (evt) {
      el.addEventListener(evt, function () {
        paused = true;
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function () { paused = false; }, 3500);
      }, { passive: true });
    });

    function step() {
      if (!paused) {
        el.scrollLeft += speed;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  autoScrollCarousel('.reviews-grid', 0.9);
  autoScrollCarousel('.service-grid', 0.9);

  // Arrow buttons for the horizontal carousels (mobile only): services and reviews
  function addCarouselArrows(gridSelector, cardSelector, gap) {
    var grid = document.querySelector(gridSelector);
    if (!grid || !window.matchMedia('(max-width: 768px)').matches) return;
    var wrap = document.createElement('div');
    wrap.className = 'carousel-wrap';
    grid.parentNode.insertBefore(wrap, grid);
    wrap.appendChild(grid);
    function mk(dir) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel-arrow carousel-arrow--' + (dir < 0 ? 'prev' : 'next');
      b.setAttribute('aria-label', dir < 0 ? 'Назад' : 'Вперед');
      b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="' + (dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '"/></svg>';
      b.addEventListener('click', function () {
        grid.dispatchEvent(new Event('touchstart'));
        var card = grid.querySelector(cardSelector);
        var step = card ? card.getBoundingClientRect().width + gap : 232;
        grid.scrollBy({ left: dir * step, behavior: 'smooth' });
      });
      wrap.appendChild(b);
    }
    mk(-1);
    mk(1);
  }
  addCarouselArrows('.service-grid', '.service-card', 14);
  addCarouselArrows('.reviews-grid', '.review-card', 16);
})();


// Mobile: pagination dots under the services and reviews carousels (tap a dot to jump to that card)
(function () {
  if (!window.matchMedia('(max-width: 768px)').matches) return;
  function addDots(gridSel, cardSel, label) {
  var grid = document.querySelector(gridSel);
  if (!grid) return;
  var cards = grid.querySelectorAll(cardSel);
  if (cards.length < 2) return;
  var box = document.createElement('div');
  box.className = 'carousel-dots';
  var list = [];
  function offset(c) { return c.getBoundingClientRect().left - grid.getBoundingClientRect().left + grid.scrollLeft; }
  cards.forEach(function (c, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', label + ' ' + (i + 1));
    b.addEventListener('click', function () {
      grid.dispatchEvent(new Event('touchstart'));
      grid.scrollTo({ left: offset(c), behavior: 'smooth' });
    });
    box.appendChild(b);
    list.push(b);
  });
  grid.parentNode.insertBefore(box, grid.nextSibling);
  function update() {
    var left = grid.scrollLeft, best = 0, bd = 1e9;
    cards.forEach(function (c, i) {
      var d = Math.abs(offset(c) - left);
      if (d < bd) { bd = d; best = i; }
    });
    if (left >= grid.scrollWidth - grid.clientWidth - 2) best = cards.length - 1;
    list.forEach(function (b, i) { b.classList.toggle('is-active', i === best); });
  }
  grid.addEventListener('scroll', update, { passive: true });
  update();
  }
  addDots('.service-grid', '.service-card', 'Послуга');
  addDots('.reviews-grid', '.review-card', 'Відгук');
})();
