import React, { useCallback, useMemo } from 'react';

interface RaiseSliderProps {
  minRaise: number;
  maxRaise: number;
  pot: number;
  value: number;
  onChange: (amount: number) => void;
  onConfirm: (amount: number) => void;
}

interface PresetRaiseButtonProps {
  label: string;
  amount: number;
  isActive: boolean;
  onClick: (amount: number) => void;
}

const PresetRaiseButton: React.FC<PresetRaiseButtonProps> = ({
  label,
  amount,
  isActive,
  onClick,
}) => (
  <button
    onClick={() => onClick(amount)}
    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-emerald-500 text-white shadow-md'
        : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-gray-100'
    }`}
  >
    {label}
  </button>
);

export const RaiseSlider: React.FC<RaiseSliderProps> = ({
  minRaise,
  maxRaise,
  pot,
  value,
  onChange,
  onConfirm,
}) => {
  const presets = useMemo(() => {
    const items = [
      { label: 'Min', amount: minRaise },
      { label: '½ Pot', amount: Math.round(pot * 0.5) },
      { label: '¾ Pot', amount: Math.round(pot * 0.75) },
      { label: 'Pot', amount: pot },
      { label: 'All-In', amount: maxRaise },
    ];
    return items.filter((p) => p.amount >= minRaise && p.amount <= maxRaise);
  }, [minRaise, maxRaise, pot]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = Number(e.target.value);
      if (!isNaN(num)) {
        onChange(Math.min(maxRaise, Math.max(minRaise, num)));
      }
    },
    [onChange, minRaise, maxRaise],
  );

  const sliderPercent = ((value - minRaise) / (maxRaise - minRaise)) * 100;

  return (
    <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4 shadow-xl">
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <PresetRaiseButton
            key={preset.label}
            label={preset.label}
            amount={preset.amount}
            isActive={value === preset.amount}
            onClick={onChange}
          />
        ))}
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div className="relative w-full h-2 bg-gray-700 rounded-full">
          <div
            className="absolute h-2 bg-emerald-500 rounded-full"
            style={{ width: `${sliderPercent}%` }}
          />
          <input
            type="range"
            min={minRaise}
            max={maxRaise}
            value={value}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md border-2 border-emerald-500 pointer-events-none"
            style={{ left: `calc(${sliderPercent}% - 10px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{minRaise}</span>
          <span>{maxRaise}</span>
        </div>
      </div>

      {/* Input + Confirm */}
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={minRaise}
          max={maxRaise}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-center font-bold text-lg tabular-nums focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
        />
        <button
          onClick={() => onConfirm(value)}
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-2 rounded-lg transition-colors duration-150 shadow-md"
        >
          Raise
        </button>
      </div>
    </div>
  );
};

export default RaiseSlider;