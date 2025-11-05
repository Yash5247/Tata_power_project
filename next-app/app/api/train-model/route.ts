import { corsJSON, trainSimpleModel } from '@/lib/server/model';

export async function OPTIONS() {
  return corsJSON({ ok: true });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!Array.isArray(body) || body.length === 0) {
      return corsJSON({ error: 'Body must be a non-empty array of sensor points' }, 400);
    }
    const cleaned = body.map((p) => ({
      temperature: Number(p.temperature),
      vibration: Number(p.vibration),
      pressure: Number(p.pressure),
      current: Number(p.current),
      failure: p.failure === true,
      equipmentId: typeof p.equipmentId === 'string' ? p.equipmentId : undefined,
    }));
    const model = trainSimpleModel(cleaned);
    return corsJSON({ message: 'Model trained', model });
  } catch (e: any) {
    return corsJSON({ error: String(e?.message || e) }, 400);
  }
}


