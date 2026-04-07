import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'kamp-veritabani.txt');
const PORT = Number(process.env.CAMP_SYNC_PORT || 3847);

const defaultBody = () =>
  JSON.stringify(
    { passwordOk: false, entries: [], updatedAt: new Date().toISOString() },
    null,
    2
  );

async function ensureFile() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, defaultBody(), 'utf8');
  }
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, '');
    return;
  }

  const url = req.url?.split('?')[0] || '';

  if (url === '/api/camp' && req.method === 'GET') {
    try {
      await ensureFile();
      const raw = await fs.readFile(DATA_FILE, 'utf8');
      send(res, 200, raw, 'application/json; charset=utf-8');
    } catch (e) {
      send(res, 500, String(e));
    }
    return;
  }

  if (url === '/api/camp' && req.method === 'PUT') {
    let body = '';
    try {
      for await (const chunk of req) body += chunk;
      JSON.parse(body);
      await ensureFile();
      await fs.writeFile(DATA_FILE, body, 'utf8');
      send(res, 200, JSON.stringify({ ok: true }), 'application/json; charset=utf-8');
    } catch (e) {
      send(res, 400, JSON.stringify({ ok: false, error: String(e) }), 'application/json; charset=utf-8');
    }
    return;
  }

  send(res, 404, 'Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[camp-sync] ${DATA_FILE}`);
  console.log(`[camp-sync] http://127.0.0.1:${PORT}/api/camp`);
});
