import { corsJSON, loadModel, predictWithSimple, readSensors } from '@/lib/server/model';

export async function OPTIONS() {
  return corsJSON({ ok: true });
}

export async function GET() {
  try {
    const model = loadModel();
    const sensors = readSensors();
    const recent = sensors.slice(-100);

    if (!model || recent.length === 0) {
      // Return mock when no data
      return corsJSON({ equipment: [] });
    }

    const grouped = new Map<string, typeof recent>();
    for (const p of recent) {
      const id = p.equipmentId || 'unknown';
      const arr = grouped.get(id) || [];
      arr.push(p);
      grouped.set(id, arr);
    }

    const equipment: any[] = [];
    for (const [id, arr] of grouped.entries()) {
      const last = arr[arr.length - 1];
      const res = predictWithSimple(model, last);
      equipment.push({ id, health_score: res.health_score, failure_probability: res.failure_probability, last });
    }
    return corsJSON({ equipment });
  } catch (e: any) {
    return corsJSON({ error: String(e?.message || e) }, 400);
  }
}


