'use client';

import { usePredictions } from '@/lib/hooks';

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
  
  const equipment = data?.equipment?.sort((a: any, b: any) => a.healthScore - b.healthScore) || [];
  
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
      <h3 className="text-lg font-semibold mb-4">Equipment Status</h3>
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equipment.slice(0, 10).map((eq: any) => (
              <tr key={eq.equipmentId} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {eq.equipmentId}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {eq.healthScore}%
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {eq.failureProbability}%
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getStatusBadge(eq.status)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {eq.nextMaintenance ? new Date(eq.nextMaintenance).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

