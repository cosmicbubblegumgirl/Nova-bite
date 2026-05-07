const app = document.querySelector('#app');
const asset = (path) => new URL(path, import.meta.url).href;
const apiBase = (window.NOVABITE_API_URL || '').replace(/\/$/, '');

const images = [
  asset('assets/dish-1.jpg'),
  asset('assets/dish-2.jpg'),
  asset('assets/dish-3.jpg'),
  asset('assets/dish-4.jpg'),
  asset('assets/dish-5.jpg'),
  asset('assets/dish-6.jpg'),
  asset('assets/dish-7.jpg'),
  asset('assets/dish-8.jpg'),
  asset('assets/dish-9.jpg'),
  asset('assets/dish-10.jpg'),
];

const starters = ['Citrus scallop', 'Smoked beet tartare', 'Saffron arancini', 'Charcoal aubergine', 'Oyster leaf toast', 'Miso pumpkin silk', 'Yuzu tuna', 'Wild mushroom chawanmushi', 'Pear burrata', 'Cured trout rose'];
const mains = ['Wagyu with black garlic', 'Butter-poached lobster', 'Duck with cherry jus', 'Truffle risotto', 'Line fish with fennel', 'Lamb with preserved lemon', 'Miso-glazed cod', 'Porcini agnolotti', 'Venison with cacao', 'Cauliflower steak au poivre'];
const desserts = ['Honey saffron tart', 'Dark chocolate soil', 'Rooibos panna cotta', 'Lemon verbena cloud', 'Fig leaf gelato', 'Rose pavlova', 'Malted caramel souffle', 'Pistachio olive cake', 'Coconut lime sphere', 'Cherry kirsch gateau'];
const pairings = ['Cap Classique flight', 'Rare tea ceremony', 'Old-world cellar pairing', 'Low-intervention wine arc', 'Zero-proof botanical flight'];
const moods = ['Moonlit Citrus', 'Velvet Ember', 'Garden After Rain', 'Black Garlic Opera', 'Saffron Tide', 'Juniper Nocturne', 'Harvest Velvet', 'Pearl Smoke', 'Copper Orchard'];
const courseImages = {
  Opening: [asset('assets/dish-3.jpg'), asset('assets/dish-4.jpg'), asset('assets/dish-7.jpg'), asset('assets/dish-8.jpg'), asset('assets/dish-9.jpg')],
  Centerpiece: [asset('assets/dish-1.jpg'), asset('assets/dish-2.jpg'), asset('assets/dish-5.jpg'), asset('assets/dish-6.jpg'), asset('assets/dish-10.jpg')],
  Finale: [asset('assets/dish-4.jpg'), asset('assets/dish-7.jpg'), asset('assets/dish-8.jpg'), asset('assets/dish-9.jpg'), asset('assets/dish-3.jpg')],
};

const tastingMenus = Array.from({ length: 45 }, (_, index) => {
  const mood = moods[index % moods.length];
  const starter = starters[index % starters.length];
  const main = mains[(index * 2) % mains.length];
  const dessert = desserts[(index * 3) % desserts.length];
  return {
    id: `menu-${index + 1}`,
    name: `${mood} ${index + 1}`,
    price: 1750 + (index % 9) * 330,
    time: `${90 + (index % 4) * 15} min`,
    image: courseImages.Centerpiece[(index * 2) % courseImages.Centerpiece.length],
    courses: [
      { type: 'Opening', name: starter, image: courseImages.Opening[index % courseImages.Opening.length], note: 'A precise first impression with texture, acidity, and theatrical plating.' },
      { type: 'Centerpiece', name: main, image: courseImages.Centerpiece[(index * 2) % courseImages.Centerpiece.length], note: 'The emotional core of the menu, finished tableside by the chef.' },
      { type: 'Finale', name: dessert, image: courseImages.Finale[(index * 3) % courseImages.Finale.length], note: 'A composed finish with fragrance, contrast, and a quiet reveal.' },
    ],
    pairing: pairings[index % pairings.length],
  };
});

