"use client";
import React, { useMemo, useState } from 'react';

export type EquipmentRow = {
  id: string;
  health_score: number;
  failure_probability: number;
  status?: 'healthy' | 'warning' | 'critical';
};

type Props = { rows: EquipmentRow[] };

export default function EquipmentTable({ rows }: Props) {
  const [sortKey, setSortKey] = useState<'id' | 'health_score' | 'failure_probability'>('health_score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      // @ts-ignore
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  function changeSort(key: 'id' | 'health_score' | 'failure_probability') {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  return (
    <div id="equipment" className="rounded-lg border bg-white shadow-sm overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="p-3 text-left cursor-pointer" onClick={() => changeSort('id')}>Equipment</th>
            <th className="p-3 text-right cursor-pointer" onClick={() => changeSort('health_score')}>Health</th>
            <th className="p-3 text-right cursor-pointer" onClick={() => changeSort('failure_probability')}>Failure Prob</th>
            <th className="p-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const probPct = Math.round(r.failure_probability * 100);
            const status = r.status || (probPct >= 70 ? 'critical' : probPct >= 40 ? 'warning' : 'healthy');
            return (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{r.id}</td>
                <td className="p-3 text-right">{r.health_score.toFixed(1)}</td>
                <td className="p-3 text-right">{probPct}%</td>
                <td className="p-3 text-right">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    status === 'critical' ? 'bg-red-100 text-red-700' : status === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>{status}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


