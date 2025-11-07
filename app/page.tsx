'use client';

import { useState } from 'react';
import { usePredictions, useAlerts, useHistoricalData } from '@/lib/hooks';
import SensorTrendChart from '@/components/SensorTrendChart';
import HealthScoreChart from '@/components/HealthScoreChart';
import FailureRateChart from '@/components/FailureRateChart';
import EquipmentTable from '@/components/EquipmentTable';
import AlertPanel from '@/components/AlertPanel';
import KPICards from '@/components/KPICards';
import AnomalyTimeline from '@/components/AnomalyTimeline';
import MaintenanceSchedule from '@/components/MaintenanceSchedule';
import SearchFilter from '@/components/SearchFilter';
import PerformanceMetrics from '@/components/PerformanceMetrics';
import ExportButton from '@/components/ExportButton';
import NotificationBell from '@/components/NotificationBell';
import DataRefreshControl from '@/components/DataRefreshControl';
import CostSavingsCard from '@/components/CostSavingsCard';
import PredictiveInsights from '@/components/PredictiveInsights';
import EquipmentHealthGauge from '@/components/EquipmentHealthGauge';

export default function HomePage() {
  const { data: predictionsData, isLoading: predictionsLoading, mutate: refreshPredictions } = usePredictions();
  const { data: alertsData, mutate: refreshAlerts } = useAlerts();
  const { data: historicalData } = useHistoricalData(7);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  const handleRefresh = () => {
    refreshPredictions();
    refreshAlerts();
  };

  const criticalAlerts = alertsData?.alerts?.filter((a: any) => a.type === 'critical') || [];
  const totalEquipment = predictionsData?.equipment?.length || 0;
  const healthyCount = predictionsData?.equipment?.filter((e: any) => e.status === 'healthy').length || 0;
  const systemHealth = totalEquipment > 0 ? Math.round((healthyCount / totalEquipment) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">PM</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Predictive Maintenance</h1>
                  <p className="text-xs text-gray-500">Energy Infrastructure Monitoring</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <DataRefreshControl 
                autoRefresh={autoRefresh} 
                onToggle={setAutoRefresh}
                onManualRefresh={handleRefresh}
              />
              <NotificationBell count={criticalAlerts.length} />
              <ExportButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
              <p className="text-gray-600 mt-1">Real-time monitoring and predictive analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">System Health</div>
                <div className="text-2xl font-bold text-gray-900">{systemHealth}%</div>
              </div>
              <EquipmentHealthGauge value={systemHealth} />
            </div>
          </div>

          {/* KPI Cards */}
          <KPICards />

          {/* Cost Savings & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <CostSavingsCard />
            <PredictiveInsights />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-8">
          <PerformanceMetrics />
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Data Time Range</h3>
              <div className="flex gap-2">
                {['1h', '24h', '7d', '30d'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedTimeRange(range)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedTimeRange === range
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Analytics & Visualizations</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SensorTrendChart timeRange={selectedTimeRange} />
            <FailureRateChart />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <HealthScoreChart />
            <AnomalyTimeline />
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <SearchFilter onSearch={() => {}} onFilter={() => {}} />
        </div>

        {/* Equipment Management Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Equipment Management</h3>
            <div className="text-sm text-gray-600">
              {predictionsData?.equipment?.length || 0} Total Equipment
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <MaintenanceSchedule />
            <AlertPanel />
          </div>
        </div>

        {/* Equipment Table */}
        <div className="mb-8">
          <EquipmentTable />
        </div>

        {/* System Status Footer */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {alertsData?.criticalCount || 0}
              </div>
              <div className="text-sm text-gray-600">Critical Alerts</div>
              <div className="text-xs text-red-600 mt-1">Requires Immediate Action</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {alertsData?.warningCount || 0}
              </div>
              <div className="text-sm text-gray-600">Warning Alerts</div>
              <div className="text-xs text-yellow-600 mt-1">Monitor Closely</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {systemHealth}%
              </div>
              <div className="text-sm text-gray-600">System Uptime</div>
              <div className="text-xs text-green-600 mt-1">Optimal Performance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {predictionsData?.equipment?.filter((e: any) => e.nextMaintenance).length || 0}
              </div>
              <div className="text-sm text-gray-600">Scheduled Maintenance</div>
              <div className="text-xs text-blue-600 mt-1">Next 30 Days</div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  All systems operational • Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Powered by AI/ML Predictive Analytics
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
