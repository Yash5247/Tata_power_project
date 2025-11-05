import { NextResponse } from 'next/server';
import { appendSensor, corsJSON } from '@/lib/server/model';

export async function GET() {
  const now = new Date();
  const data = {
    timestamp: now.toISOString(),
    temperature: Number((60 + Math.random() * 10).toFixed(2)),
    vibration: Number((2 + Math.random()).toFixed(2)),
    pressure: Number((5 + Math.random() * 0.5).toFixed(2)),
    current: Number((100 + Math.random() * 15).toFixed(2)),
  };
  return NextResponse.json(data);
}

export async function OPTIONS() {
  return corsJSON({ ok: true });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const point = {
      temperature: Number(body.temperature),
      vibration: Number(body.vibration),
      pressure: Number(body.pressure),
      current: Number(body.current),
      equipmentId: typeof body.equipmentId === 'string' ? body.equipmentId : undefined,
      timestamp: typeof body.timestamp === 'string' ? body.timestamp : undefined,
    };
    if ([point.temperature, point.vibration, point.pressure, point.current].some((v) => Number.isNaN(v))) {
      return corsJSON({ error: 'Invalid sensor reading' }, 400);
    }
    appendSensor(point);
    return corsJSON({ message: 'Reading stored' });
  } catch (e: any) {
    return corsJSON({ error: String(e?.message || e) }, 400);
  }
}


