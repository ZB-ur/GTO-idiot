import React from 'react';

interface HandStrengthBadgeProps {
  handDescription: string;
  equityPercent: number;
  draws?: string[];
  className?: string;
}

export const HandStrengthBadge: React.FC<HandStrengthBadgeProps> = ({
  handDescription,
  equityPercent,
  draws,
  className = '',
}) => {
  const clampedEquity = Math.min(100, Math.max(0, equityPercent));

  const equityColor =
    clampedEquity >= 70
      ? 'bg-emerald-400'
      : clampedEquity >= 40
        ? 'bg-amber-400'
        : 'bg-red-400';

  return (
    <div
      className={`
        inline-flex flex-col gap-1.5 px-3 py-2 rounded-lg
        bg-gray-900/90 border border-gray-700
        shadow-lg shadow-black/40 backdrop-blur-sm
        ${className}
      `}
    >
      {/* Hand label */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-gray-50 whitespace-nowrap">
          {handDescription}
        </span>
        <span className="text-xs font-bold tabular-nums text-amber-400">
          {clampedEquity}%
        </span>
      </div>

      {/* Equity bar */}
      <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${equityColor}`}
          style={{ width: `${clampedEquity}%` }}
        />
      </div>

      {/* Draws */}
      {draws && draws.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {draws.map((draw, i) => (
            <span
              key={i}
              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700"
            >
              {draw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default HandStrengthBadge;