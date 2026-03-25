import React from 'react';

interface YourActionDisplayProps {
  action: {
    type: string;
    amount?: number;
  };
}

const actionColorMap: Record<string, { bg: string; text: string; border: string }> = {
  fold: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  check: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300' },
  call: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  bet: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
  raise: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  'all-in': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
};

const defaultColors = { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };

const YourActionDisplay: React.FC<YourActionDisplayProps> = ({ action }) => {
  const colors = actionColorMap[action.type.toLowerCase()] ?? defaultColors;
  const label = action.type.charAt(0).toUpperCase() + action.type.slice(1);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Your Action</p>
      <div
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border ${colors.bg} ${colors.border}`}
      >
        <span className={`text-sm font-semibold ${colors.text}`}>{label}</span>
        {action.amount !== undefined && (
          <span className={`text-sm font-bold ${colors.text}`}>
            ${action.amount.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default YourActionDisplay;