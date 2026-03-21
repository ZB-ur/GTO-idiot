import React, { useState, useCallback } from 'react';

export interface AvailableAction {
  action: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin';
  minAmount?: number;
  maxAmount?: number;
}

export interface ActionPanelProps {
  availableActions: AvailableAction[];
  potSize: number;
  playerStack: number;
  amountToCall: number;
  onAction: (action: string, amount?: number) => void;
  disabled: boolean;
}

const actionLabels: Record<string, string> = {
  fold: '弃牌',
  check: '过牌',
  call: '跟注',
  bet: '下注',
  raise: '加注',
  allin: '全下',
};

const actionVariants: Record<string, { base: string; hover: string }> = {
  fold: {
    base: 'bg-red-500/20 text-red-400 border-red-500/40',
    hover: 'hover:bg-red-500/30',
  },
  check: {
    base: 'bg-gray-700 text-white border-gray-600',
    hover: 'hover:bg-gray-600',
  },
  call: {
    base: 'bg-emerald-600 text-white border-emerald-500',
    hover: 'hover:bg-emerald-500',
  },
  bet: {
    base: 'bg-emerald-600 text-white border-emerald-500',
    hover: 'hover:bg-emerald-500',
  },
  raise: {
    base: 'bg-emerald-600 text-white border-emerald-500',
    hover: 'hover:bg-emerald-500',
  },
  allin: {
    base: 'bg-red-600 text-white border-red-500',
    hover: 'hover:bg-red-500',
  },
};

interface QuickAmount {
  label: string;
  value: number;
}

const ActionPanel: React.FC<ActionPanelProps> = ({
  availableActions,
  potSize,
  playerStack,
  amountToCall,
  onAction,
  disabled,
}) => {
  const betAction = availableActions.find((a) => a.action === 'bet' || a.action === 'raise');
  const [betAmount, setBetAmount] = useState(betAction?.minAmount ?? 0);

  const quickAmounts: QuickAmount[] = betAction
    ? [
        { label: 'Min', value: betAction.minAmount ?? 0 },
        { label: '1/3 Pot', value: Math.round(potSize * 0.33) },
        { label: '1/2 Pot', value: Math.round(potSize * 0.5) },
        { label: '2/3 Pot', value: Math.round(potSize * 0.67) },
        { label: 'Pot', value: potSize },
        { label: 'All-In', value: betAction.maxAmount ?? playerStack },
      ]
    : [];

  const handleBetAmountChange = useCallback((val: number) => {
    setBetAmount(Math.min(Math.max(val, betAction?.minAmount ?? 0), betAction?.maxAmount ?? playerStack));
  }, [betAction, playerStack]);

  const handleAction = useCallback(
    (action: string) => {
      if (action === 'bet' || action === 'raise') {
        onAction(action, betAmount);
      } else {
        onAction(action);
      }
    },
    [onAction, betAmount],
  );

  const sliderPercent = betAction
    ? ((betAmount - (betAction.minAmount ?? 0)) / ((betAction.maxAmount ?? playerStack) - (betAction.minAmount ?? 0))) * 100
    : 0;

  return (
    <div className="w-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-4 space-y-3">
      {/* Bet sizer (if bet/raise available) */}
      {betAction && (
        <div className="space-y-2">
          {/* Quick amounts */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickAmounts.map((qa) => (
              <button
                key={qa.label}
                disabled={disabled}
                onClick={() => handleBetAmountChange(qa.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors
                  ${betAmount === qa.value
                    ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500/50'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                  }
                  disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {qa.label}
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="relative h-2">
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sliderPercent}%` }} />
            </div>
            <input
              type="range"
              min={betAction.minAmount ?? 0}
              max={betAction.maxAmount ?? playerStack}
              step={0.5}
              value={betAmount}
              onChange={(e) => handleBetAmountChange(Number(e.target.value))}
              disabled={disabled}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Amount display */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">
              {betAction.minAmount?.toFixed(1)} — {betAction.maxAmount?.toFixed(1)} BB
            </span>
            <div className="flex items-center gap-1 bg-gray-900 border border-gray-600 rounded-lg px-2.5 py-1">
              <input
                type="text"
                value={betAmount}
                onChange={(e) => handleBetAmountChange(Number(e.target.value))}
                disabled={disabled}
                className="w-14 bg-transparent text-white text-sm font-semibold text-right outline-none tabular-nums"
              />
              <span className="text-gray-400 text-xs">BB</span>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {availableActions.map((aa) => {
          const variant = actionVariants[aa.action] ?? actionVariants.check;
          return (
            <button
              key={aa.action}
              onClick={() => handleAction(aa.action)}
              disabled={disabled}
              className={`
                flex-1 flex flex-col items-center justify-center
                px-4 py-3 rounded-lg border font-semibold
                transition-colors duration-150 select-none min-w-[70px]
                ${disabled ? 'opacity-30 cursor-not-allowed' : `${variant.base} ${variant.hover}`}
              `}
            >
              <span className="text-sm">{actionLabels[aa.action]}</span>
              {aa.action === 'call' && amountToCall > 0 && (
                <span className="text-xs opacity-70 mt-0.5">{amountToCall.toFixed(1)} BB</span>
              )}
              {(aa.action === 'bet' || aa.action === 'raise') && (
                <span className="text-xs opacity-70 mt-0.5">{betAmount.toFixed(1)} BB</span>
              )}
              {aa.action === 'allin' && (
                <span className="text-xs opacity-70 mt-0.5">{playerStack.toFixed(1)} BB</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ActionPanel;