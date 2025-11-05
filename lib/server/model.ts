import fs from 'node:fs';
import path from 'node:path';

export type SensorPoint = {
  temperature: number;
  vibration: number;
  pressure: number;
  current: number;
  failure?: boolean;
  equipmentId?: string;
  timestamp?: string;
};

export type SimpleModel = {
  features: Array<keyof SensorPoint>;
  mean: Record<string, number>;
  std: Record<string, number>;
};

const PUBLIC_MODEL_PATH = path.join(process.cwd(), 'next-app', 'public', 'model.json');
const TMP_MODEL_PATH = path.join('/tmp', 'model.json');
const TMP_DB_PATH = path.join('/tmp', 'sensor-readings.json');

function safeWriteJSON(targetPath: string, data: unknown): boolean {
  try {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, JSON.stringify(data));
    return true;
  } catch (_) {
    return false;
  }
}

export function saveModel(model: SimpleModel): void {
  // Try to write to public, fallback to /tmp (Vercel writable)
  if (!safeWriteJSON(PUBLIC_MODEL_PATH, model)) {
    safeWriteJSON(TMP_MODEL_PATH, model);
  }
}

export function loadModel(): SimpleModel | null {
  const candidates = [TMP_MODEL_PATH, PUBLIC_MODEL_PATH];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8');
        return JSON.parse(raw) as SimpleModel;
      }
    } catch (_) {}
  }
  return null;
}

export function trainSimpleModel(points: SensorPoint[]): SimpleModel {
  const features: Array<keyof SensorPoint> = ['temperature', 'vibration', 'pressure', 'current'];
  const mean: Record<string, number> = {};
  const std: Record<string, number> = {};

  for (const f of features) {
    const vals = points.map(p => Number(p[f]));
    const m = vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
    const v = vals.reduce((a, b) => a + (b - m) * (b - m), 0) / Math.max(1, vals.length);
    mean[String(f)] = m;
    std[String(f)] = Math.sqrt(v) || 1;
  }

  const model: SimpleModel = { features, mean, std };
  saveModel(model);
  return model;
}

export function predictWithSimple(model: SimpleModel, point: SensorPoint) {
  // Convert z-score distance into a pseudo risk probability
  let zsum = 0;
  for (const f of model.features) {
    const m = model.mean[String(f)];
    const s = model.std[String(f)] || 1;
    const v = Number(point[f]);
    const z = Math.abs((v - m) / s);
    zsum += isFinite(z) ? z : 0;
  }
  const risk = Math.max(0, Math.min(1, zsum / (model.features.length * 2))); // ~0..1
  const failure_probability = Number(risk.toFixed(3));
  const health_score = Number(((1 - failure_probability) * 100).toFixed(1));
  return { failure_probability, health_score };
}

export function appendSensor(point: SensorPoint) {
  let arr: SensorPoint[] = [];
  try {
    if (fs.existsSync(TMP_DB_PATH)) {
      arr = JSON.parse(fs.readFileSync(TMP_DB_PATH, 'utf8'));
    }
  } catch (_) {}
  arr.push({ ...point, timestamp: point.timestamp || new Date().toISOString() });
  safeWriteJSON(TMP_DB_PATH, arr);
}

export function readSensors(): SensorPoint[] {
  try {
    if (fs.existsSync(TMP_DB_PATH)) {
      return JSON.parse(fs.readFileSync(TMP_DB_PATH, 'utf8'));
    }
  } catch (_) {}
  return [];
}

export function corsJSON(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}


