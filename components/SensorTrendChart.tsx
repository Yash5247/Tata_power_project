'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useHistoricalData } from '@/lib/hooks';

export default function SensorTrendChart({ timeRange = '24h' }: { timeRange?: string }) {
  const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
  const { data, isLoading } = useHistoricalData(timeRange === '1h' ? 1 : timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30);
  
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Sensor Data</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{timeRange}</span>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading sensor data...</div>
        </div>
      </div>
    );
  }
  
  // Format data for chart
  const points = timeRange === '1h' ? 60 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
  const chartData = data?.data?.slice(-points).map((point: any) => {
    const date = new Date(point.timestamp);
    let timeLabel = '';
    if (timeRange === '1h') {
      timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '24h') {
      timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return {
      time: timeLabel,
      temperature: Math.round(point.temperature * 10) / 10,
      vibration: Math.round(point.vibration * 100) / 10,
      pressure: Math.round(point.pressure * 10) / 10,
      current: Math.round(point.current * 10) / 10,
    };
  }) || [];
  
  const avgTemp = chartData.length > 0 
    ? Math.round(chartData.reduce((sum: number, d: any) => sum + d.temperature, 0) / chartData.length)
    : 0;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Real-Time Sensor Data</h3>
          <p className="text-sm text-gray-500 mt-1">Temperature, Vibration, Pressure, Current</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{timeRange}</span>
          <div className="text-xs text-gray-600 mt-1">Avg: {avgTemp}°C</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="temperature" 
            stroke="#ef4444" 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTemp)"
            name="Temperature (°C)"
          />
          <Area 
            type="monotone" 
            dataKey="vibration" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVib)"
            name="Vibration (mm/s)"
          />
          <Line type="monotone" dataKey="pressure" stroke="#10b981" strokeWidth={2} name="Pressure (psi)" />
          <Line type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={2} name="Current (A)" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-xs text-gray-500">Max Temp</div>
          <div className="text-sm font-semibold text-red-600">
            {chartData.length > 0 ? Math.max(...chartData.map((d: any) => d.temperature || 0)).toFixed(1) : '0'}°C
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Max Vib</div>
          <div className="text-sm font-semibold text-blue-600">
            {chartData.length > 0 ? Math.max(...chartData.map((d: any) => d.vibration || 0)).toFixed(1) : '0'} mm/s
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Max Press</div>
          <div className="text-sm font-semibold text-green-600">
            {chartData.length > 0 ? Math.max(...chartData.map((d: any) => d.pressure || 0)).toFixed(1) : '0'} psi
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Max Current</div>
          <div className="text-sm font-semibold text-yellow-600">
            {chartData.length > 0 ? Math.max(...chartData.map((d: any) => d.current || 0)).toFixed(1) : '0'} A
          </div>
        </div>
      </div>
    </div>
  );
}

