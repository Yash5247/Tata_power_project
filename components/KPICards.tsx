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
      color: 'bg-blue-500',
      icon: '📊',
      trend: '+2.5%',
    },
    {
      label: 'Healthy',
      value: summary.healthy,
      color: 'bg-green-500',
      icon: '✅',
      trend: '+5.2%',
      percentage: Math.round((summary.healthy / summary.total) * 100),
    },
    {
      label: 'At Risk',
      value: summary.warning,
      color: 'bg-yellow-500',
      icon: '⚠️',
      trend: '-1.8%',
      percentage: Math.round((summary.warning / summary.total) * 100),
    },
    {
      label: 'Critical',
      value: summary.critical,
      color: 'bg-red-500',
      icon: '🔴',
      trend: '-0.5%',
      percentage: Math.round((summary.critical / summary.total) * 100),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">{card.icon}</div>
            <div className={`text-xs px-2 py-1 rounded-full ${
              card.trend.startsWith('+') ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
            }`}>
              {card.trend}
            </div>
          </div>
          <div className="text-4xl font-bold mb-2">
            {isLoading ? '...' : card.value}
          </div>
          <div className="text-blue-100 font-semibold mb-1">{card.label}</div>
          {card.percentage !== undefined && (
            <div className="text-xs text-blue-200">
              {card.percentage}% of total
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

