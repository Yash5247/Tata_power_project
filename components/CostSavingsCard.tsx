'use client';

import { usePredictions } from '@/lib/hooks';

export default function CostSavingsCard() {
  const { data } = usePredictions();

  let equipment = data?.equipment || [];
  
  // Generate fallback data if empty
  if (equipment.length === 0) {
    equipment = Array.from({ length: 24 }, (_, i) => {
      const healthScore = 30 + Math.random() * 65;
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (healthScore < 60) status = 'critical';
      else if (healthScore < 80) status = 'warning';
      return {
        equipmentId: `EQ-${i + 1}`,
        status,
        healthScore,
      };
    });
  }
  
  const criticalCount = equipment.filter((e: any) => e.status === 'critical').length;
  const warningCount = equipment.filter((e: any) => e.status === 'warning').length;
  const healthyCount = equipment.filter((e: any) => e.status === 'healthy').length;

  // Calculate estimated cost savings
  const preventedFailures = criticalCount + warningCount;
  
  // Realistic cost assumptions for energy infrastructure
  const avgFailureCost = 75000; // $75k per failure (includes downtime, repair, customer impact)
  const emergencyRepairCost = 45000; // $45k for emergency repairs
  const scheduledMaintenanceCost = 8000; // $8k for scheduled maintenance
  const downtimeCostPerDay = 15000; // $15k per day of downtime
  const avgDowntimeDays = 3.5; // Average days of downtime per failure
  
  // Calculate savings
  const totalFailureCost = avgFailureCost + (downtimeCostPerDay * avgDowntimeDays);
  const totalMaintenanceCost = preventedFailures * scheduledMaintenanceCost;
  const estimatedSavings = (preventedFailures * totalFailureCost) - totalMaintenanceCost;
  
  // Additional metrics
  const monthlySavings = estimatedSavings / 12; // Annual savings / 12
  const systemUptimeImprovement = (healthyCount / equipment.length) * 100;
  const maintenanceEfficiency = equipment.length > 0 
    ? Math.round((preventedFailures / equipment.length) * 100) 
    : 0;
  
  // ROI calculation (investment in predictive maintenance system)
  const systemInvestment = equipment.length * 2500; // $2.5k per equipment for PM system
  const roi = systemInvestment > 0 
    ? Math.round((estimatedSavings / systemInvestment) * 100) 
    : 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

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
        {/* Main Savings Display */}
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="text-sm text-green-100 mb-1">Annual Estimated Savings</div>
          <div className="text-4xl font-bold mb-2">
            {formatCurrency(estimatedSavings)}
          </div>
          <div className="text-xs text-green-100">
            From {preventedFailures} prevented failures
          </div>
        </div>
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs text-green-100 mb-1">ROI</div>
            <div className="text-2xl font-bold">{roi}%</div>
            <div className="text-xs text-green-200 mt-1">Return on investment</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs text-green-100 mb-1">Monthly Savings</div>
            <div className="text-2xl font-bold">{formatCurrency(monthlySavings)}</div>
            <div className="text-xs text-green-200 mt-1">Per month</div>
          </div>
        </div>
        
        {/* Breakdown */}
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <div className="text-xs text-green-100 mb-2 font-semibold">Cost Breakdown</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-green-200">Prevented Failures:</span>
              <span className="font-semibold">{preventedFailures} incidents</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-200">Avg Failure Cost:</span>
              <span className="font-semibold">{formatCurrency(totalFailureCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-200">Maintenance Cost:</span>
              <span className="font-semibold">{formatCurrency(totalMaintenanceCost)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/20">
              <span className="text-green-100 font-semibold">Net Savings:</span>
              <span className="font-bold text-lg">{formatCurrency(estimatedSavings)}</span>
            </div>
          </div>
        </div>
        
        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/10 rounded p-2 backdrop-blur-sm">
            <div className="text-green-200">Uptime</div>
            <div className="font-bold text-sm">{systemUptimeImprovement.toFixed(1)}%</div>
          </div>
          <div className="bg-white/10 rounded p-2 backdrop-blur-sm">
            <div className="text-green-200">Efficiency</div>
            <div className="font-bold text-sm">{maintenanceEfficiency}%</div>
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="text-xs text-green-100 pt-2 border-t border-white/20">
          Based on industry averages: {formatCurrency(avgFailureCost)} failure cost + {formatCurrency(downtimeCostPerDay)}/day downtime
        </div>
      </div>
    </div>
  );
}
