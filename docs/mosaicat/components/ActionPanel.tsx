import React, { useState, useCallback, useMemo } from 'react';

interface LegalAction {
  actionType: 'fold' | 'check' | 'call' | 'raise' | 'allIn';
  isAvailable: boolean;
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
}

interface LegalActionsResponse {
  seatIndex: number;
  position: string;
  actions: LegalAction[];
}

interface ActionPanelProps {
  legalActions: LegalActionsResponse;
  onAction: (actionType: string, amount?: number) => void;
  potSize: number;
  disabled?: boolean;
}

const ACTION_LABELS: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  allIn: 'All In',
};

const ACTION_STYLES: Record<string, { base: string; hover: string }> = {
  fold: {
    base: 'bg-gray-700 text-gray-200',
    hover: 'hover:bg-gray-600',
  },
  check: {
    base: 'bg-emerald-600 text-white',
    hover: 'hover:bg-emerald-500',
  },
  call: {
    base: 'bg-emerald-600 text-white',
    hover: 'hover:bg-emerald-500',
  },
  raise: {
    base: 'bg-amber-500 text-gray-950',
    hover: 'hover:bg-amber-400',
  },
  allIn: {
    base: 'bg-red-500 text-white',
    hover: 'hover:bg-red-400',
  },
};

export function ActionPanel({
  legalActions,
  onAction,
  potSize,
  disabled = false,
}: ActionPanelProps) {
  const raiseAction = useMemo(
    () => legalActions.actions.find((a) => a.actionType === 'raise' && a.isAvailable),
    [legalActions],
  );

  const [raiseAmount, setRaiseAmount] = useState<number>(raiseAction?.minAmount ?? 0);
  const [showRaiseControls, setShowRaiseControls] = useState(false);

  const callAction = legalActions.actions.find(
    (a) => a.actionType === 'call' && a.isAvailable,
  );

  const handleAction = useCallback(
    (actionType: string) => {
      if (disabled) return;
      if (actionType === 'raise') {
        setShowRaiseControls(true);
        return;
      }
      onAction(actionType, actionType === 'call' ? callAction?.amount : undefined);
    },
    [disabled, onAction, callAction],
  );

  const handleRaiseConfirm = useCallback(() => {
    onAction('raise', raiseAmount);
    setShowRaiseControls(false);
  }, [onAction, raiseAmount]);

  const handleRaiseCancel = useCallback(() => {
    setShowRaiseControls(false);
    setRaiseAmount(raiseAction?.minAmount ?? 0);
  }, [raiseAction]);

  const presetMultipliers = [
    { label: '½ Pot', factor: 0.5 },
    { label: '¾ Pot', factor: 0.75 },
    { label: 'Pot', factor: 1 },
  ];

  const availableActions = legalActions.actions.filter((a) => a.isAvailable);

  return (
    <div className="w-full bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 px-4 py-3">
      {showRaiseControls && raiseAction ? (
        <div className="flex flex-col gap-3">
          {/* Raise slider and presets */}
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm font-medium min-w-[40px]">
              {raiseAmount}
            </span>
            <input
              type="range"
              min={raiseAction.minAmount ?? 0}
              max={raiseAction.maxAmount ?? 0}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Number(e.target.value))}
              className="flex-1 accent-amber-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              disabled={disabled}
            />
            <span className="text-gray-500 text-xs min-w-[40px] text-right">
              {raiseAction.maxAmount}
            </span>
          </div>
          {/* Preset buttons */}
          <div className="flex items-center gap-2">
            {presetMultipliers.map(({ label, factor }) => {
              const amount = Math.min(
                Math.max(Math.round(potSize * factor), raiseAction.minAmount ?? 0),
                raiseAction.maxAmount ?? 0,
              );
              return (
                <button
                  key={label}
                  onClick={() => setRaiseAmount(amount)}
                  disabled={disabled}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-medium border border-gray-700 hover:bg-gray-700 hover:text-gray-100 transition-colors disabled:opacity-40"
                >
                  {label}
                </button>
              );
            })}
            <div className="flex-1" />
            <button
              onClick={handleRaiseCancel}
              className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRaiseConfirm}
              disabled={disabled}
              className="px-6 py-2 rounded-lg bg-amber-500 text-gray-950 text-sm font-bold hover:bg-amber-400 transition-colors disabled:opacity-40"
            >
              Raise to {raiseAmount}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3">
          {availableActions.map((action) => {
            const styles = ACTION_STYLES[action.actionType] ?? ACTION_STYLES.fold;
            const label =
              action.actionType === 'call' && action.amount
                ? `Call ${action.amount}`
                : ACTION_LABELS[action.actionType] ?? action.actionType;

            return (
              <button
                key={action.actionType}
                onClick={() => handleAction(action.actionType)}
                disabled={disabled}
                className={`
                  px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide
                  transition-all duration-150
                  ${styles.base} ${styles.hover}
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${action.actionType === 'allIn' ? 'ring-1 ring-red-400/50' : ''}
                `}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}