"use client";
import React from 'react';

export type AlertItem = {
  equipment: string;
  severity: 'warning' | 'critical';
  message: string;
  probability?: number;
  time: string;
};

export default function AlertPanel({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div id="alerts" className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-medium">Alerts</div>
      <ul className="space-y-2">
        {alerts.length === 0 && (
          <li className="text-slate-500 text-sm">No current alerts</li>
        )}
        {alerts.map((a, idx) => (
          <li key={idx} className="flex items-start gap-3 border rounded-md p-3">
            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${a.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`} />
            <div className="flex-1">
              <div className="text-sm font-medium">
                {a.equipment}
                <span className="ml-2 text-xs text-slate-500">{new Date(a.time).toLocaleString()}</span>
              </div>
              <div className="text-sm text-slate-700">{a.message}</div>
              {typeof a.probability === 'number' && (
                <div className="text-xs text-slate-500">prob: {(a.probability * 100).toFixed(0)}%</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


