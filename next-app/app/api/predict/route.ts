import { corsJSON, loadModel, predictWithSimple } from '@/lib/server/model';
import { rateLimit } from '@/lib/server/rateLimit';

export async function OPTIONS() {
  return corsJSON({ ok: true });
}

export async function GET(req: Request) {
  try {
    const rl = rateLimit(req, { id: 'predict', capacity: 30, refillPerSec: 0.5 });
    if (!rl.allowed) return corsJSON({ error: 'Rate limit exceeded' }, 429);
    const { searchParams } = new URL(req.url);
    const temperature = Number(searchParams.get('temperature'));
    const vibration = Number(searchParams.get('vibration'));
    const pressure = Number(searchParams.get('pressure'));
    const current = Number(searchParams.get('current'));

    if ([temperature, vibration, pressure, current].some((v) => Number.isNaN(v))) {
      return corsJSON({ error: 'Missing or invalid query params: temperature, vibration, pressure, current' }, 400);
    }

    const model = loadModel();
    if (!model) return corsJSON({ error: 'Model not trained' }, 400);

    const result = predictWithSimple(model, { temperature, vibration, pressure, current });
    return corsJSON({ ...result });
  } catch (e: any) {
    return corsJSON({ error: String(e?.message || e) }, 400);
  }
}


