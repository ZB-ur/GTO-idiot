import React, { useState, useCallback } from 'react';

type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

interface AvailableAction {
  type: ActionType;
  isAvailable: boolean;
}

interface AvailableActions {
  actions: AvailableAction[];
  callAmount?: number;
  minRaise?: number;
  maxRaise?: number;
  potSize?: number;
}

interface ActionPanelProps {
  availableActions: AvailableActions;
  onAction: (action: string, amount?: number) => void;
  gtoCoverage?: boolean;
  disabled?: boolean;
}

function isActionAvailable(actions: AvailableAction[], type: ActionType): boolean {
  return actions.some((a) => a.type === type && a.isAvailable);
}

const potFractions = [
  { label: '⅓ Pot', fraction: 1 / 3 },
  { label: '½ Pot', fraction: 1 / 2 },
  { label: '¾ Pot', fraction: 3 / 4 },
  { label: 'Pot', fraction: 1 },
];

export const ActionPanel: React.FC<ActionPanelProps> = ({
  availableActions,
  onAction,
  gtoCoverage,
  disabled = false,
}) => {
  const { actions, callAmount, minRaise, maxRaise, potSize } = availableActions;

  const canFold = isActionAvailable(actions, 'fold');
  const canCheck = isActionAvailable(actions, 'check');
  const canCall = isActionAvailable(actions, 'call');
  const canBet = isActionAvailable(actions, 'bet');
  const canRaise = isActionAvailable(actions, 'raise');
  const canAllIn = isActionAvailable(actions, 'all_in');
  const showSizing = canBet || canRaise;

  const [betAmount, setBetAmount] = useState<number>(minRaise ?? 0);

  const handleSizingClick = useCallback((fraction: number) => {
    if (potSize) {
      const amount = Math.max(minRaise ?? 0, Math.min(maxRaise ?? Infinity, Math.round(potSize * fraction * 10) / 10));
      setBetAmount(amount);
    }
  }, [potSize, minRaise, maxRaise]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(Number(e.target.value));
  }, []);

  const handleBetRaise = useCallback(() => {
    const action = canRaise ? 'raise' : 'bet';
    onAction(action, betAmount);
  }, [canRaise, betAmount, onAction]);

  return (
    <div className="bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl p-4 space-y-3">
      {/* GTO Coverage Badge */}
      {gtoCoverage !== undefined && (
        <div className="flex justify-end">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
            gtoCoverage
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-gray-700 text-gray-400 border border-gray-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${gtoCoverage ? 'bg-emerald-400' : 'bg-gray-500'}`} />
            GTO {gtoCoverage ? 'Available' : 'N/A'}
          </span>
        </div>
      )}

      {/* Sizing controls */}
      {showSizing && (
        <div className="space-y-2">
          {/* Quick sizing buttons */}
          <div className="flex gap-1.5">
            {potFractions.map(({ label, fraction }) => (
              <button
                key={label}
                className="flex-1 text-xs py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg transition-colors disabled:opacity-40"
                onClick={() => handleSizingClick(fraction)}
                disabled={disabled || !potSize}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Slider + amount display */}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={minRaise ?? 0}
              max={maxRaise ?? 100}
              step={0.5}
              value={betAmount}
              onChange={handleSliderChange}
              disabled={disabled}
              className="flex-1 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-sm font-mono font-semibold text-amber-400 min-w-[56px] text-right">
              {betAmount.toFixed(1)} BB
            </span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {/* Fold */}
        {canFold && (
          <button
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl border border-gray-700 transition-colors disabled:opacity-40"
            onClick={() => onAction('fold')}
            disabled={disabled}
          >
            Fold
          </button>
        )}

        {/* Check */}
        {canCheck && (
          <button
            className="flex-1 py-3 bg-emerald-900/50 hover:bg-emerald-900/70 text-emerald-400 font-semibold rounded-xl border border-emerald-700/50 transition-colors disabled:opacity-40"
            onClick={() => onAction('check')}
            disabled={disabled}
          >
            Check
          </button>
        )}

        {/* Call */}
        {canCall && (
          <button
            className="flex-1 py-3 bg-emerald-900/50 hover:bg-emerald-900/70 text-emerald-400 font-semibold rounded-xl border border-emerald-700/50 transition-colors disabled:opacity-40"
            onClick={() => onAction('call', callAmount)}
            disabled={disabled}
          >
            Call {callAmount !== undefined ? `${callAmount} BB` : ''}
          </button>
        )}

        {/* Bet / Raise */}
        {showSizing && (
          <button
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl transition-colors disabled:opacity-40"
            onClick={handleBetRaise}
            disabled={disabled}
          >
            {canRaise ? 'Raise' : 'Bet'} {betAmount.toFixed(1)}
          </button>
        )}

        {/* All-in */}
        {canAllIn && (
          <button
            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors disabled:opacity-40"
            onClick={() => onAction('all_in')}
            disabled={disabled}
          >
            All In
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionPanel;