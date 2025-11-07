'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { usePredictions } from '@/lib/hooks';

export default function HealthScoreChart() {
  const { data, isLoading } = usePredictions();
  
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Equipment Health Scores</h3>
        <div className="h-64 flex items-center justify-center">Loading...</div>
      </div>
    );
  }
  
  // Take top 10 equipment for display
  let chartData = data?.equipment?.slice(0, 10).map((eq: any) => ({
    equipment: eq.equipmentId,
    healthScore: eq.healthScore || 0,
    status: eq.status || 'healthy',
  })) || [];
  
  // Generate fallback data if empty
  if (chartData.length === 0) {
    chartData = Array.from({ length: 10 }, (_, i) => {
      const healthScore = 60 + Math.random() * 35;
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (healthScore < 60) status = 'critical';
      else if (healthScore < 80) status = 'warning';
      return {
        equipment: `EQ-${i + 1}`,
        healthScore: Math.round(healthScore * 10) / 10,
        status,
      };
    });
  }
  
  const getColor = (status: string) => {
    if (status === 'healthy') return '#10b981';
    if (status === 'warning') return '#f59e0b';
    return '#ef4444';
  };
  
  const COLORS = chartData.map((item: any) => getColor(item.status));
  
  const avgHealth = chartData.length > 0
    ? Math.round(chartData.reduce((sum: number, d: any) => sum + d.healthScore, 0) / chartData.length)
    : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Equipment Health Scores</h3>
          <p className="text-sm text-gray-500 mt-1">Top 10 equipment by health status</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Average</div>
          <div className="text-lg font-bold text-gray-900">{avgHealth}%</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="equipment" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            domain={[0, 100]} 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Health Score (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          />
          <Bar 
            dataKey="healthScore" 
            radius={[8, 8, 0, 0]}
            name="Health Score (%)"
          >
            {chartData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-gray-600">Healthy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span className="text-gray-600">At Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span className="text-gray-600">Critical</span>
        </div>
      </div>
    </div>
  );
}
