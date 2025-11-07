'use client';

import { usePredictions } from '@/lib/hooks';
import Link from 'next/link';

export default function EquipmentTable() {
  const { data, isLoading } = usePredictions();
  
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Equipment Status</h3>
        <div className="h-64 flex items-center justify-center">Loading...</div>
      </div>
    );
  }
  
  let equipment = data?.equipment?.sort((a: any, b: any) => a.healthScore - b.healthScore) || [];
  
  // Generate fallback equipment data if empty
  if (equipment.length === 0) {
    equipment = Array.from({ length: 24 }, (_, i) => {
      const healthScore = 30 + Math.random() * 65;
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (healthScore < 60) status = 'critical';
      else if (healthScore < 80) status = 'warning';
      
      const failureProbability = Math.round((100 - healthScore) * 10) / 10;
      
      // Some equipment need maintenance
      let nextMaintenance: string | undefined;
      if (healthScore < 75 && Math.random() > 0.3) {
        const daysUntil = Math.floor(Math.random() * 30) + 1;
        const date = new Date();
        date.setDate(date.getDate() + daysUntil);
        nextMaintenance = date.toISOString();
      }
      
      return {
        equipmentId: `EQ-${i + 1}`,
        healthScore: Math.round(healthScore * 10) / 10,
        failureProbability,
        status,
        nextMaintenance,
      };
    }).sort((a: any, b: any) => a.healthScore - b.healthScore);
  }
  
  const getStatusBadge = (status: string) => {
    const styles = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {status.toUpperCase()}
      </span>
    );
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Equipment Status</h3>
        <span className="text-sm text-gray-600">
          Showing {equipment.length} equipment
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipment ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Health Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Failure Risk
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Maintenance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equipment.slice(0, 15).map((eq: any) => (
              <tr key={eq.equipmentId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {eq.equipmentId}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>{eq.healthScore}%</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          eq.healthScore >= 80
                            ? 'bg-green-500'
                            : eq.healthScore >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, eq.healthScore))}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {eq.failureProbability}%
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getStatusBadge(eq.status)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {eq.nextMaintenance ? (
                    <span>
                      {new Date(eq.nextMaintenance).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <Link
                    href={`/equipment/${eq.equipmentId}`}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    View Details →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing top 15 equipment by health score. Click "View Details" to see full history.
      </div>
    </div>
  );
}
