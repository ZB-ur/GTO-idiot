import React from 'react';

interface GTORatingSummaryProps {
  optimalCount: number;
  acceptableCount: number;
  errorCount: number;
}

export const GTORatingSummary: React.FC<GTORatingSummaryProps> = ({
  optimalCount,
  acceptableCount,
  errorCount,
}) => {
  return (
    <div className="inline-flex items-center gap-3 text-sm">
      <span className="inline-flex items-center gap-1 text-emerald-500">
        <span>✅</span>
        <span className="font-medium">{optimalCount}</span>
      </span>
      <span className="inline-flex items-center gap-1 text-yellow-500">
        <span>⚠️</span>
        <span className="font-medium">{acceptableCount}</span>
      </span>
      <span className="inline-flex items-center gap-1 text-red-500">
        <span>❌</span>
        <span className="font-medium">{errorCount}</span>
      </span>
    </div>
  );
};

export default GTORatingSummary;