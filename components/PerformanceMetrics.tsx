'use client';

import { usePredictions, useAlerts } from '@/lib/hooks';

export default function PerformanceMetrics() {
  const { data: predictionsData } = usePredictions();
  const { data: alertsData } = useAlerts();

  const equipment = predictionsData?.equipment || [];
  const alerts = alertsData?.alerts || [];

  // Calculate metrics
  const avgHealthScore = equipment.length > 0
    ? Math.round(
        equipment.reduce((sum: number, eq: any) => sum + eq.healthScore, 0) / equipment.length
      )
    : 0;

  const avgFailureRisk = equipment.length > 0
    ? Math.round(
        equipment.reduce((sum: number, eq: any) => sum + eq.failureProbability, 0) / equipment.length
      )
    : 0;

  const uptime = equipment.length > 0
    ? Math.round((equipment.filter((eq: any) => eq.status === 'healthy').length / equipment.length) * 100)
    : 0;

  const criticalAlerts = alerts.filter((a: any) => a.type === 'critical').length;

  const metrics = [
    {
      label: 'Average Health Score',
      value: `${avgHealthScore}%`,
      color: avgHealthScore >= 80 ? 'text-green-600' : avgHealthScore >= 60 ? 'text-yellow-600' : 'text-red-600',
      icon: '📊',
      trend: avgHealthScore >= 80 ? '↑ Excellent' : avgHealthScore >= 60 ? '→ Good' : '↓ Needs Attention',
    },
    {
      label: 'Average Failure Risk',
      value: `${avgFailureRisk}%`,
      color: avgFailureRisk <= 20 ? 'text-green-600' : avgFailureRisk <= 40 ? 'text-yellow-600' : 'text-red-600',
      icon: '⚠️',
      trend: avgFailureRisk <= 20 ? '↓ Low' : avgFailureRisk <= 40 ? '→ Moderate' : '↑ High',
    },
    {
      label: 'System Uptime',
      value: `${uptime}%`,
      color: uptime >= 95 ? 'text-green-600' : uptime >= 80 ? 'text-yellow-600' : 'text-red-600',
      icon: '⚡',
      trend: uptime >= 95 ? '↑ Excellent' : uptime >= 80 ? '→ Good' : '↓ Poor',
    },
    {
      label: 'Critical Alerts',
      value: criticalAlerts.toString(),
      color: criticalAlerts === 0 ? 'text-green-600' : 'text-red-600',
      icon: '🔴',
      trend: criticalAlerts === 0 ? '✓ None' : `⚠️ ${criticalAlerts} Active`,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metric.icon}</span>
              <span className={`text-lg font-bold ${metric.color}`}>
                {metric.value}
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
            <div className={`text-xs font-semibold ${
              metric.trend.includes('↑') || metric.trend.includes('✓')
                ? 'text-green-600'
                : metric.trend.includes('→')
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {metric.trend}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

