import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getModelMetadata } from '@/lib/ml-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const metadata = getModelMetadata();

  if (!metadata) {
    return NextResponse.json({ error: 'Model metadata not found. Run train.py first.' }, { status: 404 });
  }

  const artifactsDir = path.join(process.cwd(), 'models', 'artifacts');

  return NextResponse.json({
    bestModel: metadata.best_model,
    dataset: metadata.dataset,
    datasetSize: metadata.dataset_size,
    failureRate: metadata.failure_rate,
    comparison: metadata.comparison,
    bestMetrics: metadata.best_metrics,
    featureImportance: metadata.feature_importance,
    artifacts: {
      modelComparison: fs.existsSync(path.join(artifactsDir, 'model_comparison.png'))
        ? '/models/artifacts/model_comparison.png'
        : null,
      correlationHeatmap: fs.existsSync(path.join(artifactsDir, 'eda', 'correlation_heatmap.png'))
        ? '/models/artifacts/eda/correlation_heatmap.png'
        : null,
    },
  });
}
