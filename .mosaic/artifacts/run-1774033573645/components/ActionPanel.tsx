import React, { useState, useCallback, useMemo } from 'react';

// Types from API spec
type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all_in';

interface AvailableAction {
  actionType: ActionType;
  minAmount?: number;
  maxAmount?: number;
}

interface ActionPanelProps {
  availableActions: AvailableAction[];
  potSize: number;
  isActive: boolean;
  onAction: (actionType: ActionType, amount?: number) => void;
}

const ACTION_CONFIG: Record<ActionType, { label: string; color: string; hoverColor: string; icon: string }> = {
  fold: { label: 'Fold', color: 'bg-gray-500', hoverColor: 'hover:bg-gray-600', icon: '✕' },
  check: { label: 'Check', color: 'bg-emerald-500', hoverColor: 'hover:bg-emerald-600', icon: '✓' },
  call: { label: 'Call', color: 'bg-blue-600', hoverColor: 'hover:bg-blue-700', icon: '☎' },
  raise: { label: 'Raise', color: 'bg-amber-500', hoverColor: 'hover:bg-amber-600', icon: '↑' },
  all_in: { label: 'All In', color: 'bg-red-500', hoverColor: 'hover:bg-red-600', icon: '🔥' },
};

const PRESET_MULTIPLIERS = [
  { label: '½ Pot', factor: 0.5 },
  { label: '¾ Pot', factor: 0.75 },
  { label: 'Pot', factor: 1.0 },
  { label: '2× Pot', factor: 2.0 },
];

export const ActionPanel: React.FC<ActionPanelProps> = ({
  availableActions,
  potSize,
  isActive,
  onAction,
}) => {
  const raiseAction = useMemo(
    () => availableActions.find((a) => a.actionType === 'raise'),
    [availableActions]
  );

  const minRaise = raiseAction?.minAmount ?? 0;
  const maxRaise = raiseAction?.maxAmount ?? 0;

  const [raiseAmount, setRaiseAmount] = useState<number>(minRaise);
  const [showConfirm, setShowConfirm] = useState<{ actionType: ActionType; amount?: number } | null>(null);

  // Reset raise amount when min changes
  React.useEffect(() => {
    setRaiseAmount(minRaise);
  }, [minRaise]);

  const handlePreset = useCallback(
    (factor: number) => {
      const amount = Math.round(potSize * factor);
      const clamped = Math.min(Math.max(amount, minRaise), maxRaise);
      setRaiseAmount(clamped);
    },
    [potSize, minRaise, maxRaise]
  );

  const handleAction = useCallback(
    (actionType: ActionType, amount?: number) => {
      if (actionType === 'all_in' || actionType === 'fold') {
        setShowConfirm({ actionType, amount });
        return;
      }
      onAction(actionType, amount);
    },
    [onAction]
  );

  const confirmAction = useCallback(() => {
    if (showConfirm) {
      onAction(showConfirm.actionType, showConfirm.amount);
      setShowConfirm(null);
    }
  }, [showConfirm, onAction]);

  const cancelConfirm = useCallback(() => {
    setShowConfirm(null);
  }, []);

  const isActionAvailable = useCallback(
    (type: ActionType) => availableActions.some((a) => a.actionType === type),
    [availableActions]
  );

  const callAction = availableActions.find((a) => a.actionType === 'call');

  if (!isActive) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-slate-100 rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-400 text-lg font-medium">Waiting for your turn…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      {/* Confirm Dialog Overlay */}
      {showConfirm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-4 flex items-center justify-between">
          <p className="text-gray-900 font-semibold">
            Confirm{' '}
            <span className={showConfirm.actionType === 'all_in' ? 'text-red-500' : 'text-gray-500'}>
              {ACTION_CONFIG[showConfirm.actionType].label}
            </span>
            {showConfirm.amount != null && ` — ${showConfirm.amount} BB`}?
          </p>
          <div className="flex gap-2">
            <button
              onClick={cancelConfirm}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmAction}
              className={`px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors ${ACTION_CONFIG[showConfirm.actionType].color} ${ACTION_CONFIG[showConfirm.actionType].hoverColor}`}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Raise Controls */}
      {raiseAction && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Raise Amount</span>
            <span className="text-lg font-bold text-amber-500">{raiseAmount} BB</span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={minRaise}
            max={maxRaise}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{minRaise} BB</span>
            <span>{maxRaise} BB</span>
          </div>

          {/* Preset Buttons */}
          <div className="flex gap-2">
            {PRESET_MULTIPLIERS.map((preset) => {
              const amount = Math.round(potSize * preset.factor);
              const clamped = Math.min(Math.max(amount, minRaise), maxRaise);
              const isDisabled = clamped < minRaise || clamped > maxRaise;
              return (
                <button
                  key={preset.label}
                  onClick={() => handlePreset(preset.factor)}
                  disabled={isDisabled}
                  className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-slate-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* Fold */}
        {isActionAvailable('fold') && (
          <button
            onClick={() => handleAction('fold')}
            className="flex-1 py-3 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold text-base transition-colors shadow-sm"
          >
            <span className="mr-1">✕</span> Fold
          </button>
        )}

        {/* Check */}
        {isActionAvailable('check') && (
          <button
            onClick={() => handleAction('check')}
            className="flex-1 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base transition-colors shadow-sm"
          >
            <span className="mr-1">✓</span> Check
          </button>
        )}

        {/* Call */}
        {isActionAvailable('call') && (
          <button
            onClick={() => handleAction('call')}
            className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition-colors shadow-sm"
          >
            <span className="mr-1">☎</span> Call{callAction?.minAmount != null ? ` ${callAction.minAmount}` : ''}
          </button>
        )}

        {/* Raise */}
        {isActionAvailable('raise') && (
          <button
            onClick={() => handleAction('raise', raiseAmount)}
            className="flex-1 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base transition-colors shadow-sm"
          >
            <span className="mr-1">↑</span> Raise {raiseAmount}
          </button>
        )}

        {/* All In */}
        {isActionAvailable('all_in') && (
          <button
            onClick={() => handleAction('all_in')}
            className="flex-1 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-base transition-colors shadow-sm"
          >
            <span className="mr-1">🔥</span> All In
          </button>
        )}
      </div>

      {/* Pot Info */}
      <div className="text-center text-sm text-gray-400">
        Pot: <span className="font-semibold text-gray-600">{potSize} BB</span>
      </div>
    </div>
  );
};

export default ActionPanel;