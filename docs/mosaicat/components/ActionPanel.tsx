import React, { useState, useCallback, useMemo } from 'react';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

export interface AvailableActions {
  canFold: boolean;
  canCheck: boolean;
  canCall: boolean;
  callAmount?: number;
  canBet: boolean;
  canRaise: boolean;
  minRaise?: number;
  maxRaise?: number;
  potSizeBet?: number;
  halfPotBet?: number;
  threeQuarterPotBet?: number;
  canAllIn: boolean;
  allInAmount?: number;
}

interface ActionPanelProps {
  availableActions: AvailableActions;
  onAction: (action: ActionType, amount?: number) => void;
  disabled: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  availableActions,
  onAction,
  disabled,
}) => {
  const {
    canFold, canCheck, canCall, callAmount,
    canBet, canRaise, minRaise, maxRaise,
    potSizeBet, halfPotBet, threeQuarterPotBet,
    canAllIn, allInAmount,
  } = availableActions;

  const showSlider = canBet || canRaise;
  const min = minRaise ?? 0;
  const max = maxRaise ?? 0;

  const [betAmount, setBetAmount] = useState(min);

  const presetButtons = useMemo(() => {
    const presets: { label: string; amount: number }[] = [];
    if (halfPotBet && halfPotBet >= min && halfPotBet <= max) {
      presets.push({ label: '½ Pot', amount: halfPotBet });
    }
    if (threeQuarterPotBet && threeQuarterPotBet >= min && threeQuarterPotBet <= max) {
      presets.push({ label: '¾ Pot', amount: threeQuarterPotBet });
    }
    if (potSizeBet && potSizeBet >= min && potSizeBet <= max) {
      presets.push({ label: 'Pot', amount: potSizeBet });
    }
    return presets;
  }, [halfPotBet, threeQuarterPotBet, potSizeBet, min, max]);

  const handleBetRaise = useCallback(() => {
    onAction(canRaise ? 'raise' : 'bet', betAmount);
  }, [onAction, canRaise, betAmount]);

  return (
    <div className="bg-gray-900 border-t border-gray-700 px-4 py-4 space-y-3">
      {/* Bet Slider Row */}
      {showSlider && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {presetButtons.map((p) => (
              <button
                key={p.label}
                onClick={() => setBetAmount(p.amount)}
                disabled={disabled}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-50 transition-colors disabled:opacity-40"
              >
                {p.label}
              </button>
            ))}
            <div className="flex-1 flex items-center gap-3">
              <input
                type="range"
                min={min}
                max={max}
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={disabled}
                className="flex-1 h-1.5 accent-emerald-500 bg-gray-700 rounded-full appearance-none cursor-pointer disabled:opacity-40"
              />
              <span className="text-sm font-mono font-semibold text-emerald-400 min-w-[4rem] text-right">
                {betAmount}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2">
        {/* Fold */}
        {canFold && (
          <button
            onClick={() => onAction('fold')}
            disabled={disabled}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-gray-800 text-red-400 border border-gray-700 hover:bg-red-400/10 hover:border-red-400/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Fold
          </button>
        )}

        {/* Check */}
        {canCheck && (
          <button
            onClick={() => onAction('check')}
            disabled={disabled}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-gray-800 text-sky-400 border border-gray-700 hover:bg-sky-400/10 hover:border-sky-400/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Check
          </button>
        )}

        {/* Call */}
        {canCall && (
          <button
            onClick={() => onAction('call')}
            disabled={disabled}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-gray-800 text-emerald-400 border border-gray-700 hover:bg-emerald-400/10 hover:border-emerald-400/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Call {callAmount}
          </button>
        )}

        {/* Bet / Raise */}
        {showSlider && (
          <button
            onClick={handleBetRaise}
            disabled={disabled}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-emerald-500 text-gray-950 hover:bg-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {canRaise ? 'Raise' : 'Bet'} {betAmount}
          </button>
        )}

        {/* All-In */}
        {canAllIn && (
          <button
            onClick={() => onAction('all_in', allInAmount)}
            disabled={disabled}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-amber-400 text-gray-950 hover:bg-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            All-In {allInAmount}
          </button>
        )}
      </div>
    </div>
  );
};