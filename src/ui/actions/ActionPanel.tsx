import React, { useState, useCallback } from 'react';
import type { AvailableActions, PlayerAction, ActionType } from '../../types';
import RaiseSlider from './RaiseSlider';

export interface ActionPanelProps {
  availableActions: AvailableActions;
  onAction: (action: PlayerAction) => void;
  disabled?: boolean;
}

const actionConfig: Record<string, { label: string; color: string; hoverColor: string }> = {
  fold: {
    label: 'Fold',
    color: 'bg-gradient-to-b from-slate-600 to-slate-700 text-slate-200',
    hoverColor: 'hover:from-slate-500 hover:to-slate-600',
  },
  check: {
    label: 'Check',
    color: 'bg-gradient-to-b from-green-600 to-green-700 text-white',
    hoverColor: 'hover:from-green-500 hover:to-green-600',
  },
  call: {
    label: 'Call',
    color: 'bg-gradient-to-b from-green-600 to-green-700 text-white',
    hoverColor: 'hover:from-green-500 hover:to-green-600',
  },
  all_in: {
    label: 'All-In',
    color: 'bg-gradient-to-b from-red-600 to-red-700 text-white',
    hoverColor: 'hover:from-red-500 hover:to-red-600',
  },
};

function formatAmount(amount: number): string {
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toLocaleString();
}

const ActionPanel: React.FC<ActionPanelProps> = ({ availableActions, onAction, disabled }) => {
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);

  const canRaise = availableActions.actions.includes('raise');
  const hasRaiseInfo = availableActions.minRaise !== undefined;

  const handleAction = useCallback((actionType: ActionType) => {
    if (actionType === 'raise' && hasRaiseInfo) {
      setShowRaiseSlider((prev) => !prev);
      return;
    }
    if (actionType === 'call') {
      onAction({ action: 'call' });
    } else {
      onAction({ action: actionType });
    }
    setShowRaiseSlider(false);
  }, [hasRaiseInfo, onAction]);

  const handleRaise = useCallback((amount: number) => {
    onAction({ action: 'raise', amount });
    setShowRaiseSlider(false);
  }, [onAction]);

  // Filter out 'raise' from main buttons when slider is being shown separately
  const mainActions = availableActions.actions.filter((a) => a !== 'raise' || !hasRaiseInfo);
  const showRaiseButton = canRaise && hasRaiseInfo;

  return (
    <div
      className="
        w-full max-w-2xl mx-auto
        bg-slate-900/95 backdrop-blur-sm
        border-t border-slate-700
        rounded-t-xl
        px-4 py-3
        flex flex-col gap-3
      "
      aria-label="Action panel"
    >
      {/* Raise slider */}
      {showRaiseSlider && hasRaiseInfo && (
        <div className="pb-2 border-b border-slate-700">
          <RaiseSlider
            min={availableActions.minRaise!}
            max={availableActions.maxRaise ?? availableActions.minRaise!}
            presets={availableActions.presetRaiseSizes}
            potSize={availableActions.potSize}
            onRaise={handleRaise}
          />
        </div>
      )}

      {/* Action buttons row */}
      <div className="flex items-center justify-center gap-2">
        {/* Info display */}
        <div className="flex flex-col items-center mr-4 min-w-[60px]">
          {availableActions.toCall > 0 && (
            <span className="text-xs text-slate-400">
              To call: <span className="text-yellow-300 font-bold">{formatAmount(availableActions.toCall)}</span>
            </span>
          )}
          <span className="text-[10px] text-slate-500">
            Pot: {formatAmount(availableActions.potSize)}
          </span>
        </div>

        {/* Main action buttons */}
        {mainActions.map((actionType) => {
          const config = actionConfig[actionType] ?? {
            label: actionType,
            color: 'bg-slate-600 text-white',
            hoverColor: 'hover:bg-slate-500',
          };

          const label = actionType === 'call' && availableActions.toCall > 0
            ? `${config.label} ${formatAmount(availableActions.toCall)}`
            : config.label;

          return (
            <button
              key={actionType}
              type="button"
              disabled={disabled}
              onClick={() => handleAction(actionType)}
              className={`
                px-5 py-2.5 text-sm font-bold rounded-lg
                ${config.color} ${config.hoverColor}
                shadow-lg border border-white/10
                transition-all duration-150
                active:scale-95
                disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                min-w-[80px]
              `}
            >
              {label}
            </button>
          );
        })}

        {/* Dedicated raise button */}
        {showRaiseButton && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleAction('raise')}
            className={`
              px-5 py-2.5 text-sm font-bold rounded-lg
              shadow-lg border border-white/10
              transition-all duration-150
              active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
              min-w-[80px]
              ${showRaiseSlider
                ? 'bg-gradient-to-b from-yellow-400 to-yellow-500 text-black'
                : 'bg-gradient-to-b from-yellow-600 to-yellow-700 text-white hover:from-yellow-500 hover:to-yellow-600'
              }
            `}
          >
            {showRaiseSlider ? 'Hide' : 'Raise'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionPanel;
