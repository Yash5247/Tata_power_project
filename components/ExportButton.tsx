'use client';

import { usePredictions } from '@/lib/hooks';

export default function ExportButton() {
  const { data } = usePredictions();

  const exportToCSV = () => {
    if (!data?.equipment) return;

    const headers = ['Equipment ID', 'Health Score', 'Failure Risk', 'Status', 'Next Maintenance'];
    const rows = data.equipment.map((eq: any) => [
      eq.equipmentId,
      eq.healthScore,
      eq.failureProbability,
      eq.status,
      eq.nextMaintenance || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipment-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportToCSV}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
    >
      📥 Export CSV
    </button>
  );
}

