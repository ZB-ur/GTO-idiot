import React, { useState, useCallback } from 'react';

// Types
export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

export interface ActionOption {
  type: ActionType;
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  label?: string;
}

export interface AvailableActions {
  canFold: boolean;
  canCheck: boolean;
  canCall: boolean;
  callAmount?: number;
  canBet: boolean;
  betMin?: number;
  betMax?: number;
  canRaise: boolean;
  raiseMin?: number;
  raiseMax?: number;
  canAllIn: boolean;
  allInAmount?: number;
}

export interface PlayerAction {
  type: ActionType;
  amount?: number;
}

interface ActionPanelProps {
  availableActions: AvailableActions;
  onAction: (action: PlayerAction) => void;
  potOdds?: string;
  disabled?: boolean;
}

const ACTION_STYLES: Record<string, string> = {
  fold: 'bg-gray-500 hover:bg-gray-600 text-white',
  check: 'bg-blue-600 hover:bg-blue-700 text-white',
  call: 'bg-green-500 hover:bg-green-600 text-white',
  bet: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  raise: 'bg-red-500 hover:bg-red-600 text-white',
  all_in: 'bg-red-700 hover:bg-red-800 text-white',
};

const POT_PRESETS = [
  { label: '1/3', fraction: 1 / 3 },
  { label: '1/2', fraction: 1 / 2 },
  { label: '2/3', fraction: 2 / 3 },
  { label: 'Pot', fraction: 1 },
];

export const ActionPanel: React.FC<ActionPanelProps> = ({
  availableActions,
  onAction,
  potOdds,
  disabled = false,
}) => {
  const showSlider = availableActions.canBet || availableActions.canRaise;
  const sliderMin = availableActions.canRaise
    ? availableActions.raiseMin ?? 0
    : availableActions.betMin ?? 0;
  const sliderMax = availableActions.canRaise
    ? availableActions.raiseMax ?? 0
    : availableActions.betMax ?? 0;

  const [sliderValue, setSliderValue] = useState<number>(sliderMin);

  const handleAction = useCallback(
    (type: ActionType, amount?: number) => {
      if (disabled) return;
      onAction({ type, amount });
    },
    [disabled, onAction]
  );

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(e.target.value));
  };

  const handlePreset = (fraction: number) => {
    // Assumes pot size context is available; here we scale between min/max
    const value = Math.min(
      sliderMax,
      Math.max(sliderMin, Math.round(sliderMin + (sliderMax - sliderMin) * fraction))
    );
    setSliderValue(value);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Pot odds hint */}
        {potOdds && (
          <div className="text-center mb-2">
            <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1">
              Pot Odds: {potOdds}
            </span>
          </div>
        )}

        {/* Raise/Bet slider */}
        {showSlider && (
          <div className="mb-3 px-2">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {POT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePreset(preset.fraction)}
                    disabled={disabled}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-40"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={sliderMin}
                max={sliderMax}
                value={sliderValue}
                onChange={handleSliderChange}
                disabled={disabled}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500 disabled:opacity-40"
              />
              <span className="text-sm font-bold text-gray-900 min-w-[4rem] text-right">
                {sliderValue} BB
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 justify-center">
          {availableActions.canFold && (
            <button
              onClick={() => handleAction('fold')}
              disabled={disabled}
              className={`flex-1 max-w-[140px] py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all ${ACTION_STYLES.fold} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Fold
            </button>
          )}

          {availableActions.canCheck && (
            <button
              onClick={() => handleAction('check')}
              disabled={disabled}
              className={`flex-1 max-w-[140px] py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all ${ACTION_STYLES.check} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Check
            </button>
          )}

          {availableActions.canCall && (
            <button
              onClick={() => handleAction('call', availableActions.callAmount)}
              disabled={disabled}
              className={`flex-1 max-w-[140px] py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all ${ACTION_STYLES.call} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Call {availableActions.callAmount ? `${availableActions.callAmount}` : ''}
            </button>
          )}

          {availableActions.canBet && (
            <button
              onClick={() => handleAction('bet', sliderValue)}
              disabled={disabled}
              className={`flex-1 max-w-[140px] py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all ${ACTION_STYLES.bet} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Bet {sliderValue}
            </button>
          )}

          {availableActions.canRaise && (
            <button
              onClick={() => handleAction('raise', sliderValue)}
              disabled={disabled}
              className={`flex-1 max-w-[140px] py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all ${ACTION_STYLES.raise} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Raise {sliderValue}
            </button>
          )}

          {availableActions.canAllIn && (
            <button
              onClick={() => handleAction('all_in', availableActions.allInAmount)}
              disabled={disabled}
              className={`flex-1 max-w-[140px] py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${ACTION_STYLES.all_in} disabled:opacity-40 disabled:cursor-not-allowed ring-2 ring-red-300`}
            >
              All In {availableActions.allInAmount ?? ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;