const packages = [
  ['Velvet Birthday Circle', 7800, 'Cake reveal, candle course, table florals, and a private toast.'],
  ['The Hidden Ring Proposal', 12800, 'Chef-coordinated ring reveal inside a selected final course.'],
  ['Midnight Anniversary Table', 9800, 'Late seating, champagne arrival, and a printed memory menu.'],
  ['Chef Counter Premiere', 6900, 'Front-row counter seats with chef narration across six courses.'],
  ['Sommelier After Dark', 8400, 'Cellar-led tasting with rare pairings and tasting notes.'],
  ['Golden Family Table', 9500, 'Shared celebration menu with private host and photo moment.'],
  ['Boardroom to Banquet', 11200, 'Executive dining with quiet service and timed courses.'],
  ['Garden Vow Dinner', 13800, 'Floral arch table, proposal pacing, and dessert reveal.'],
  ['First Date Cinema', 5900, 'Two-seat tasting with soft pacing and conversation cards.'],
  ['The Signature Debut', 8700, 'New menu premiere with chef meet-and-greet.'],
  ['Afterparty Supper Club', 10500, 'Late-night private dining with snack courses and cocktails.'],
  ['The Collector Cellar', 16500, 'Cellar reserve pairings and chef-selected luxury supplements.'],
  ['Sunday Family Heirloom', 7200, 'Warm shared courses inspired by nostalgic family dining.'],
  ['The Diamond Dessert', 13200, 'Dessert course designed for jewelry, vows, or a surprise note.'],
  ['Moon Room Private Hire', 23000, 'Private room, full tasting flow, dedicated host, and music control.'],
  ['Kitchen Door Mystery', 8200, 'Blind tasting menu with clue cards and chef reveals.'],
  ['The Portrait Dinner', 9300, 'Photographer-friendly plating moments and keepsake menu cards.'],
  ['The Nocturne Escape', 11800, 'Candlelit tasting with midnight palate cleanser and digestif.'],
].map(([name, price, detail], index) => ({ id: `package-${index + 1}`, name, price, detail }));

let selectedMenu = tastingMenus[0];
let selectedCourse = selectedMenu.courses[0];
let selectedBuilder = [];
let token = localStorage.getItem('novabite_token') || '';
let activeUser = JSON.parse(localStorage.getItem('novabite_user') || 'null');
const demoState = JSON.parse(localStorage.getItem('novabite_demo_state') || '{"bookings":[],"customMenus":[]}');

function saveDemoState() {
  localStorage.setItem('novabite_demo_state', JSON.stringify(demoState));
}

