import React, { useState, useCallback, useMemo } from 'react';

export interface AvailableAction {
  type: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
  amount?: number | null;
}

export interface ActionPanelProps {
  isUserTurn: boolean;
  availableActions: AvailableAction[];
  pot: number;
  minRaise?: number;
  maxRaise?: number;
  callAmount?: number;
  onAction: (action: string, amount?: number) => void;
  onHintRequest: () => void;
}

const ACTION_CONFIG: Record<string, { label: string; shortcut: string; color: string; hoverColor: string; icon: string }> = {
  fold: {
    label: 'Fold',
    shortcut: 'F',
    color: 'bg-gray-700',
    hoverColor: 'hover:bg-gray-600',
    icon: '✕',
  },
  check: {
    label: 'Check',
    shortcut: 'C',
    color: 'bg-emerald-600',
    hoverColor: 'hover:bg-emerald-500',
    icon: '✓',
  },
  call: {
    label: 'Call',
    shortcut: 'C',
    color: 'bg-emerald-600',
    hoverColor: 'hover:bg-emerald-500',
    icon: '✓',
  },
  raise: {
    label: 'Raise',
    shortcut: 'R',
    color: 'bg-yellow-600',
    hoverColor: 'hover:bg-yellow-500',
    icon: '↑',
  },
  all_in: {
    label: 'All In',
    shortcut: 'A',
    color: 'bg-red-600',
    hoverColor: 'hover:bg-red-500',
    icon: '★',
  },
};

const PRESET_SIZES = [
  { label: '33%', factor: 0.33 },
  { label: '50%', factor: 0.5 },
  { label: '66%', factor: 0.66 },
  { label: '100%', factor: 1.0 },
];

export const ActionPanel: React.FC<ActionPanelProps> = ({
  isUserTurn,
  availableActions,
  pot,
  minRaise,
  maxRaise,
  callAmount,
  onAction,
  onHintRequest,
}) => {
  const [raiseAmount, setRaiseAmount] = useState<number>(minRaise ?? 0);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);

  const hasAction = useCallback(
    (type: string) => availableActions.some((a) => a.type === type),
    [availableActions]
  );

  const canRaise = hasAction('raise');
  const canAllIn = hasAction('all_in');

  // Reset raise amount when minRaise changes
  React.useEffect(() => {
    if (minRaise !== undefined) {
      setRaiseAmount(minRaise);
    }
  }, [minRaise]);

  const presetAmounts = useMemo(() => {
    if (!minRaise || !maxRaise) return [];
    return PRESET_SIZES.map((p) => {
      const amount = Math.round(pot * p.factor);
      const clamped = Math.max(minRaise, Math.min(maxRaise, amount));
      return { ...p, amount: clamped };
    }).filter(
      (p, i, arr) => i === 0 || p.amount !== arr[i - 1].amount
    );
  }, [pot, minRaise, maxRaise]);

  const handleRaiseConfirm = useCallback(() => {
    onAction('raise', raiseAmount);
    setShowRaiseSlider(false);
  }, [onAction, raiseAmount]);

  const handleRaiseClick = useCallback(() => {
    if (canRaise) {
      setShowRaiseSlider((prev) => !prev);
    }
  }, [canRaise]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRaiseAmount(Number(e.target.value));
    },
    []
  );

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!isUserTurn) return;

    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'f' && hasAction('fold')) {
        onAction('fold');
      } else if (key === 'c') {
        if (hasAction('call')) onAction('call', callAmount);
        else if (hasAction('check')) onAction('check');
      } else if (key === 'r' && canRaise) {
        setShowRaiseSlider((prev) => !prev);
      } else if (key === 'enter' && showRaiseSlider) {
        handleRaiseConfirm();
      } else if (key === 'h') {
        onHintRequest();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isUserTurn, hasAction, onAction, callAmount, canRaise, showRaiseSlider, handleRaiseConfirm, onHintRequest]);

  return (
    <div
      className={`w-full transition-opacity duration-300 ${
        isUserTurn ? 'opacity-100' : 'opacity-40 pointer-events-none'
      }`}
    >
      {/* Raise Slider Panel */}
      {showRaiseSlider && canRaise && minRaise !== undefined && maxRaise !== undefined && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-3 animate-in slide-in-from-bottom-2">
          {/* Preset Buttons */}
          <div className="flex gap-2 mb-3">
            {presetAmounts.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setRaiseAmount(preset.amount)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  raiseAmount === preset.amount
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-xs font-mono w-10 text-right">
              {minRaise}
            </span>
            <input
              type="range"
              min={minRaise}
              max={maxRaise}
              step={1}
              value={raiseAmount}
              onChange={handleSliderChange}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <span className="text-gray-500 text-xs font-mono w-10">
              {maxRaise}
            </span>
          </div>

          {/* Amount Display & Confirm */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={minRaise}
                max={maxRaise}
                value={raiseAmount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= minRaise && val <= maxRaise) {
                    setRaiseAmount(val);
                  }
                }}
                className="w-20 bg-gray-900 border border-gray-600 rounded-lg px-2 py-1 text-center text-yellow-400 font-mono text-sm focus:outline-none focus:border-yellow-500"
              />
              <span className="text-gray-500 text-xs">BB</span>
            </div>
            <button
              onClick={handleRaiseConfirm}
              className="bg-yellow-600 hover:bg-yellow-500 text-white font-semibold px-6 py-1.5 rounded-lg transition-colors text-sm"
            >
              Raise to {raiseAmount} ↵
            </button>
          </div>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="flex gap-2">
        {/* Hint Button */}
        <button
          onClick={onHintRequest}
          disabled={!isUserTurn}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-emerald-400 rounded-xl px-3 py-3 transition-colors flex flex-col items-center justify-center gap-0.5"
          title="GTO Hint (H)"
        >
          <span className="text-lg">💡</span>
          <span className="text-[10px] font-medium">Hint</span>
        </button>

        {/* Action Buttons */}
        <div className="flex-1 flex gap-2">
          {availableActions.map((action) => {
            const config = ACTION_CONFIG[action.type];
            if (!config) return null;

            const isRaise = action.type === 'raise';
            const showAmount = action.type === 'call' && callAmount;

            return (
              <button
                key={action.type}
                onClick={() => {
                  if (isRaise) {
                    handleRaiseClick();
                  } else if (action.type === 'all_in') {
                    onAction('all_in', maxRaise);
                  } else {
                    onAction(action.type, action.amount ?? undefined);
                  }
                }}
                disabled={!isUserTurn}
                className={`flex-1 ${config.color} ${config.hoverColor} text-white font-semibold rounded-xl py-3 px-2 transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5 ${
                  isRaise && showRaiseSlider ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <span className="text-base leading-none">
                  {config.label}
                  {showAmount ? ` ${callAmount}` : ''}
                </span>
                <span className="text-[10px] text-white/50 font-mono">
                  {config.shortcut}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Turn Indicator */}
      {!isUserTurn && (
        <div className="text-center mt-2">
          <span className="text-gray-500 text-xs">Waiting for opponent...</span>
        </div>
      )}
    </div>
  );
};

export default ActionPanel;