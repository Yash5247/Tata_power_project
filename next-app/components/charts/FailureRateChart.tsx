"use client";
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export type StatusCounts = { healthy: number; warning: number; critical: number };

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function FailureRateChart({ counts }: { counts: StatusCounts }) {
  const data = [
    { name: 'Healthy', value: counts.healthy },
    { name: 'At Risk', value: counts.warning },
    { name: 'Critical', value: counts.critical },
  ];
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-medium">Status Distribution</div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


