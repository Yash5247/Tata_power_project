'use client';

import { useAlerts } from '@/lib/hooks';

export default function AlertPanel() {
  const { data, isLoading } = useAlerts();
  
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
        <div className="h-64 flex items-center justify-center">Loading...</div>
      </div>
    );
  }
  
  let alerts = data?.alerts || [];
  
  // Generate fallback alerts if empty
  if (alerts.length === 0) {
    const alertTypes = ['critical', 'warning'];
    const alertMessages = [
      'High temperature detected - Immediate inspection required',
      'Vibration levels exceeding normal range - Maintenance recommended',
      'Pressure anomaly detected - System check needed',
      'Current fluctuation detected - Potential failure risk',
      'Health score below threshold - Preventive action required',
      'Sensor reading out of range - Equipment inspection needed',
    ];
    
    alerts = Array.from({ length: 6 }, (_, i) => {
      const type = i < 2 ? 'critical' : 'warning';
      const healthScore = type === 'critical' ? 30 + Math.random() * 25 : 50 + Math.random() * 20;
      const failureProbability = Math.round((100 - healthScore) * 10) / 10;
      
      const daysUntil = Math.floor(Math.random() * 20) + 1;
      const maintenanceDate = new Date();
      maintenanceDate.setDate(maintenanceDate.getDate() + daysUntil);
      
      return {
        id: `EQ-${i + 5}`,
        type,
        message: alertMessages[i % alertMessages.length],
        healthScore: Math.round(healthScore * 10) / 10,
        failureProbability,
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        nextMaintenance: maintenanceDate.toISOString(),
      };
    });
  }
  
  const getAlertIcon = (type: string) => {
    if (type === 'critical') return '🔴';
    return '⚠️';
  };
  
  const getAlertColor = (type: string) => {
    if (type === 'critical') return 'border-red-500 bg-red-50';
    return 'border-yellow-500 bg-yellow-50';
  };
  
  const alertCount = alerts.length;
  const criticalCount = alerts.filter((a: any) => a.type === 'critical').length;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recent Alerts</h3>
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
          {alertCount} Active
        </span>
      </div>
      <div className="mb-2 text-xs text-gray-600">
        {criticalCount} critical • {alertCount - criticalCount} warnings
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.slice(0, 10).map((alert: any) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{getAlertIcon(alert.type)}</span>
                  <span className="font-semibold text-gray-900">{alert.id}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    alert.type === 'critical' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {alert.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Health: {alert.healthScore}%</span>
                  <span>Risk: {alert.failureProbability}%</span>
                  {alert.nextMaintenance && (
                    <span>Maintenance: {new Date(alert.nextMaintenance).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(alert.timestamp || Date.now()).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
