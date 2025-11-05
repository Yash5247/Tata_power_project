"use client";
import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import KPICards from '@/components/KPICards';
import SensorTrendChart from '@/components/charts/SensorTrendChart';
import FailureRateChart from '@/components/charts/FailureRateChart';
import EquipmentTable from '@/components/EquipmentTable';
import AlertPanel from '@/components/AlertPanel';
import { useEquipmentData, useAlerts, useSensorData, usePredictions } from '@/lib/hooks';

type TrendPoint = { time: string; temperature: number; vibration: number };

export default function HomePage() {
  const { data: equipmentData, error: eqError, isLoading: eqLoading, refresh: refreshEq } = useEquipmentData();
  const { data: alertsData, error: alError, isLoading: alLoading, refresh: refreshAlerts } = useAlerts();
  const { data: sensorData, error: seError, isLoading: seLoading, refresh: refreshSensor } = useSensorData();
  const { data: predData } = usePredictions(sensorData);

  const [trend, setTrend] = useState<TrendPoint[]>([]);

  // Maintain last 24h trend (cap length ~ 288 for 5-min buckets; here we push each fetch ~5s, cap to 300)
  useEffect(() => {
    if (sensorData?.temperature != null && sensorData?.vibration != null) {
      setTrend((prev) => {
        const next = [
          ...prev,
          { time: new Date(sensorData.timestamp || Date.now()).toLocaleTimeString(), temperature: Number(sensorData.temperature), vibration: Number(sensorData.vibration) },
        ];
        if (next.length > 300) next.shift();
        return next;
      });
    }
  }, [sensorData?.timestamp, sensorData?.temperature, sensorData?.vibration]);

  const totals = useMemo(() => {
    const rows = equipmentData?.equipment || [];
    const total = rows.length;
    let healthy = 0, warning = 0, critical = 0;
    for (const r of rows) {
      const prob = Number(r.failure_probability || 0);
      if (prob >= 0.7) critical++;
      else if (prob >= 0.4) warning++;
      else healthy++;
    }
    return { total, healthy, warning, critical };
  }, [equipmentData]);

  const topCritical = useMemo(() => {
    const rows = equipmentData?.equipment || [];
    return [...rows].sort((a, b) => Number(b.failure_probability) - Number(a.failure_probability)).slice(0, 5).map((r: any) => ({
      id: r.id,
      health_score: Number(r.health_score || 0),
      failure_probability: Number(r.failure_probability || 0),
    }));
  }, [equipmentData]);

  const systemOk = !eqError && !alError && !seError;

  function refreshAll() {
    refreshEq();
    refreshAlerts();
    refreshSensor();
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Overview</h1>
        <div className="flex items-center gap-3">
          <span className={`badge ${systemOk ? 'badge-healthy' : 'badge-warning'}`}>
            {systemOk ? 'System Healthy' : 'Degraded'}
          </span>
          <button className="btn btn-outline" onClick={refreshAll}>Refresh</button>
        </div>
      </div>

      {/* KPI */}
      <div className="mb-4">
        <KPICards total={totals.total} healthy={totals.healthy} risk={totals.warning} critical={totals.critical} />
      </div>

      {/* Charts + Health distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <SensorTrendChart data={trend} />
        </div>
        <div>
          <FailureRateChart counts={{ healthy: totals.healthy, warning: totals.warning, critical: totals.critical }} />
          <div className="mt-3 rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-sm font-medium mb-1">API Connection</div>
            <div className="text-sm text-slate-600">Equipment: {eqLoading ? 'Loading...' : eqError ? 'Error' : 'OK'}</div>
            <div className="text-sm text-slate-600">Alerts: {alLoading ? 'Loading...' : alError ? 'Error' : 'OK'}</div>
            <div className="text-sm text-slate-600">Sensors: {seLoading ? 'Loading...' : seError ? 'Error' : 'OK'}</div>
          </div>
        </div>
      </div>

      {/* Top critical & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EquipmentTable rows={topCritical} />
        <AlertPanel alerts={alertsData?.alerts || []} />
      </div>
    </DashboardLayout>
  );
}


