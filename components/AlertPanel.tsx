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
  
  const alerts = data?.alerts || [];
  
  const getAlertIcon = (type: string) => {
    if (type === 'critical') return '🔴';
    return '⚠️';
  };
  
  const getAlertColor = (type: string) => {
    if (type === 'critical') return 'border-red-500 bg-red-50';
    return 'border-yellow-500 bg-yellow-50';
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Recent Alerts</h3>
        {data && (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            {data.count} Active
          </span>
        )}
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ✅ No active alerts - All systems operational
          </div>
        ) : (
          alerts.slice(0, 10).map((alert: any) => (
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
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

