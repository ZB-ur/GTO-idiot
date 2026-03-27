import React from 'react';

interface ProgressBarProps {
  percent: number;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  label,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">{label}</span>
          <span className="text-sm font-semibold text-amber-400">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};