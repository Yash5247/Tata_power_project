import { NextResponse } from 'next/server';
import { getEquipmentPredictions } from '@/lib/ml-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const predictions = getEquipmentPredictions();
  const equipment = predictions?.equipment || [];

  const sensorData = equipment.map((eq) => ({
    equipmentId: eq.equipmentId,
    ...eq.sensorData,
    healthScore: eq.healthScore,
    riskCategory: eq.riskCategory,
  }));

  return NextResponse.json({
    sensors: sensorData,
    count: sensorData.length,
    timestamp: new Date().toISOString(),
  });
}
