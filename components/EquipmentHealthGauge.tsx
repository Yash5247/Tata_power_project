'use client';

export default function EquipmentHealthGauge({ value }: { value: number }) {
  const getColor = (val: number) => {
    if (val >= 80) return 'text-green-500';
    if (val >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStrokeColor = (val: number) => {
    if (val >= 80) return 'stroke-green-500';
    if (val >= 60) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-20 h-20">
      <svg className="transform -rotate-90 w-20 h-20">
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${getStrokeColor(value)} transition-all duration-500`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-lg font-bold ${getColor(value)}`}>
          {value}%
        </span>
      </div>
    </div>
  );
}

