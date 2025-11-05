"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export type SensorPoint = {
  time: string;
  temperature: number;
  vibration: number;
};

export default function SensorTrendChart({ data }: { data: SensorPoint[] }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-medium">Sensor Trends (24h)</div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" hide={data.length > 24} />
            <YAxis yAxisId="left" stroke="#0ea5e9" />
            <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Temperature (°C)" />
            <Line yAxisId="right" type="monotone" dataKey="vibration" stroke="#f59e0b" strokeWidth={2} dot={false} name="Vibration (mm/s)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


