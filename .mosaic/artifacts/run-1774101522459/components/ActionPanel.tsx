import React, { useState, useCallback } from 'react';
import RaiseSlider from './RaiseSlider';
import ConfirmDialog from './ConfirmDialog';

interface AvailableAction {
  type: string;
  minAmount?: number;
  maxAmount?: number;
  callAmount?: number;
}

interface ActionPanelProps {
  availableActions: AvailableAction[];
  potSize: number;
  disabled?: boolean;
  onAction: (action: { type: string; amount?: number }) => void;
  className?: string;
}

const actionStyles: Record<string, { base: string; label: string }> = {
  fold: {
    base: 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    label: 'Fold',
  },
  check: {
    base: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
    label: 'Check',
  },
  call: {
    base: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    label: 'Call',
  },
  bet: {
    base: 'border-blue-300 bg-blue-600 text-white hover:bg-blue-700',
    label: 'Bet',
  },
  raise: {
    base: 'border-blue-300 bg-blue-600 text-white hover:bg-blue-700',
    label: 'Raise',
  },
  all_in: {
    base: 'border-red-300 bg-red-500 text-white hover:bg-red-600',
    label: 'All-in',
  },
};

export const ActionPanel: React.FC<ActionPanelProps> = ({
  availableActions,
  potSize,
  disabled = false,
  onAction,
  className = '',
}) => {
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [raiseValue, setRaiseValue] = useState(0);
  const [showAllInConfirm, setShowAllInConfirm] = useState(false);

  const raiseAction = availableActions.find((a) => a.type === 'raise' || a.type === 'bet');
  const callAction = availableActions.find((a) => a.type === 'call');
  const simpleActions = availableActions.filter((a) => a.type === 'fold' || a.type === 'check');

  const handleAction = useCallback(
    (type: string) => {
      if (type === 'all_in') {
        setShowAllInConfirm(true);
        return;
      }
      if ((type === 'raise' || type === 'bet') && raiseAction) {
        setRaiseValue(raiseAction.minAmount ?? 2);
        setShowRaiseSlider(true);
        return;
      }
      if (type === 'call' && callAction) {
        onAction({ type: 'call', amount: callAction.callAmount });
        return;
      }
      onAction({ type });
    },
    [raiseAction, callAction, onAction],
  );

  const handleRaiseConfirm = useCallback(
    (value: number) => {
      onAction({ type: raiseAction?.type ?? 'raise', amount: value });
      setShowRaiseSlider(false);
    },
    [raiseAction, onAction],
  );

  const handleAllInConfirm = useCallback(() => {
    const allInAction = availableActions.find((a) => a.type === 'all_in');
    onAction({ type: 'all_in', amount: allInAction?.maxAmount });
    setShowAllInConfirm(false);
  }, [availableActions, onAction]);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Main action buttons */}
      <div className="flex gap-2">
        {simpleActions.map((action) => {
          const style = actionStyles[action.type] ?? actionStyles.fold;
          return (
            <button
              key={action.type}
              onClick={() => handleAction(action.type)}
              disabled={disabled}
              className={`flex-1 px-4 py-3 text-sm font-semibold rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${style.base}`}
            >
              {style.label}
            </button>
          );
        })}

        {callAction && (
          <button
            onClick={() => handleAction('call')}
            disabled={disabled}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${actionStyles.call.base}`}
          >
            Call {callAction.callAmount?.toFixed(1)} BB
          </button>
        )}

        {raiseAction && (
          <button
            onClick={() => handleAction(raiseAction.type)}
            disabled={disabled}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${actionStyles[raiseAction.type]?.base ?? actionStyles.raise.base}`}
          >
            {actionStyles[raiseAction.type]?.label ?? 'Raise'}
          </button>
        )}

        {availableActions.some((a) => a.type === 'all_in') && (
          <button
            onClick={() => handleAction('all_in')}
            disabled={disabled}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${actionStyles.all_in.base}`}
          >
            All-in
          </button>
        )}
      </div>

      {/* Raise slider */}
      {showRaiseSlider && raiseAction && (
        <div className="bg-slate-50 rounded-xl p-4 border border-gray-200">
          <RaiseSlider
            min={raiseAction.minAmount ?? 2}
            max={raiseAction.maxAmount ?? 100}
            potSize={potSize}
            value={raiseValue}
            onChange={setRaiseValue}
            onConfirm={handleRaiseConfirm}
          />
        </div>
      )}

      {/* All-in confirmation */}
      <ConfirmDialog
        open={showAllInConfirm}
        title="Confirm All-in"
        message={`Are you sure you want to go all-in? This action cannot be undone.`}
        confirmLabel="All-in"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleAllInConfirm}
        onCancel={() => setShowAllInConfirm(false)}
      />
    </div>
  );
};

export default ActionPanel;