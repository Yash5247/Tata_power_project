'use client';

import { usePredictions, useAlerts } from '@/lib/hooks';
import SensorTrendChart from '@/components/SensorTrendChart';
import HealthScoreChart from '@/components/HealthScoreChart';
import FailureRateChart from '@/components/FailureRateChart';
import EquipmentTable from '@/components/EquipmentTable';
import AlertPanel from '@/components/AlertPanel';

export default function HomePage() {
  const { data: predictionsData, isLoading: predictionsLoading } = usePredictions();
  const { data: alertsData } = useAlerts();

  const summary = predictionsData?.summary || {
    total: 24,
    healthy: 18,
    warning: 4,
    critical: 2,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔧 Predictive Maintenance Dashboard
          </h1>
          <p className="text-blue-100">
            AI-powered monitoring system for energy infrastructure
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {predictionsLoading ? '...' : summary.total}
            </div>
            <div className="text-gray-600 font-semibold">Total Equipment</div>
          </div>
          
          <div className="bg-green-500 rounded-lg shadow-lg p-6 text-center text-white">
            <div className="text-4xl font-bold mb-2">
              {predictionsLoading ? '...' : summary.healthy}
            </div>
            <div className="font-semibold">Healthy Devices</div>
          </div>
          
          <div className="bg-yellow-500 rounded-lg shadow-lg p-6 text-center text-white">
            <div className="text-4xl font-bold mb-2">
              {predictionsLoading ? '...' : summary.warning}
            </div>
            <div className="font-semibold">At Risk</div>
          </div>
          
          <div className="bg-red-500 rounded-lg shadow-lg p-6 text-center text-white">
            <div className="text-4xl font-bold mb-2">
              {predictionsLoading ? '...' : summary.critical}
            </div>
            <div className="font-semibold">Critical</div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold text-gray-800">System Status</h2>
            </div>
            <div className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            All monitoring systems operational - Real-time data collection active
          </p>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SensorTrendChart />
          <FailureRateChart />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <HealthScoreChart />
          <AlertPanel />
        </div>

        {/* Equipment Table */}
        <div className="mb-6">
          <EquipmentTable />
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">
            <span className="font-semibold">{alertsData?.criticalCount || 0}</span> critical alerts • {' '}
            <span className="font-semibold">{alertsData?.warningCount || 0}</span> warnings • {' '}
            Real-time monitoring active
          </p>
        </div>
      </div>
    </div>
  );
}
