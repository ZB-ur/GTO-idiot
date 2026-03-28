import React, { useState, useCallback } from 'react';

interface PresetRaise {
  label: string;
  amount: number;
}

interface AvailableActions {
  canFold: boolean;
  canCheck: boolean;
  canCall: boolean;
  callAmount?: number | null;
  canBet: boolean;
  minBetAmount?: number | null;
  maxBetAmount?: number | null;
  canRaise: boolean;
  minRaiseAmount?: number | null;
  maxRaiseAmount?: number | null;
  presetRaises?: PresetRaise[];
}

interface PlayerActionInput {
  actionType: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in' | 'post-blind';
  amount?: number | null;
}

interface ActionPanelProps {
  availableActions: AvailableActions;
  onAction: (action: PlayerActionInput) => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  availableActions,
  onAction,
}) => {
  const {
    canFold, canCheck, canCall, callAmount,
    canBet, minBetAmount, maxBetAmount,
    canRaise, minRaiseAmount, maxRaiseAmount,
    presetRaises,
  } = availableActions;

  const isRaiseOrBet = canRaise || canBet;
  const minAmount = canRaise ? minRaiseAmount : minBetAmount;
  const maxAmount = canRaise ? maxRaiseAmount : maxBetAmount;
  const actionType = canRaise ? 'raise' : 'bet';

  const [raiseAmount, setRaiseAmount] = useState<number>(minAmount ?? 0);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);

  const handleFold = useCallback(() => {
    onAction({ actionType: 'fold' });
  }, [onAction]);

  const handleCheck = useCallback(() => {
    onAction({ actionType: 'check' });
  }, [onAction]);

  const handleCall = useCallback(() => {
    onAction({ actionType: 'call' });
  }, [onAction]);

  const handleRaiseConfirm = useCallback(() => {
    if (raiseAmount === maxAmount) {
      onAction({ actionType: 'all-in', amount: maxAmount });
    } else {
      onAction({ actionType, amount: raiseAmount });
    }
    setShowRaiseSlider(false);
  }, [onAction, raiseAmount, maxAmount, actionType]);

  const handlePreset = useCallback((amount: number) => {
    setRaiseAmount(amount);
  }, []);

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3">
      {/* Raise slider area */}
      {showRaiseSlider && isRaiseOrBet && minAmount != null && maxAmount != null && (
        <div className="mb-3 px-2">
          {/* Presets */}
          {presetRaises && presetRaises.length > 0 && (
            <div className="flex gap-2 mb-2">
              {presetRaises.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePreset(preset.amount)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    raiseAmount === preset.amount
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => handlePreset(maxAmount)}
                className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  raiseAmount === maxAmount
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-red-500 border-gray-200 hover:border-red-300'
                }`}
              >
                All-in
              </button>
            </div>
          )}
          {/* Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-12 text-right">{minAmount}</span>
            <input
              type="range"
              min={minAmount}
              max={maxAmount}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Number(e.target.value))}
              className="flex-1 h-2 accent-blue-600"
            />
            <span className="text-xs text-gray-400 w-12">{maxAmount}</span>
          </div>
          <div className="text-center mt-1">
            <span className="text-lg font-bold text-gray-900">{raiseAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {canFold && (
          <button
            onClick={handleFold}
            className="flex-1 px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            弃牌
          </button>
        )}
        {canCheck && (
          <button
            onClick={handleCheck}
            className="flex-1 px-4 py-3 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            过牌
          </button>
        )}
        {canCall && (
          <button
            onClick={handleCall}
            className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            跟注 {callAmount?.toLocaleString()}
          </button>
        )}
        {isRaiseOrBet && (
          showRaiseSlider ? (
            <button
              onClick={handleRaiseConfirm}
              className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
            >
              确认 {raiseAmount === maxAmount ? 'All-in' : `${actionType === 'raise' ? '加注' : '下注'} ${raiseAmount.toLocaleString()}`}
            </button>
          ) : (
            <button
              onClick={() => setShowRaiseSlider(true)}
              className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
            >
              {canRaise ? '加注' : '下注'}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ActionPanel;