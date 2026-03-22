import React, { useState, useCallback } from 'react';

interface PresetRaiseSize {
  label: string;
  amount: number;
}

interface ActionPanelProps {
  availableActions: Array<string>;
  potSize: number;
  toCall: number;
  minRaise?: number;
  maxRaise?: number;
  presetRaiseSizes?: Array<PresetRaiseSize>;
  disabled?: boolean;
  onAction: (action: string, amount?: number) => void;
}

const actionConfig: Record<string, { label: string; bg: string; hover: string; text: string }> = {
  fold: { label: 'Fold', bg: 'bg-gray-100', hover: 'hover:bg-gray-200', text: 'text-gray-600' },
  check: { label: 'Check', bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-700' },
  call: { label: 'Call', bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-white' },
  raise: { label: 'Raise', bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-white' },
  all_in: { label: 'All-In', bg: 'bg-red-500', hover: 'hover:bg-red-600', text: 'text-white' },
};

const ActionPanel: React.FC<ActionPanelProps> = ({
  availableActions,
  potSize,
  toCall,
  minRaise,
  maxRaise,
  presetRaiseSizes,
  disabled = false,
  onAction,
}) => {
  const [raiseAmount, setRaiseAmount] = useState(minRaise || 0);
  const [showRaiseControls, setShowRaiseControls] = useState(false);

  const canRaise = availableActions.includes('raise');

  const handleRaiseClick = useCallback(() => {
    if (showRaiseControls) {
      onAction('raise', raiseAmount);
      setShowRaiseControls(false);
    } else {
      setShowRaiseControls(true);
    }
  }, [showRaiseControls, raiseAmount, onAction]);

  const handlePresetClick = useCallback(
    (amount: number) => {
      setRaiseAmount(Math.min(amount, maxRaise || amount));
    },
    [maxRaise]
  );

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md p-4">
      {/* Pot info */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs text-gray-500">
          Pot: <span className="font-bold text-gray-900">${potSize}</span>
        </span>
        {toCall > 0 && (
          <span className="text-xs text-gray-500">
            To call: <span className="font-bold text-gray-900">${toCall}</span>
          </span>
        )}
      </div>

      {/* Raise controls */}
      {showRaiseControls && canRaise && minRaise != null && maxRaise != null && (
        <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Raise to</span>
            <span className="text-lg font-bold text-gray-900 font-mono">${raiseAmount}</span>
          </div>
          <input
            type="range"
            min={minRaise}
            max={maxRaise}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-amber-500"
            disabled={disabled}
          />
          <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
            <span>${minRaise}</span>
            <span>${maxRaise}</span>
          </div>
          {/* Presets */}
          {presetRaiseSizes && presetRaiseSizes.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {presetRaiseSizes.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.amount)}
                  disabled={disabled}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    raiseAmount === preset.amount
                      ? 'bg-amber-100 border-amber-300 text-amber-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  } disabled:opacity-40`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {availableActions.map((action) => {
          const config = actionConfig[action];
          if (!config) return null;

          if (action === 'raise') {
            return (
              <button
                key={action}
                onClick={handleRaiseClick}
                disabled={disabled}
                className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${config.bg} ${config.hover} ${config.text} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {showRaiseControls ? `Raise $${raiseAmount}` : config.label}
              </button>
            );
          }

          return (
            <button
              key={action}
              onClick={() => {
                setShowRaiseControls(false);
                onAction(action, action === 'call' ? toCall : undefined);
              }}
              disabled={disabled}
              className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${config.bg} ${config.hover} ${config.text} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {config.label}
              {action === 'call' && toCall > 0 && (
                <span className="ml-1 opacity-80">${toCall}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ActionPanel;