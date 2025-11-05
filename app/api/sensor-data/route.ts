import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    timestamp: new Date().toISOString(),
    temperature: 65.5,
    vibration: 2.4,
    pressure: 5.2,
    current: 108.3,
  };
  return NextResponse.json(data);
}
