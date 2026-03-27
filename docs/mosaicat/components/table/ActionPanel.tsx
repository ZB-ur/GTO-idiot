import React, { useState, useCallback } from 'react';

interface AvailableActions {
  canFold: boolean;
  canCheck: boolean;
  canCall: boolean;
  canRaise: boolean;
  callAmount?: number;
  minRaise?: number;
  maxRaise?: number;
}

interface PlayerActionRequest {
  actionType: 'fold' | 'check' | 'call' | 'raise';
  amount?: number;
}

interface ActionPanelProps {
  availableActions: AvailableActions;
  onAction: (action: PlayerActionRequest) => void;
  disabled?: boolean;
}

const QUICK_RAISE_PRESETS = [
  { label: '2.5x', multiplier: 2.5 },
  { label: '3x', multiplier: 3 },
  { label: '½ Pot', multiplier: null, potFraction: 0.5 },
  { label: 'Pot', multiplier: null, potFraction: 1 },
];

export function ActionPanel({ availableActions, onAction, disabled = false }: ActionPanelProps) {
  const { canFold, canCheck, canCall, canRaise, callAmount, minRaise, maxRaise } = availableActions;
  const [raiseAmount, setRaiseAmount] = useState<number>(minRaise ?? 0);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);

  const handleFold = useCallback(() => {
    onAction({ actionType: 'fold' });
  }, [onAction]);

  const handleCheck = useCallback(() => {
    onAction({ actionType: 'check' });
  }, [onAction]);

  const handleCall = useCallback(() => {
    onAction({ actionType: 'call' });
  }, [onAction]);

  const handleRaise = useCallback(() => {
    onAction({ actionType: 'raise', amount: raiseAmount });
    setShowRaiseSlider(false);
  }, [onAction, raiseAmount]);

  const handleAllIn = useCallback(() => {
    onAction({ actionType: 'raise', amount: maxRaise });
    setShowRaiseSlider(false);
  }, [onAction, maxRaise]);

  return (
    <div className="w-full bg-gray-900 border-t border-gray-700 px-4 py-3">
      {/* Raise slider row */}
      {showRaiseSlider && canRaise && minRaise != null && maxRaise != null && (
        <div className="flex items-center gap-3 mb-3 px-2">
          <span className="text-gray-400 text-sm min-w-[40px]">{minRaise}</span>
          <input
            type="range"
            min={minRaise}
            max={maxRaise}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            className="flex-1 accent-amber-500 h-2"
            disabled={disabled}
          />
          <span className="text-gray-400 text-sm min-w-[40px] text-right">{maxRaise}</span>
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 min-w-[64px] text-center">
            <span className="text-amber-500 font-bold text-lg">{raiseAmount}</span>
          </div>
        </div>
      )}

      {/* Quick raise presets */}
      {showRaiseSlider && canRaise && (
        <div className="flex gap-2 mb-3 px-2">
          {QUICK_RAISE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                if (minRaise != null) {
                  const val = preset.multiplier
                    ? Math.round(minRaise * preset.multiplier)
                    : minRaise; // pot fraction would need pot context
                  setRaiseAmount(Math.min(val, maxRaise ?? val));
                }
              }}
              disabled={disabled}
              className="flex-1 py-1.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-gray-50 transition-colors disabled:opacity-40"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Main action buttons row */}
      <div className="flex items-center gap-3">
        {/* Fold */}
        {canFold && (
          <button
            onClick={handleFold}
            disabled={disabled}
            className="flex-1 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 font-semibold text-base hover:bg-gray-700 hover:text-gray-50 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            弃牌
          </button>
        )}

        {/* Check */}
        {canCheck && (
          <button
            onClick={handleCheck}
            disabled={disabled}
            className="flex-1 py-3 rounded-xl bg-emerald-900 border border-emerald-700 text-emerald-300 font-semibold text-base hover:bg-emerald-800 hover:text-emerald-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            过牌
          </button>
        )}

        {/* Call */}
        {canCall && (
          <button
            onClick={handleCall}
            disabled={disabled}
            className="flex-1 py-3 rounded-xl bg-sky-900 border border-sky-700 text-sky-300 font-semibold text-base hover:bg-sky-800 hover:text-sky-100 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            跟注 {callAmount}
          </button>
        )}

        {/* Raise toggle / confirm */}
        {canRaise && (
          showRaiseSlider ? (
            <div className="flex-1 flex gap-2">
              <button
                onClick={handleRaise}
                disabled={disabled}
                className="flex-1 py-3 rounded-xl bg-amber-500 text-gray-950 font-bold text-base hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                加注 {raiseAmount}
              </button>
              <button
                onClick={handleAllIn}
                disabled={disabled}
                className="py-3 px-4 rounded-xl bg-red-600 text-gray-50 font-bold text-base hover:bg-red-500 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                全押
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowRaiseSlider(true)}
              disabled={disabled}
              className="flex-1 py-3 rounded-xl bg-amber-500 text-gray-950 font-bold text-base hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              加注
            </button>
          )
        )}
      </div>
    </div>
  );
}