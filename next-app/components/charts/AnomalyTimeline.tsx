"use client";
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

export type AnomalyPoint = { time: string; score: number; isAnomaly?: boolean };

export default function AnomalyTimeline({ data }: { data: AnomalyPoint[] }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-medium">Anomaly Timeline</div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" hide={data.length > 24} />
            <YAxis domain={[0, 'auto']} />
            <Tooltip />
            <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="#bfdbfe" strokeWidth={2} />
            {data.filter(d => d.isAnomaly).map((d, i) => (
              <ReferenceDot key={i} x={d.time} y={d.score} r={4} fill="#ef4444" stroke="none" />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


