import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TF_BASE = 'https://tensorfeed.ai';
const PORT = process.env.PORT || 8787;
const CACHE_TTL_MS = 5 * 60 * 1000;

/** @type {Map<string, { data: unknown; expires: number; headers: Record<string, string>; status: number }>} */
const cache = new Map();

const STATUS_TTL_MS = 2 * 60 * 1000;

function getTtl(pathname) {
  if (pathname.includes('/status') || pathname.includes('/free-tier')) {
    return STATUS_TTL_MS;
  }
  if (pathname.includes('/preview/') || pathname.includes('/premium/')) {
    return 0; // never cache premium — trial quota is per-IP
  }
  return CACHE_TTL_MS;
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress?.replace('::ffff:', '') ?? '127.0.0.1';
}

async function fetchTensorFeed(pathname, search = '', ip = null) {
  const cacheKey = `${pathname}${search}|${ip ?? 'default'}`;
  const now = Date.now();
  const ttl = getTtl(pathname);
  const cached = cache.get(cacheKey);
  if (cached && ttl > 0 && cached.expires > now) {
    return { ...cached, fromCache: true };
  }

  const url = `${TF_BASE}${pathname}${search}`;
  const headers = { 'User-Agent': 'AIPulse/1.0' };
  if (ip) {
    headers['X-Forwarded-For'] = ip;
    headers['X-Real-IP'] = ip;
  }

  const res = await fetch(url, { headers });
  const contentType = res.headers.get('content-type') || 'application/json';
  const body = contentType.includes('json') ? await res.json() : await res.text();

  const forwardHeaders = {};
  for (const h of [
    'x-tf-free-trial',
    'x-tf-free-trial-used',
    'x-tf-free-trial-remaining',
    'x-tf-free-trial-resets-at',
  ]) {
    const v = res.headers.get(h);
    if (v) forwardHeaders[h] = v;
  }

  const entry = {
    data: body,
    status: res.status,
    headers: forwardHeaders,
    expires: now + ttl,
    fromCache: false,
  };

  if (res.ok && ttl > 0) {
    cache.set(cacheKey, entry);
  }

  return entry;
}

const app = express();

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'ai-pulse-proxy', cacheSize: cache.size });
});

app.get('/api/brief', async (req, res) => {
  try {
    const ip = clientIp(req);
    const [today, status, actionCards] = await Promise.all([
      fetchTensorFeed('/api/today', '?limit=5', ip),
      fetchTensorFeed('/api/status', '', ip),
      fetchTensorFeed('/api/news/action-cards', '', ip),
    ]);
    res.set('X-Cache', today.fromCache && status.fromCache ? 'HIT' : 'MISS');
    res.json({
      ok: true,
      generated_at: new Date().toISOString(),
      today: today.data,
      status: status.data,
      actionCards: actionCards.data,
    });
  } catch (err) {
    res.status(502).json({ ok: false, error: String(err) });
  }
});

app.use('/api', async (req, res) => {
  try {
    const pathname = `/api${req.path}`;
    const search = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const ip = clientIp(req);
    const result = await fetchTensorFeed(pathname, search, ip);

    for (const [k, v] of Object.entries(result.headers)) {
      res.set(k, v);
    }
    res.set('X-Cache', result.fromCache ? 'HIT' : 'MISS');
    res.status(result.status).json(result.data);
  } catch (err) {
    res.status(502).json({ ok: false, error: String(err) });
  }
});

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(404).json({ ok: false, error: 'Not found' });
  });
});

app.listen(PORT, () => {
  console.log(`AI Pulse proxy listening on http://localhost:${PORT}`);
});
