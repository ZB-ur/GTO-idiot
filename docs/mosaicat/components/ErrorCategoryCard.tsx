import React from 'react';

interface ErrorCategoryCardProps {
  errorType: string;
  title: string;
  count: number;
  percentage: number;
  severity: string;
  explanation?: string;
  improvementTip?: string;
  expanded: boolean;
  onToggle: () => void;
  onViewHands?: (errorType: string) => void;
}

const severityColorMap: Record<string, { bg: string; text: string; label: string }> = {
  red: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Critical' },
  yellow: { bg: 'bg-amber-400/20', text: 'text-amber-400', label: 'Warning' },
  green: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Minor' },
  gray: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Info' },
};

export const ErrorCategoryCard: React.FC<ErrorCategoryCardProps> = ({
  errorType,
  title,
  count,
  percentage,
  severity,
  explanation,
  improvementTip,
  expanded,
  onToggle,
  onViewHands,
}) => {
  const colors = severityColorMap[severity] ?? severityColorMap.gray;

  return (
    <div className="bg-[#1e293b] border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-[#334155]/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
            {colors.label}
          </span>
          <span className="text-gray-100 font-medium truncate">{title}</span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className="text-gray-100 font-semibold">{count}</span>
            <span className="text-gray-500 text-sm ml-1">({percentage.toFixed(1)}%)</span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-700 p-4 space-y-3">
          {explanation && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Explanation</h4>
              <p className="text-sm text-gray-300">{explanation}</p>
            </div>
          )}
          {improvementTip && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">💡 Improvement Tip</h4>
              <p className="text-sm text-gray-300">{improvementTip}</p>
            </div>
          )}
          {onViewHands && (
            <button
              onClick={() => onViewHands(errorType)}
              className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              View related hands →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorCategoryCard;