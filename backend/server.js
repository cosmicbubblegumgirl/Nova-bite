import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const port = Number(process.env.PORT || 4201);

const users = [];
const sessions = new Map();
const bookings = [];
const customMenus = [];

const siteData = {
  metrics: [
    { label: 'Tonight', value: '18', detail: 'open tasting seats' },
    { label: 'Menus', value: '45', detail: 'curated tasting journeys' },
    { label: 'Packages', value: '18', detail: 'private dining moments' },
  ],
  activity: [
    'Chef Amara released the Moonlit Citrus tasting menu',
    'Proposal package booked for the velvet alcove',
    'Two custom menus moved to sommelier pairing review',
  ],
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function getUser(req) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  const userId = sessions.get(token);
  return users.find((user) => user.id === userId);
}

async function serveStatic(req, res) {
  if (!existsSync(publicDir)) {
    sendJson(res, 404, { error: 'No frontend files found' });
    return;
  }

  const requestPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(publicDir, safePath === '/' ? 'index.html' : safePath);

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch {
    filePath = path.join(publicDir, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
  };

  const content = await readFile(filePath);
  res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
  res.end(content);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true, site: 'novabite', bookings: bookings.length, customMenus: customMenus.length });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/site') {
    sendJson(res, 200, { ...siteData, bookings: bookings.length, customMenus: customMenus.length });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/register') {
    const payload = JSON.parse(await readBody(req) || '{}');
    if (!payload.email || !payload.password || !payload.name) {
      sendJson(res, 400, { error: 'Name, email, and password are required' });
      return;
    }
    let user = users.find((item) => item.email === payload.email);
    if (!user) {
      user = { id: randomUUID(), name: payload.name, email: payload.email, password: payload.password };
      users.push(user);
    }
    const token = randomUUID();
    sessions.set(token, user.id);
    sendJson(res, 201, { token, user: { id: user.id, name: user.name, email: user.email } });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/login') {
    const payload = JSON.parse(await readBody(req) || '{}');
    const user = users.find((item) => item.email === payload.email && item.password === payload.password);
    if (!user) {
      sendJson(res, 401, { error: 'Invalid email or password' });
      return;
    }
    const token = randomUUID();
    sessions.set(token, user.id);
    sendJson(res, 200, { token, user: { id: user.id, name: user.name, email: user.email } });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/bookings') {
    const user = getUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Create an account or log in before booking' });
      return;
    }
    const payload = JSON.parse(await readBody(req) || '{}');
    const booking = { id: randomUUID(), userId: user.id, createdAt: new Date().toISOString(), ...payload };
    bookings.push(booking);
    sendJson(res, 201, { ok: true, booking });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/custom-menus') {
    const user = getUser(req);
    if (!user) {
      sendJson(res, 401, { error: 'Create an account or log in before saving a menu' });
      return;
    }
    const payload = JSON.parse(await readBody(req) || '{}');
    const menu = { id: randomUUID(), userId: user.id, createdAt: new Date().toISOString(), ...payload };
    customMenus.push(menu);
    sendJson(res, 201, { ok: true, menu });
    return;
  }

  await serveStatic(req, res);
});

server.listen(port, () => console.log(`NovaBite running on http://localhost:${port}`));
