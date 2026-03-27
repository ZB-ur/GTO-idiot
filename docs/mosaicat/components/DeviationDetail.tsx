import React from 'react';

interface DeviationDetailProps {
  explanation: string;
  evLossBbPer100: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const getSeverity = (evLoss: number) => {
  if (evLoss <= 0) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: '✓' };
  if (evLoss < 3) return { label: 'Minor', color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20', icon: '~' };
  if (evLoss < 10) return { label: 'Mistake', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: '!' };
  return { label: 'Blunder', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: '!!' };
};

export const DeviationDetail: React.FC<DeviationDetailProps> = ({
  explanation,
  evLossBbPer100,
  isExpanded,
  onToggle,
}) => {
  const severity = getSeverity(evLossBbPer100);

  return (
    <div
      className={`rounded-xl border ${severity.border} ${severity.bg} transition-all duration-200 overflow-hidden`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded-xl"
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${severity.color} bg-gray-900/50`}
          >
            {severity.icon}
          </span>
          <div>
            <span className={`text-sm font-semibold ${severity.color}`}>
              {severity.label}
            </span>
            {evLossBbPer100 > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                −{evLossBbPer100.toFixed(1)} bb/100
              </span>
            )}
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-gray-800/50 pt-3">
            <p className="text-sm text-gray-300 leading-relaxed">{explanation}</p>
            {evLossBbPer100 > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">Estimated EV loss:</span>
                <span className={`text-sm font-mono font-semibold ${severity.color}`}>
                  −{evLossBbPer100.toFixed(1)} bb/100
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};