async function api(path, options = {}) {
  const endpoint = apiBase ? `${apiBase}${path}` : path.replace(/^\//, '');
  try {
    const response = await fetch(endpoint, options);
    if (response.ok || response.status !== 404) return response;
  } catch {
    // Static public hosting has no Node API server; use the demo fallback below.
  }

  const method = (options.method || 'GET').toUpperCase();
  const payload = options.body ? JSON.parse(options.body) : {};
  let body;
  let status = 200;

  if (path === '/api/site') {
    body = {
      metrics: [
        { label: 'Tonight', value: String(18 - Math.min(demoState.bookings.length, 12)), detail: 'open tasting seats' },
        { label: 'Menus', value: '45', detail: 'curated tasting journeys' },
        { label: 'Packages', value: '18', detail: 'private dining moments' },
      ],
      activity: [
        ...demoState.bookings.slice(-2).map((item) => `${item.menu} booked for ${item.guests || 2} guests`),
        ...demoState.customMenus.slice(-2).map((item) => `${item.title} moved to chef review`),
        'Chef Amara released the Moonlit Citrus tasting menu',
      ].slice(0, 5),
    };
  } else if ((path === '/api/register' || path === '/api/login') && method === 'POST') {
    if (!payload.email || !payload.password || (path === '/api/register' && !payload.name)) {
      status = 400;
      body = { error: 'Name, email, and password are required' };
    } else {
      body = {
        token: `demo-${Date.now()}`,
        user: { id: 'demo-user', name: payload.name || payload.email.split('@')[0], email: payload.email },
      };
    }
  } else if (path === '/api/custom-menus' && method === 'POST') {
    if (!token) {
      status = 401;
      body = { error: 'Create an account or log in before saving a menu' };
    } else {
      const menu = { id: `menu-${Date.now()}`, createdAt: new Date().toISOString(), ...payload };
      demoState.customMenus.push(menu);
      saveDemoState();
      body = { ok: true, menu };
    }
  } else if (path === '/api/bookings' && method === 'POST') {
    if (!token) {
      status = 401;
      body = { error: 'Create an account or log in before booking' };
    } else {
      const booking = { id: `booking-${Date.now()}`, createdAt: new Date().toISOString(), ...payload };
      demoState.bookings.push(booking);
      saveDemoState();
      body = { ok: true, booking };
    }
  } else {
    status = 404;
    body = { error: 'Demo API route not found' };
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function money(value) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(value);
}

function nav() {
  return `
    <nav class="nav">
      <a class="brand" href="#top"><img class="brand-logo" src="${asset('assets/logo.svg')}" alt="NovaBite logo" />NovaBite</a>
      <div class="nav-links">
        <a href="#menus">45 Menus</a>
        <a href="#table">Chef Table</a>
        <a href="#packages">Packages</a>
        <a href="#portal">Portal</a>
      </div>
      <a class="nav-cta" href="#portal">${activeUser ? activeUser.name : 'Book ahead'}</a>
    </nav>
  `;
}

function hero() {
  return `
    <section id="top" class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Cinematic fine dining reservation system</span>
        <h1>Tasting menus staged like theatre, booked like a luxury concierge.</h1>
        <p>Explore 45 tasting journeys, click through courses on an animated table, build your own menu, create an account, and reserve premium packages in advance.</p>
        <div class="hero-actions">
          <a class="cta" href="#table">Open tasting table</a>
          <a class="ghost" href="#portal">Create portal account</a>
        </div>
      </div>
      <div class="hero-media">
        <img src="${images[0]}" alt="Elegant restaurant table setting" />
        <div class="floating-card">
          <span>Tonight's chef note</span>
          <b>Black garlic, citrus smoke, candlelit service.</b>
        </div>
      </div>
    </section>
  `;
}

function story() {
  return `
    <section class="section story">
      <div>
        <span class="eyebrow">Chef storytelling</span>
        <h2>Every course has a reason to arrive.</h2>
      </div>
      <div class="story-grid">
        <article><img src="${images[7]}" alt="Chef preparing plated food" /><h3>Chef Amara Vale</h3><p>Known for smoke, citrus, and quiet drama, Amara builds menus around memory: first scent, first cut, final note.</p></article>
        <article><img src="${images[8]}" alt="Premium restaurant interior" /><h3>The room</h3><p>Low light, warm brass, slow service, and a table rhythm designed for proposals, birthdays, and once-a-year dinners.</p></article>
      </div>
    </section>
  `;
}

function menuCard(menu) {
  return `
    <article class="menu-card ${menu.id === selectedMenu.id ? 'active' : ''}" data-menu="${menu.id}">
      <div class="menu-photo">
        <img src="${menu.image}" alt="${menu.name} centerpiece dish" />
      </div>
      <div>
        <span>${menu.time} &middot; ${menu.pairing}</span>
        <h3>${menu.name}</h3>
        <p>${menu.courses.map((course) => course.name).join(' / ')}</p>
        <div class="course-thumbs">
          ${menu.courses.map((course) => `<img src="${course.image}" alt="${course.name}" title="${course.type}: ${course.name}" />`).join('')}
        </div>
        <b>${money(menu.price)} per guest</b>
      </div>
    </article>
  `;
}

function menus() {
  return `
    <section id="menus" class="section menus">
      <div class="section-header">
        <span class="eyebrow">45 tasting menus</span>
        <h2>Choose the mood. Then let the table perform.</h2>
        <p>Each menu has three core courses, a pairing style, a duration, and a live booking price.</p>
      </div>
      <div class="menu-grid">${tastingMenus.map(menuCard).join('')}</div>
    </section>
  `;
}

function tableExperience() {
  return `
    <section id="table" class="section table-section">
      <div class="section-header">
        <span class="eyebrow">Interactive chef table</span>
        <h2>Click a course. Watch the plate change.</h2>
      </div>
      <div class="table-layout">
        <div class="dining-table">
          <div class="table-top">
            <button class="plate" id="plate-button" aria-label="Current plated course">
              <img src="${selectedCourse.image}" alt="${selectedCourse.name}" />
              <span>${selectedCourse.type}</span>
            </button>
            <div class="cutlery left"></div>
            <div class="cutlery right"></div>
          </div>
        </div>
        <div class="course-panel">
          <span class="eyebrow">${selectedMenu.name}</span>
          <h3>${selectedCourse.name}</h3>
          <p>${selectedCourse.note}</p>
          <div class="course-buttons">
            ${selectedMenu.courses.map((course) => `<button class="${course.name === selectedCourse.name ? 'active' : ''}" data-course="${course.name}">${course.type}</button>`).join('')}
          </div>
          <button class="cta add-builder" data-builder="${selectedCourse.name}">Add this course to my custom menu</button>
        </div>
      </div>
    </section>
  `;
}

function packagesSection() {
  return `
    <section id="packages" class="section packages">
      <div class="section-header">
        <span class="eyebrow">18 private dining packages</span>
        <h2>Book the occasion before the story begins.</h2>
      </div>
      <div class="package-grid">
        ${packages.map((item) => `
          <article class="package-card">
            <span>${money(item.price)} deposit</span>
            <h3>${item.name}</h3>
            <p>${item.detail}</p>
            <button data-package="${item.id}">Reserve package</button>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function portal() {
  return `
    <section id="portal" class="section portal">
      <div class="section-header">
        <span class="eyebrow">Member portal</span>
        <h2>Create an account, build a tasting, book ahead.</h2>
      </div>
      <div class="portal-grid">
        <form class="portal-card" id="auth-form">
          <h3>${activeUser ? `Welcome, ${activeUser.name}` : 'Create account / login'}</h3>
          <input name="name" placeholder="Name" value="${activeUser?.name || ''}" />
          <input name="email" type="email" placeholder="Email" value="${activeUser?.email || ''}" required />
          <input name="password" type="password" placeholder="Password" required />
          <div class="button-row">
            <button name="mode" value="register">Create account</button>
            <button name="mode" value="login">Login</button>
          </div>
          <p id="auth-status">${activeUser ? 'You can save custom menus and book packages.' : 'Account is required before booking.'}</p>
        </form>
        <div class="portal-card builder">
          <h3>Custom tasting builder</h3>
          <p>Select courses from any tasting menu, then save your desired experience for chef review.</p>
          <div id="builder-list">${selectedBuilder.length ? selectedBuilder.map((item) => `<span>${item}</span>`).join('') : '<em>No courses selected yet.</em>'}</div>
          <form id="custom-menu-form">
            <input name="title" placeholder="Menu name, e.g. Our Anniversary Firelight" required />
            <input name="date" type="date" required />
            <button>Save custom menu</button>
          </form>
          <p id="builder-status"></p>
        </div>
        <form class="portal-card" id="booking-form">
          <h3>Advance booking</h3>
          <input name="date" type="date" required />
          <input name="guests" type="number" min="1" max="24" placeholder="Guests" required />
          <select name="menu">${tastingMenus.map((menu) => `<option value="${menu.name}">${menu.name} &middot; ${money(menu.price)}</option>`).join('')}</select>
          <select name="package">${packages.map((item) => `<option value="${item.name}">${item.name} &middot; ${money(item.price)}</option>`).join('')}</select>
          <button>Book tasting</button>
          <p id="booking-status"></p>
        </form>
      </div>
    </section>
  `;
}

function liveData() {
  return `
    <section id="live-data" class="section live-band">
      <div class="section-header">
        <span class="eyebrow">Live reservation API</span>
        <h2>Operational layer for tastings, accounts, and bookings.</h2>
      </div>
      <div class="metrics" id="metrics"></div>
      <div class="ops-panel"><b>Kitchen activity</b><ul id="activity"></ul></div>
    </section>
  `;
}

function render() {
  app.innerHTML = `<div class="site restaurant">${nav()}${hero()}${story()}${menus()}${tableExperience()}${packagesSection()}${portal()}${liveData()}${footer()}</div>`;
  wire();
  loadApi();
}

function footer() {
  return `
    <footer class="site-footer">
      <div>
        <span>NovaBite</span>
        <p>Cinematic tasting menus, velvet reservations, and a dining room that knows how to make an entrance.</p>
      </div>
      <strong>A Quantum Cupcake Creation</strong>
    </footer>
  `;
}

function wire() {
  document.querySelectorAll('[data-menu]').forEach((card) => {
    card.addEventListener('click', () => {
      selectedMenu = tastingMenus.find((menu) => menu.id === card.dataset.menu);
      selectedCourse = selectedMenu.courses[0];
      render();
      document.querySelector('#table').scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.querySelectorAll('[data-course]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedCourse = selectedMenu.courses.find((course) => course.name === button.dataset.course);
      render();
      document.querySelector('#table').scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.querySelectorAll('[data-builder]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!selectedBuilder.includes(button.dataset.builder)) selectedBuilder.push(button.dataset.builder);
      render();
      document.querySelector('#portal').scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.querySelectorAll('[data-package]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector('[name="package"]').value = packages.find((item) => item.id === button.dataset.package).name;
      document.querySelector('#portal').scrollIntoView({ behavior: 'smooth' });
    });
  });

  document.querySelector('#auth-form').addEventListener('submit', auth);
  document.querySelector('#custom-menu-form').addEventListener('submit', saveCustomMenu);
  document.querySelector('#booking-form').addEventListener('submit', bookTasting);
}

async function auth(event) {
  event.preventDefault();
  const submitter = event.submitter;
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  const endpoint = submitter.value === 'login' ? '/api/login' : '/api/register';
  const response = await api(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok) {
    document.querySelector('#auth-status').textContent = data.error;
    return;
  }
  token = data.token;
  activeUser = data.user;
  localStorage.setItem('novabite_token', token);
  localStorage.setItem('novabite_user', JSON.stringify(activeUser));
  render();
}

async function saveCustomMenu(event) {
  event.preventDefault();
  const status = document.querySelector('#builder-status');
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  payload.courses = selectedBuilder;
  const response = await api('/api/custom-menus', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  const data = await response.json();
  status.textContent = response.ok ? 'Custom menu saved for chef review.' : data.error;
  if (response.ok) loadApi();
}

async function bookTasting(event) {
  event.preventDefault();
  const status = document.querySelector('#booking-status');
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  const response = await api('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  const data = await response.json();
  status.textContent = response.ok ? 'Booking request confirmed. Concierge will prepare your tasting.' : data.error;
  if (response.ok) loadApi();
}

async function loadApi() {
  const response = await api('/api/site');
  const data = await response.json();
  document.querySelector('#metrics').innerHTML = data.metrics.map((metric) => `<article class="metric"><span>${metric.label}</span><strong>${metric.value}</strong><p>${metric.detail}</p></article>`).join('');
  document.querySelector('#activity').innerHTML = data.activity.map((item) => `<li>${item}</li>`).join('');
}

render();
