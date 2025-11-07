'use client';

export default function DataRefreshControl({
  autoRefresh,
  onToggle,
  onManualRefresh,
}: {
  autoRefresh: boolean;
  onToggle: (value: boolean) => void;
  onManualRefresh: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onManualRefresh}
        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => onToggle(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Auto-refresh</span>
      </label>
    </div>
  );
}

