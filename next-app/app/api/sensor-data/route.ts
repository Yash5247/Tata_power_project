import { NextResponse } from 'next/server';

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


