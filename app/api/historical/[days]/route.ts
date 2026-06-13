import { NextResponse } from 'next/server';
import { generateHistoricalData, getEquipmentPredictions } from '@/lib/ml-service';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { days: string } }
) {
  const days = parseInt(params.days, 10) || 7;
  const predictions = getEquipmentPredictions();
  const equipment = predictions?.equipment?.[0];

  const data = generateHistoricalData(days, equipment);

  return NextResponse.json({
    days,
    data,
    equipmentId: equipment?.equipmentId || 'EQ-1',
    source: 'AI4I-derived sensor simulation',
  });
}
