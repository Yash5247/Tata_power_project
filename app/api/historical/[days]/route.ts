import { corsJSON, readSensors } from '@/lib/server/model';

export async function OPTIONS() {
  return corsJSON({ ok: true });
}

export async function GET(req: Request, context: { params: { days?: string } }) {
  try {
    const daysNum = Number(context.params?.days || '1');
    if (!Number.isFinite(daysNum) || daysNum <= 0 || daysNum > 365) {
      return corsJSON({ error: 'days must be a number between 1 and 365' }, 400);
    }
    const { searchParams } = new URL(req.url);
    const equipmentId = searchParams.get('equipmentId') || undefined;
    const since = Date.now() - daysNum * 24 * 60 * 60 * 1000;
    const readings = readSensors().filter(r => {
      const t = r.timestamp ? Date.parse(r.timestamp) : Date.now();
      const eqOk = equipmentId ? (r.equipmentId === equipmentId) : true;
      return t >= since && eqOk;
    });
    // Aggregate hourly avg for quick charting
    const buckets = new Map<string, { count: number; temperature: number; vibration: number; pressure: number; current: number }>();
    for (const r of readings) {
      const d = r.timestamp ? new Date(r.timestamp) : new Date();
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).toISOString();
      const entry = buckets.get(key) || { count: 0, temperature: 0, vibration: 0, pressure: 0, current: 0 };
      entry.count += 1;
      entry.temperature += Number(r.temperature);
      entry.vibration += Number(r.vibration);
      entry.pressure += Number(r.pressure);
      entry.current += Number(r.current);
      buckets.set(key, entry);
    }
    const series = Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([t, v]) => ({
      timestamp: t,
      temperature: Number((v.temperature / v.count).toFixed(2)),
      vibration: Number((v.vibration / v.count).toFixed(2)),
      pressure: Number((v.pressure / v.count).toFixed(2)),
      current: Number((v.current / v.count).toFixed(2)),
    }));
    return corsJSON({ series });
  } catch (e: any) {
    return corsJSON({ error: String(e?.message || e) }, 400);
  }
}


