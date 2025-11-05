"use client";
import React from 'react';

type Props = {
  total: number;
  healthy: number;
  risk: number;
  critical: number;
};

const Card = ({ title, value, className = '' }: { title: string; value: number | string; className?: string }) => (
  <div className={`rounded-lg border p-4 shadow-sm ${className}`}>
    <div className="text-xs uppercase tracking-wide text-slate-500">{title}</div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
  </div>
);

export default function KPICards({ total, healthy, risk, critical }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card title="Total Equipment" value={total} className="bg-white" />
      <Card title="Healthy" value={healthy} className="bg-green-50 border-green-200" />
      <Card title="At Risk" value={risk} className="bg-yellow-50 border-yellow-200" />
      <Card title="Critical" value={critical} className="bg-red-50 border-red-200" />
    </div>
  );
}


