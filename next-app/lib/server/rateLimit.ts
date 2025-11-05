// Simple per-IP token bucket using /tmp for serverless safety.
import fs from 'node:fs';
import path from 'node:path';

const STORE_PATH = path.join('/tmp', 'ratelimit.json');

type Bucket = { tokens: number; updatedAt: number };

function loadStore(): Record<string, Bucket> {
  try {
    if (fs.existsSync(STORE_PATH)) return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  } catch {}
  return {};
}

function saveStore(store: Record<string, Bucket>) {
  try { fs.writeFileSync(STORE_PATH, JSON.stringify(store)); } catch {}
}

export function getClientIp(req: Request): string {
  // Next.js runtime provides headers: x-forwarded-for
  // @ts-ignore
  const xf = req.headers?.get?.('x-forwarded-for') || '';
  return String(xf).split(',')[0].trim() || 'unknown';
}

export function rateLimit(req: Request, { id = 'default', capacity = 20, refillPerSec = 1 } = {}) {
  const key = `${id}:${getClientIp(req)}`;
  const now = Date.now();
  const store = loadStore();
  const bucket = store[key] || { tokens: capacity, updatedAt: now };

  // Refill tokens
  const elapsed = (now - bucket.updatedAt) / 1000;
  bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * refillPerSec);
  bucket.updatedAt = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    store[key] = bucket;
    saveStore(store);
    return { allowed: true };
  } else {
    store[key] = bucket;
    saveStore(store);
    return { allowed: false, retryAfter: Math.ceil((1 - bucket.tokens) / refillPerSec) };
  }
}


