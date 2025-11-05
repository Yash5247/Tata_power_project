'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useHistoricalData } from '@/lib/hooks';

export default function SensorTrendChart() {
  const { data, isLoading } = useHistoricalData(24); // Last 24 hours
  
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Sensor Trends (24h)</h3>
        <div className="h-64 flex items-center justify-center">Loading...</div>
      </div>
    );
  }
  
  // Format data for chart - take last 24 points (hourly)
  const chartData = data?.data?.slice(-24).map((point: any) => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    temperature: point.temperature,
    vibration: point.vibration * 10, // Scale for visibility
    pressure: point.pressure,
    current: point.current,
  })) || [];
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Sensor Trends (24h)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} />
          <Line type="monotone" dataKey="vibration" stroke="#3b82f6" strokeWidth={2} />
          <Line type="monotone" dataKey="pressure" stroke="#10b981" strokeWidth={2} />
          <Line type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

