"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export type HealthRow = { id: string; health: number };

export default function HealthScoreChart({ data }: { data: HealthRow[] }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-medium">Equipment Health Scores</div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="id" hide={data.length > 20} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="health" name="Health (%)" fill="#10b981" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


