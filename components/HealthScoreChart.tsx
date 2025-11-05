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
  const chartData = data?.equipment?.slice(0, 10).map((eq: any) => ({
    equipment: eq.equipmentId,
    healthScore: eq.healthScore,
    status: eq.status,
  })) || [];
  
  const getColor = (status: string) => {
    if (status === 'healthy') return '#10b981';
    if (status === 'warning') return '#f59e0b';
    return '#ef4444';
  };
  
  const COLORS = chartData.map((item: any) => getColor(item.status));
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Equipment Health Scores (Top 10)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="equipment" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="healthScore" 
            radius={[8, 8, 0, 0]}
          >
            {chartData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
