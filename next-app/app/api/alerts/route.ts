import { corsJSON, loadModel, predictWithSimple, readSensors } from '@/lib/server/model';

export async function OPTIONS() {
  return corsJSON({ ok: true });
}

export async function GET() {
  try {
    const model = loadModel();
    const sensors = readSensors();
    const alerts: any[] = [];
    if (model) {
      const recent = sensors.slice(-200);
      for (const p of recent) {
        const res = predictWithSimple(model, p as any);
        if (res.failure_probability >= 0.7) {
          alerts.push({
            equipment: p.equipmentId || 'unknown',
            severity: 'critical',
            message: 'High failure risk detected',
            probability: res.failure_probability,
            time: p.timestamp || new Date().toISOString(),
          });
        } else if (res.failure_probability >= 0.4) {
          alerts.push({
            equipment: p.equipmentId || 'unknown',
            severity: 'warning',
            message: 'Elevated risk observed',
            probability: res.failure_probability,
            time: p.timestamp || new Date().toISOString(),
          });
        }
      }
    }
    return corsJSON({ alerts });
  } catch (e: any) {
    return corsJSON({ error: String(e?.message || e) }, 400);
  }
}


