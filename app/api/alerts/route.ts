import { NextResponse } from 'next/server';
import { getAlertsData, getEquipmentPredictions } from '@/lib/ml-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  let alerts = getAlertsData();

  if (!alerts) {
    const predictions = getEquipmentPredictions();
    if (!predictions) {
      return NextResponse.json({ alerts: [], criticalCount: 0, warningCount: 0, totalCount: 0 });
    }

    const generatedAlerts = predictions.equipment
      .filter((e) => ['High Risk', 'Critical', 'Medium Risk'].includes(e.riskCategory))
      .map((e) => ({
        id: `alert-${e.equipmentId}`,
        equipmentId: e.equipmentId,
        type: e.riskCategory === 'Critical' ? 'critical' : 'warning',
        message: `${e.equipmentId}: ${e.maintenanceDescription}`,
        timestamp: new Date().toISOString(),
        riskCategory: e.riskCategory,
      }));

    return NextResponse.json({
      alerts: generatedAlerts,
      criticalCount: generatedAlerts.filter((a) => a.type === 'critical').length,
      warningCount: generatedAlerts.filter((a) => a.type === 'warning').length,
      totalCount: generatedAlerts.length,
    });
  }

  return NextResponse.json(alerts);
}
