'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useHistoricalData } from '@/lib/hooks';

export default function AnomalyTimeline() {
  const { data, isLoading } = useHistoricalData(7);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Anomaly Detection Timeline (7 days)</h3>
        <div className="h-64 flex items-center justify-center">Loading...</div>
      </div>
    );
  }

  // Detect anomalies (values outside normal range)
  const chartData = data?.data?.slice(-168).map((point: any) => {
    const isAnomaly = 
      point.temperature > 70 || point.temperature < 30 ||
      point.vibration > 5 || 
      point.pressure > 130 || point.pressure < 90 ||
      point.current > 18 || point.current < 8;
    
    return {
      time: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' }),
      anomaly: isAnomaly ? point.temperature : null,
      temperature: point.temperature,
      timestamp: point.timestamp,
    };
  }) || [];

  const anomalyCount = chartData.filter(d => d.anomaly !== null).length;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Anomaly Detection Timeline (7 days)</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Anomalies detected:</span>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            {anomalyCount}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label="Max Temp" />
          <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" label="Min Temp" />
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="anomaly" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ fill: '#ef4444', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600">
        <p>🔴 Red dots indicate anomalies detected. Green area shows normal operating range.</p>
      </div>
    </div>
  );
}

