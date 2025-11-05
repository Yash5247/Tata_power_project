'use client';

import { useState } from 'react';
import { usePredictions, useAlerts } from '@/lib/hooks';
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

export default function HomePage() {
  const { data: predictionsData, isLoading: predictionsLoading } = usePredictions();
  const { data: alertsData } = useAlerts();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (status: string) => {
    setFilterStatus(status);
  };

  // Filter equipment based on search and status
  const filteredEquipment = predictionsData?.equipment?.filter((eq: any) => {
    const matchesSearch = eq.equipmentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || eq.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              🔧 Predictive Maintenance Dashboard
            </h1>
            <p className="text-blue-100">
              AI-powered monitoring system for energy infrastructure
            </p>
          </div>
          <ExportButton />
        </div>

        {/* KPI Cards */}
        <KPICards />

        {/* Performance Metrics */}
        <div className="mb-6">
          <PerformanceMetrics />
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

        {/* Search and Filter */}
        <SearchFilter onSearch={handleSearch} onFilter={handleFilter} />

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SensorTrendChart />
          <FailureRateChart />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <HealthScoreChart />
          <AnomalyTimeline />
        </div>

        {/* Maintenance Schedule and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MaintenanceSchedule />
          <AlertPanel />
        </div>

        {/* Equipment Table */}
        <div className="mb-6">
          <EquipmentTable />
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {alertsData?.criticalCount || 0}
              </div>
              <div className="text-sm text-gray-600">Critical Alerts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {alertsData?.warningCount || 0}
              </div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {predictionsData?.equipment?.filter((e: any) => e.status === 'healthy').length || 0}%
              </div>
              <div className="text-sm text-gray-600">System Uptime</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
            Real-time monitoring active • Data refreshes automatically
          </div>
        </div>
      </div>
    </div>
  );
}
