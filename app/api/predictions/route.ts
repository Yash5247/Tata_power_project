import { NextResponse } from 'next/server';
import {
  getEquipmentPredictions,
  getModelMetadata,
  getSummaryStats,
  refreshPredictionsViaPython,
} from '@/lib/ml-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  let predictions = getEquipmentPredictions();

  if (!predictions) {
    await refreshPredictionsViaPython();
    predictions = getEquipmentPredictions();
  }

  if (!predictions) {
    return NextResponse.json(
      { error: 'Predictions unavailable. Run: python train.py && python predict.py' },
      { status: 503 }
    );
  }

  const metadata = getModelMetadata();
  const summary = getSummaryStats(predictions.equipment);

  return NextResponse.json({
    equipment: predictions.equipment,
    summary,
    model: metadata
      ? {
          name: metadata.best_model,
          accuracy: metadata.best_metrics.accuracy,
          f1Score: metadata.best_metrics.f1_score,
          rocAuc: metadata.best_metrics.roc_auc,
        }
      : null,
    generatedAt: predictions.generated_at,
    source: 'AI4I 2020 Predictive Maintenance Dataset',
  });
}
