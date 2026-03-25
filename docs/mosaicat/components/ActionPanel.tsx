'use client';

import { useState, useMemo, useCallback } from 'react';

interface ActionOption {
  type: string;
  isAvailable: boolean;
  minAmount?: number;
  maxAmount?: number;
  callAmount?: number;
}

interface PotPreset {
  label: string;
  amount: number;
}

interface ActionPanelProps {
  actions: ActionOption[];
  potPresets: PotPreset[];
  onAction: (actionType: string, amount?: number) => void;
  visible: boolean;
}

const ACTION_STYLES: Record<string, string> = {
  fold: 'bg-gray-600 hover:bg-gray-500 text-gray-100',
  check: 'bg-emerald-700 hover:bg-emerald-600 text-white',
  call: 'bg-blue-700 hover:bg-blue-600 text-white',
  bet: 'bg-yellow-600 hover:bg-yellow-500 text-black',
  raise: 'bg-yellow-600 hover:bg-yellow-500 text-black',
  all_in: 'bg-red-700 hover:bg-red-600 text-white',
};

const ACTION_LABELS: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  all_in: 'All In',
};

export default function ActionPanel({
  actions,
  potPresets,
  onAction,
  visible,
}: ActionPanelProps) {
  const availableActions = useMemo(
    () => actions.filter((a) => a.isAvailable),
    [actions],
  );

  const raiseAction = useMemo(
    () => availableActions.find((a) => a.type === 'raise' || a.type === 'bet'),
    [availableActions],
  );

  const callAction = useMemo(
    () => availableActions.find((a) => a.type === 'call'),
    [availableActions],
  );

  const [raiseAmount, setRaiseAmount] = useState(raiseAction?.minAmount ?? 0);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);

  const raiseMin = raiseAction?.minAmount ?? 0;
  const raiseMax = raiseAction?.maxAmount ?? 100;

  const handleAction = useCallback(
    (actionType: string) => {
      if (actionType === 'raise' || actionType === 'bet') {
        if (!showRaiseSlider) {
          setShowRaiseSlider(true);
          setRaiseAmount(raiseMin);
          return;
        }
        onAction(actionType, raiseAmount);
        setShowRaiseSlider(false);
      } else {
        setShowRaiseSlider(false);
        if (actionType === 'call' && callAction?.callAmount) {
          onAction('call', callAction.callAmount);
        } else if (actionType === 'all_in') {
          onAction('all_in', raiseMax);
        } else {
          onAction(actionType);
        }
      }
    },
    [showRaiseSlider, raiseAmount, raiseMin, raiseMax, callAction, onAction],
  );

  const handlePreset = useCallback(
    (amount: number) => {
      const clamped = Math.max(raiseMin, Math.min(raiseMax, amount));
      setRaiseAmount(clamped);
    },
    [raiseMin, raiseMax],
  );

  const handleConfirmRaise = useCallback(() => {
    const actionType = raiseAction?.type ?? 'raise';
    onAction(actionType, raiseAmount);
    setShowRaiseSlider(false);
  }, [raiseAction, raiseAmount, onAction]);

  if (!visible || availableActions.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-lg mx-auto">
      {/* Raise slider + presets */}
      {showRaiseSlider && raiseAction && (
        <div className="w-full bg-gray-800/90 rounded-xl p-4 border border-gray-700 space-y-3">
          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Min: {raiseMin}</span>
              <span className="text-white text-sm font-bold tabular-nums">
                {raiseAmount.toFixed(1)} BB
              </span>
              <span>Max: {raiseMax}</span>
            </div>
            <input
              type="range"
              min={raiseMin}
              max={raiseMax}
              step={0.5}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Pot presets */}
          {potPresets.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-center">
              {potPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePreset(preset.amount)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {/* Confirm button */}
          <button
            type="button"
            onClick={handleConfirmRaise}
            className="w-full py-2.5 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors active:scale-[0.98]"
          >
            {raiseAction.type === 'bet' ? 'Bet' : 'Raise'} to {raiseAmount.toFixed(1)} BB
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap justify-center">
        {availableActions.map((action) => {
          const label =
            action.type === 'call' && action.callAmount
              ? `Call ${action.callAmount}`
              : action.type === 'raise' && showRaiseSlider
                ? `Raise to ${raiseAmount.toFixed(1)}`
                : ACTION_LABELS[action.type] ?? action.type;

          return (
            <button
              key={action.type}
              type="button"
              onClick={() => handleAction(action.type)}
              className={`
                px-5 py-2.5 rounded-lg font-bold text-sm transition-all
                ${ACTION_STYLES[action.type] ?? 'bg-gray-600 text-white'}
                cursor-pointer active:scale-95
              `}
            >
              {label}
            </button>
          );
        })}

        {showRaiseSlider && (
          <button
            type="button"
            onClick={() => setShowRaiseSlider(false)}
            className="px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}