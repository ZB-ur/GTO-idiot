import React, { useCallback, useMemo, useRef, useState } from 'react';

export interface RaiseSliderProps {
  /** Minimum raise amount (BB) */
  min: number;
  /** Maximum raise amount (BB), typically player's remaining stack */
  max: number;
  /** Current pot size (BB) — used for preset calculations */
  pot: number;
  /** Current selected raise value (BB) */
  value: number;
  /** Callback when raise value changes */
  onChange: (value: number) => void;
  /** Custom preset multipliers (fractions of pot). Defaults to [0.33, 0.66, 1] */
  presets?: number[];
}

interface PresetButton {
  label: string;
  amount: number;
}

const DEFAULT_PRESETS = [0.33, 0.66, 1];

const formatPresetLabel = (multiplier: number): string => {
  if (multiplier === 1) return 'Pot';
  if (multiplier === 0.5) return '½ Pot';
  if (multiplier === 0.33) return '⅓ Pot';
  if (multiplier === 0.66) return '⅔ Pot';
  if (multiplier === 0.75) return '¾ Pot';
  if (multiplier === 2) return '2× Pot';
  return `${Math.round(multiplier * 100)}%`;
};

export const RaiseSlider: React.FC<RaiseSliderProps> = ({
  min,
  max,
  pot,
  value,
  onChange,
  presets = DEFAULT_PRESETS,
}) => {
  const [inputText, setInputText] = useState<string>(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  const clamp = useCallback(
    (val: number) => Math.min(Math.max(Math.round(val), min), max),
    [min, max]
  );

  // Sync inputText when value changes externally
  React.useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setInputText(String(value));
    }
  }, [value]);

  const percentage = useMemo(() => {
    if (max <= min) return 0;
    return ((value - min) / (max - min)) * 100;
  }, [value, min, max]);

  const isAllIn = value >= max;

  const presetButtons: PresetButton[] = useMemo(
    () =>
      presets.map((mult) => ({
        label: formatPresetLabel(mult),
        amount: clamp(Math.round(pot * mult)),
      })),
    [presets, pot, clamp]
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const clamped = clamp(Number(e.target.value));
      onChange(clamped);
      setInputText(String(clamped));
    },
    [onChange, clamp]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      setInputText(raw);
      if (raw !== '') {
        onChange(clamp(Number(raw)));
      }
    },
    [onChange, clamp]
  );

  const handleInputBlur = useCallback(() => {
    setInputText(String(value));
  }, [value]);

  const handlePreset = useCallback(
    (amount: number) => {
      onChange(amount);
      setInputText(String(amount));
    },
    [onChange]
  );

  return (
    <div className="w-full space-y-3">
      {/* Header: Label + Manual Input */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-50">
          Raise to
        </span>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={inputText}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-24 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-right text-sm font-semibold text-gray-50 placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              aria-label="Raise amount in BB"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              BB
            </span>
          </div>
          {isAllIn && (
            <span className="rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white animate-pulse">
              ALL IN
            </span>
          )}
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative px-1 py-2">
        {/* Background track */}
        <div className="relative h-2 w-full rounded-full bg-gray-800">
          {/* Filled portion */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-emerald-500 transition-[width] duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Native range input overlay */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={handleSliderChange}
          className="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-emerald-500
            [&::-webkit-slider-thumb]:bg-gray-950
            [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(16,185,129,0.4)]
            [&::-webkit-slider-thumb]:transition-shadow
            [&::-webkit-slider-thumb]:hover:shadow-[0_0_10px_rgba(16,185,129,0.6)]
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-emerald-500
            [&::-moz-range-thumb]:bg-gray-950
            [&::-moz-range-thumb]:shadow-[0_0_6px_rgba(16,185,129,0.4)]"
          aria-label="Raise amount slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between px-1">
        <span className="text-xs text-gray-500">Min {min}</span>
        <span className="text-xs text-gray-500">Max {max}</span>
      </div>

      {/* Preset Quick-Amount Buttons */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${presetButtons.length}, 1fr)` }}>
        {presetButtons.map((preset) => {
          const isActive = value === preset.amount;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePreset(preset.amount)}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-emerald-500 hover:text-emerald-400'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RaiseSlider;