import React, { useMemo } from 'react';

interface SuggestedSizing {
  label: string;
  amount: number;
}

interface RaiseSliderProps {
  minRaise: number;
  maxRaise: number;
  potSize: number;
  value: number;
  onChange: (value: number) => void;
  suggestedSizings?: SuggestedSizing[];
}

function formatBB(amount: number, bb: number = 2): string {
  return `${(amount / bb).toFixed(1)} BB`;
}

function formatChips(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  return amount.toString();
}

export const RaiseSlider: React.FC<RaiseSliderProps> = ({
  minRaise,
  maxRaise,
  potSize,
  value,
  onChange,
  suggestedSizings,
}) => {
  const percentage = useMemo(() => {
    if (maxRaise === minRaise) return 100;
    return ((value - minRaise) / (maxRaise - minRaise)) * 100;
  }, [value, minRaise, maxRaise]);

  const potPercentage = useMemo(() => {
    if (potSize === 0) return 0;
    return Math.round((value / potSize) * 100);
  }, [value, potSize]);

  const defaultSizings: SuggestedSizing[] = suggestedSizings ?? [
    { label: '33%', amount: Math.round(potSize * 0.33) },
    { label: '50%', amount: Math.round(potSize * 0.5) },
    { label: '75%', amount: Math.round(potSize * 0.75) },
    { label: 'Pot', amount: potSize },
    { label: 'All-In', amount: maxRaise },
  ];

  const validSizings = defaultSizings.filter(
    (s) => s.amount >= minRaise && s.amount <= maxRaise
  );

  return (
    <div className="w-full space-y-3">
      {/* Value display */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">
          Raise to {formatChips(value)}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{formatBB(value)}</span>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            {potPercentage}% pot
          </span>
        </div>
      </div>

      {/* Slider track */}
      <div className="relative">
        <input
          type="range"
          min={minRaise}
          max={maxRaise}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:bg-blue-600
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white"
          style={{
            background: `linear-gradient(to right, #2563eb ${percentage}%, #e5e7eb ${percentage}%)`,
          }}
        />
        {/* Min/Max labels */}
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{formatChips(minRaise)}</span>
          <span className="text-xs text-gray-400">{formatChips(maxRaise)}</span>
        </div>
      </div>

      {/* Suggested sizing buttons */}
      {validSizings.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {validSizings.map((sizing) => (
            <button
              key={sizing.label}
              onClick={() => onChange(sizing.amount)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                ${
                  value === sizing.amount
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                }
              `}
            >
              {sizing.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};