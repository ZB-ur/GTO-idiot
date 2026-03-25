import React, { useState, useCallback, useMemo } from 'react';

interface RaiseButtonProps {
  minRaise: number;
  maxRaise: number;
  potSize: number;
  onRaise: (amount: number) => void;
  disabled?: boolean;
  isAvailable: boolean;
}

const POT_SHORTCUTS = [
  { label: '½ Pot', multiplier: 0.5 },
  { label: '¾ Pot', multiplier: 0.75 },
  { label: 'Pot', multiplier: 1 },
];

export const RaiseButton: React.FC<RaiseButtonProps> = ({
  minRaise,
  maxRaise,
  potSize,
  onRaise,
  disabled = false,
  isAvailable,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(minRaise);

  const clamp = useCallback(
    (value: number) => Math.min(maxRaise, Math.max(minRaise, Math.round(value))),
    [minRaise, maxRaise],
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRaiseAmount(clamp(Number(e.target.value)));
    },
    [clamp],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      if (!isNaN(val)) setRaiseAmount(clamp(val));
    },
    [clamp],
  );

  const handleShortcut = useCallback(
    (multiplier: number) => {
      setRaiseAmount(clamp(Math.round(potSize * multiplier)));
    },
    [potSize, clamp],
  );

  const handleConfirm = useCallback(() => {
    onRaise(raiseAmount);
    setExpanded(false);
  }, [onRaise, raiseAmount]);

  const handleToggle = useCallback(() => {
    if (!disabled && isAvailable) {
      setExpanded((prev) => !prev);
      setRaiseAmount(minRaise);
    }
  }, [disabled, isAvailable, minRaise]);

  const sliderPercent = useMemo(() => {
    if (maxRaise === minRaise) return 100;
    return ((raiseAmount - minRaise) / (maxRaise - minRaise)) * 100;
  }, [raiseAmount, minRaise, maxRaise]);

  if (!isAvailable) return null;

  return (
    <div className="flex flex-col items-stretch gap-2">
      {expanded && (
        <div className="bg-emerald-900/90 backdrop-blur rounded-xl p-4 space-y-3 border border-emerald-700/50 shadow-lg animate-in slide-in-from-bottom-2">
          {/* Pot-size shortcuts */}
          <div className="flex gap-2">
            {POT_SHORTCUTS.map((s) => {
              const shortcutAmount = clamp(Math.round(potSize * s.multiplier));
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleShortcut(s.multiplier)}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700/60 text-emerald-100 hover:bg-emerald-600/80 transition-colors"
                >
                  {s.label}
                  <span className="block text-[10px] text-emerald-300/70">{shortcutAmount}</span>
                </button>
              );
            })}
          </div>

          {/* Slider */}
          <div className="relative">
            <input
              type="range"
              min={minRaise}
              max={maxRaise}
              step={1}
              value={raiseAmount}
              onChange={handleSliderChange}
              className="w-full h-2 appearance-none rounded-full bg-emerald-700/50 accent-emerald-400 cursor-pointer"
              style={{
                background: `linear-gradient(to right, #34d399 0%, #34d399 ${sliderPercent}%, rgba(6,78,59,0.5) ${sliderPercent}%, rgba(6,78,59,0.5) 100%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-emerald-400/60 mt-1">
              <span>{minRaise}</span>
              <span>{maxRaise}</span>
            </div>
          </div>

          {/* Amount input + confirm */}
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={minRaise}
              max={maxRaise}
              value={raiseAmount}
              onChange={handleInputChange}
              className="flex-1 bg-emerald-950/60 border border-emerald-600/40 rounded-lg px-3 py-2 text-center text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            />
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg transition-colors shadow-md"
            >
              Raise
            </button>
          </div>
        </div>
      )}

      {/* Main raise button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full py-3.5 rounded-xl font-bold text-base transition-all
          ${disabled
            ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
            : expanded
              ? 'bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/30'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-md hover:shadow-lg hover:shadow-emerald-500/20'
          }
        `}
      >
        {expanded ? 'Cancel' : `Raise`}
      </button>
    </div>
  );
};

export default RaiseButton;