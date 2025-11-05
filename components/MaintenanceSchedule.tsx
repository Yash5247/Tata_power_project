'use client';

import { usePredictions } from '@/lib/hooks';

export default function MaintenanceSchedule() {
  const { data, isLoading } = usePredictions();

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Upcoming Maintenance</h3>
        <div className="h-64 flex items-center justify-center">Loading...</div>
      </div>
    );
  }

  const equipment = data?.equipment || [];
  
  // Get equipment that needs maintenance
  const maintenanceNeeded = equipment
    .filter((eq: any) => eq.nextMaintenance)
    .map((eq: any) => ({
      ...eq,
      daysUntil: Math.ceil(
        (new Date(eq.nextMaintenance).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))
    .sort((a: any, b: any) => a.daysUntil - b.daysUntil)
    .slice(0, 10);

  const getPriorityColor = (days: number) => {
    if (days <= 7) return 'bg-red-100 text-red-800 border-red-300';
    if (days <= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Upcoming Maintenance</h3>
        <span className="text-sm text-gray-600">
          {maintenanceNeeded.length} scheduled
        </span>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {maintenanceNeeded.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            ✅ No scheduled maintenance - All equipment operating normally
          </div>
        ) : (
          maintenanceNeeded.map((eq: any) => (
            <div
              key={eq.equipmentId}
              className={`p-4 rounded-lg border-l-4 ${getPriorityColor(eq.daysUntil)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{eq.equipmentId}</span>
                    <span className="text-xs px-2 py-1 bg-white rounded">
                      {eq.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-1">
                    Health Score: {eq.healthScore}% | Risk: {eq.failureProbability}%
                  </div>
                  <div className="text-xs text-gray-600">
                    Scheduled: {new Date(eq.nextMaintenance).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    eq.daysUntil <= 7 ? 'text-red-600' : eq.daysUntil <= 30 ? 'text-yellow-600' : 'text-blue-600'
                  }`}>
                    {eq.daysUntil}
                  </div>
                  <div className="text-xs text-gray-600">days</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

