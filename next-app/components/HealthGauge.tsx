"use client";
import React from 'react';

type Props = { value: number; size?: number };

export default function HealthGauge({ value, size = 120 }: Props) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div className="inline-flex flex-col items-center">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth="12" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#10b981"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="-mt-10 text-xl font-semibold text-slate-800 rotate-[90deg]">{Math.round(clamped)}%</div>
      <div className="text-xs text-slate-500 mt-1">Health</div>
    </div>
  );
}


