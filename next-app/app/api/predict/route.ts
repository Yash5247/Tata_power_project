import { NextResponse } from 'next/server';

function computeRisk({ temperature, vibration, pressure, current }: any) {
  let score = 0;
  if (temperature > 70) score += (temperature - 70) * 2;
  if (vibration > 3) score += (vibration - 3) * 10;
  if (pressure > 5.4) score += (pressure - 5.4) * 50;
  if (current > 115) score += (current - 115) * 1.5;
  const risk = Math.max(0, Math.min(100, Math.round(score)));
  const status = risk >= 70 ? 'critical' : risk >= 40 ? 'warning' : 'healthy';
  const message = status === 'critical'
    ? 'High failure risk detected. Immediate inspection recommended.'
    : status === 'warning'
    ? 'Elevated risk detected. Schedule maintenance check.'
    : 'Operating within normal parameters.';
  return { risk, status, message };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const metrics = {
    temperature: Number(searchParams.get('temperature') ?? 65),
    vibration: Number(searchParams.get('vibration') ?? 2.5),
    pressure: Number(searchParams.get('pressure') ?? 5.2),
    current: Number(searchParams.get('current') ?? 108),
  };
  const { risk, status, message } = computeRisk(metrics);
  return NextResponse.json({ metrics, risk, status, message, health_score: 100 - risk });
}
