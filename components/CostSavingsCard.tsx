'use client';

import { usePredictions } from '@/lib/hooks';

export default function CostSavingsCard() {
  const { data } = usePredictions();

  const equipment = data?.equipment || [];
  const criticalCount = equipment.filter((e: any) => e.status === 'critical').length;
  const warningCount = equipment.filter((e: any) => e.status === 'warning').length;

  // Calculate estimated cost savings
  const preventedFailures = criticalCount + warningCount;
  const avgFailureCost = 50000; // $50k per failure
  const maintenanceCost = 5000; // $5k per maintenance
  const estimatedSavings = (preventedFailures * avgFailureCost) - (preventedFailures * maintenanceCost);
  const roi = equipment.length > 0 ? Math.round((estimatedSavings / (equipment.length * 1000)) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Cost Savings Analysis</h3>
          <p className="text-green-100 text-sm">Predictive maintenance ROI</p>
        </div>
        <div className="text-4xl">💰</div>
      </div>
      <div className="space-y-4">
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm text-green-100 mb-1">Estimated Savings</div>
          <div className="text-3xl font-bold">
            ${(estimatedSavings / 1000).toFixed(0)}K
          </div>
          <div className="text-xs text-green-100 mt-1">
            From {preventedFailures} prevented failures
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs text-green-100 mb-1">ROI</div>
            <div className="text-xl font-bold">{roi}%</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs text-green-100 mb-1">Prevented</div>
            <div className="text-xl font-bold">{preventedFailures}</div>
          </div>
        </div>
        <div className="text-xs text-green-100 pt-2 border-t border-white/20">
          Based on average failure cost: ${(avgFailureCost / 1000).toFixed(0)}K per incident
        </div>
      </div>
    </div>
  );
}

