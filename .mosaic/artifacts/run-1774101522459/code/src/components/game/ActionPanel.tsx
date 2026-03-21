// ============================================================
// ActionPanel — Player action buttons (Fold/Check/Call/Bet/Raise/All-in)
// ============================================================

import React, { useState, useCallback, useMemo } from 'react';
import type { LegalAction, ActionType, PlayerAction } from '../../types';
import RaiseSlider from './RaiseSlider';

export interface ActionPanelProps {
  actions: LegalAction[];
  potSize: number;
  onAction: (action: PlayerAction) => void;
  disabled?: boolean;
  onConfirmRequired?: (action: PlayerAction) => void;
}

const ACTION_BUTTON_STYLES: Partial<Record<ActionType, string>> = {
  fold: 'bg-gray-600 hover:bg-gray-500 text-white',
  check: 'bg-green-700 hover:bg-green-600 text-white',
  call: 'bg-blue-700 hover:bg-blue-600 text-white',
  bet: 'bg-yellow-600 hover:bg-yellow-500 text-white',
  raise: 'bg-orange-600 hover:bg-orange-500 text-white',
  all_in: 'bg-red-700 hover:bg-red-600 text-white',
};

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  all_in: 'All-In',
};

const ActionPanel: React.FC<ActionPanelProps> = ({
  actions,
  potSize,
  onAction,
  disabled = false,
  onConfirmRequired,
}) => {
  const [showSlider, setShowSlider] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(0);

  const raiseAction = useMemo(
    () => actions.find((a) => a.type === 'raise' || a.type === 'bet'),
    [actions],
  );

  const callAction = useMemo(
    () => actions.find((a) => a.type === 'call'),
    [actions],
  );

  const handleSimpleAction = useCallback(
    (type: ActionType) => {
      const action: PlayerAction = { type };

      // All-in with max amount
      if (type === 'all_in' && raiseAction) {
        action.amount = raiseAction.maxAmount;
      }

      // Call with call amount
      if (type === 'call' && callAction?.callAmount) {
        action.amount = callAction.callAmount;
      }

      // For fold on large pot, require confirm
      if (type === 'fold' && onConfirmRequired && potSize > 10) {
        onConfirmRequired(action);
        return;
      }

      onAction(action);
    },
    [onAction, onConfirmRequired, raiseAction, callAction, potSize],
  );

  const handleRaiseToggle = useCallback(() => {
    if (!raiseAction) return;
    setRaiseAmount(raiseAction.minAmount ?? 0);
    setShowSlider((prev) => !prev);
  }, [raiseAction]);

  const handleRaiseSubmit = useCallback(() => {
    if (!raiseAction) return;
    const type = raiseAction.type;
    onAction({ type, amount: raiseAmount });
    setShowSlider(false);
  }, [raiseAction, raiseAmount, onAction]);

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3 p-3 bg-gray-900/80 rounded-xl backdrop-blur-sm">
      {/* Main action buttons */}
      <div className="flex gap-2 flex-wrap justify-center">
        {actions.map((action) => {
          // Skip raise/bet in main row (handled by slider toggle)
          if (action.type === 'raise' || action.type === 'bet') {
            return (
              <button
                key={action.type}
                type="button"
                disabled={disabled}
                onClick={handleRaiseToggle}
                className={`
                  px-4 py-2 rounded-lg font-semibold text-sm transition-all
                  ${showSlider ? 'ring-2 ring-yellow-400' : ''}
                  ${ACTION_BUTTON_STYLES[action.type] ?? 'bg-gray-600 text-white'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
                `}
              >
                {ACTION_LABELS[action.type]}
              </button>
            );
          }

          return (
            <button
              key={action.type}
              type="button"
              disabled={disabled}
              onClick={() => handleSimpleAction(action.type)}
              className={`
                px-4 py-2 rounded-lg font-semibold text-sm transition-all
                ${ACTION_BUTTON_STYLES[action.type] ?? 'bg-gray-600 text-white'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
              `}
            >
              {ACTION_LABELS[action.type]}
              {action.type === 'call' && action.callAmount != null && (
                <span className="ml-1 text-xs opacity-80">
                  {action.callAmount.toFixed(1)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Raise slider */}
      {showSlider && raiseAction && (
        <div className="flex flex-col items-center gap-2 animate-fade-in">
          <RaiseSlider
            minAmount={raiseAction.minAmount ?? 1}
            maxAmount={raiseAction.maxAmount ?? 100}
            potSize={potSize}
            currentAmount={raiseAmount}
            onAmountChange={setRaiseAmount}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={handleRaiseSubmit}
            className="px-6 py-2 rounded-lg font-bold text-sm bg-yellow-500 hover:bg-yellow-400 text-black
              transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ACTION_LABELS[raiseAction.type]} to {raiseAmount.toFixed(1)} BB
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ActionPanel);
