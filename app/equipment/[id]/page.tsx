"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import SensorTrendChart from '@/components/charts/SensorTrendChart';
import HealthScoreChart from '@/components/charts/HealthScoreChart';
import AnomalyTimeline from '@/components/charts/AnomalyTimeline';
import EquipmentTable from '@/components/EquipmentTable';
import { api } from '@/lib/api';

function toCSV(rows: any[]) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map(h => JSON.stringify(r[h] ?? '')).join(','));
  }
  return lines.join('\n');
}

export default function EquipmentDetail({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);
  const router = useRouter();
  const [series7, setSeries7] = useState<any[]>([]);
  const [series30, setSeries30] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ failure_probability: number; health_score: number } | null>(null);
  const [related, setRelated] = useState<any[]>([]);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [w7, w30] = await Promise.all([
        api.get(`/api/historical/7?equipmentId=${encodeURIComponent(id)}`).then(r => r.data.series || []),
        api.get(`/api/historical/30?equipmentId=${encodeURIComponent(id)}`).then(r => r.data.series || []),
      ]);
      setSeries7(w7);
      setSeries30(w30);

      // Predict using latest point if available
      const last = w7[w7.length - 1] || w30[w30.length - 1];
      if (last) {
        const pred = await api.get(`/api/predict`, {
          params: {
            temperature: last.temperature,
            vibration: last.vibration,
            pressure: last.pressure,
            current: last.current,
          },
        }).then(r => r.data);
        setPrediction({ failure_probability: pred.failure_probability ?? pred.risk ?? 0, health_score: pred.health_score ?? (100 - (pred.risk || 0)) });
      }

      // Related equipment from equipment-status
      const eq = await api.get('/api/equipment-status').then(r => r.data.equipment || []);
      setRelated(eq.filter((e: any) => e.id !== id).slice(0, 5));
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const trend7 = useMemo(() => series7.map((p: any) => ({ time: new Date(p.timestamp).toLocaleDateString(), temperature: p.temperature, vibration: p.vibration })), [series7]);
  const trend30 = useMemo(() => series30.map((p: any) => ({ time: new Date(p.timestamp).toLocaleDateString(), temperature: p.temperature, vibration: p.vibration })), [series30]);

  // Basic anomaly detection: mark points with z-score > 2.0 on temperature
  const anomalies = useMemo(() => {
    const s = series7;
    if (!s.length) return [] as any[];
    const temps = s.map((p: any) => p.temperature);
    const mean = temps.reduce((a: number, b: number) => a + b, 0) / temps.length;
    const std = Math.sqrt(temps.reduce((a: number, b: number) => a + (b - mean) * (b - mean), 0) / temps.length) || 1;
    return s.map((p: any) => ({ time: new Date(p.timestamp).toLocaleDateString(), score: Math.abs((p.temperature - mean) / std), isAnomaly: Math.abs((p.temperature - mean) / std) > 2.0 }));
  }, [series7]);

  function downloadCSV() {
    const csv = toCSV(series30);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id}-historical.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const confidence = prediction ? Math.max(0, Math.min(100, 100 - Math.abs(50 - (prediction.health_score || 50)))) : 0;
  const rec = prediction && (prediction.failure_probability >= 0.7
    ? 'Immediate inspection recommended; schedule maintenance within 24 hours.'
    : prediction.failure_probability >= 0.4
    ? 'Plan maintenance; monitor closely for next 72 hours.'
    : 'Operating normally; routine maintenance applies.');

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Equipment {id}</h1>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => router.back()}>Back</button>
          <button className="btn btn-primary" onClick={fetchAll}>Refresh</button>
          <button className="btn btn-outline" onClick={downloadCSV}>Export CSV</button>
        </div>
      </div>

      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      {loading && <div className="skeleton-card" />}

      {/* Predictive Summary */}
      {prediction && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="card p-4">
            <div className="text-sm text-slate-500">Failure Probability</div>
            <div className="text-2xl font-semibold">{Math.round((prediction.failure_probability || 0) * 100)}%</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-slate-500">Health Score</div>
            <div className="text-2xl font-semibold">{Math.round(prediction.health_score || 0)}%</div>
          </div>
          <div className="card p-4">
            <div className="text-sm text-slate-500">Confidence</div>
            <div className="text-2xl font-semibold">{Math.round(confidence)}%</div>
          </div>
        </div>
      )}

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <SensorTrendChart data={trend7} />
        <SensorTrendChart data={trend30} />
      </div>

      {/* Anomalies timeline */}
      <div className="mb-4">
        <AnomalyTimeline data={anomalies} />
      </div>

      {/* Specifications & Maintenance (placeholder) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="card p-4">
          <div className="text-sm font-medium mb-2">Specifications</div>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>Model: —</li>
            <li>Rated Voltage: —</li>
            <li>Location: —</li>
          </ul>
        </div>
        <div className="card p-4">
          <div className="text-sm font-medium mb-2">Maintenance History</div>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>— No records</li>
          </ul>
        </div>
      </div>

      {/* Recommended actions */}
      {prediction && (
        <div className="card p-4 mb-4">
          <div className="text-sm font-medium mb-1">Recommended Actions</div>
          <div className="text-sm text-slate-700">{rec}</div>
        </div>
      )}

      {/* Related equipment comparison */}
      <div className="card p-4">
        <div className="text-sm font-medium mb-2">Related Equipment</div>
        <EquipmentTable rows={related.map((r: any) => ({ id: r.id, health_score: Number(r.health_score || 0), failure_probability: Number(r.failure_probability || 0) }))} />
      </div>
    </DashboardLayout>
  );
}


