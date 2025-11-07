'use client';

import { usePredictions } from '@/lib/hooks';

export default function KPICards() {
  const { data, isLoading } = usePredictions();

  const summary = data?.summary || {
    total: 24,
    healthy: 18,
    warning: 4,
    critical: 2,
  };

  const cards = [
    {
      label: 'Total Equipment',
      value: summary.total,
      color: 'from-blue-500 to-blue-600',
      icon: '📊',
      trend: '+2.5%',
      trendUp: true,
      subtitle: 'Active monitoring',
    },
    {
      label: 'Healthy',
      value: summary.healthy,
      color: 'from-green-500 to-emerald-600',
      icon: '✅',
      trend: '+5.2%',
      trendUp: true,
      percentage: Math.round((summary.healthy / summary.total) * 100),
      subtitle: `${Math.round((summary.healthy / summary.total) * 100)}% of total`,
    },
    {
      label: 'At Risk',
      value: summary.warning,
      color: 'from-yellow-500 to-amber-600',
      icon: '⚠️',
      trend: '-1.8%',
      trendUp: false,
      percentage: Math.round((summary.warning / summary.total) * 100),
      subtitle: 'Requires attention',
    },
    {
      label: 'Critical',
      value: summary.critical,
      color: 'from-red-500 to-rose-600',
      icon: '🔴',
      trend: '-0.5%',
      trendUp: false,
      percentage: Math.round((summary.critical / summary.total) * 100),
      subtitle: 'Immediate action needed',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.color} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300 border border-white/20`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">{card.icon}</div>
            <div className={`text-xs px-2 py-1 rounded-full font-semibold ${
              card.trendUp 
                ? 'bg-green-200/30 text-green-100 backdrop-blur-sm' 
                : 'bg-red-200/30 text-red-100 backdrop-blur-sm'
            }`}>
              {card.trend}
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">
            {isLoading ? (
              <div className="h-10 w-16 bg-white/20 rounded animate-pulse"></div>
            ) : (
              card.value
            )}
          </div>
          <div className="text-blue-100 font-semibold mb-1">{card.label}</div>
          <div className="text-xs text-white/80">{card.subtitle}</div>
          {card.percentage !== undefined && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Health Distribution</span>
                <span className="font-semibold">{card.percentage}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${card.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
