/**
 * ActionPanel — the human player's action buttons: Fold, Check/Call, Raise/Bet.
 * Expands a RaiseSlider when the player chooses to raise.
 */

import React, { useState, useCallback } from 'react';
import type { AvailableActions, PlayerAction, ActionType } from '../../types';
import { RaiseSlider } from './RaiseSlider';

interface ActionPanelProps {
  availableActions: AvailableActions;
  onAction: (action: PlayerAction) => void;
  isProcessing: boolean;
  className?: string;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  availableActions,
  onAction,
  isProcessing,
  className = '',
}) => {
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);

  const actionMap = new Map(
    availableActions.actions.map((a) => [a.actionType, a]),
  );

  const foldAction = actionMap.get('fold');
  const checkAction = actionMap.get('check');
  const callAction = actionMap.get('call');
  const betAction = actionMap.get('bet');
  const raiseAction = actionMap.get('raise');
  const allInAction = actionMap.get('all_in');

  // Determine the "passive" action (check or call)
  const passiveAction = checkAction?.isAvailable ? checkAction : callAction?.isAvailable ? callAction : null;

  // Determine the "aggressive" action (bet or raise)
  const aggressiveAction = raiseAction?.isAvailable ? raiseAction : betAction?.isAvailable ? betAction : null;

  const handleSimpleAction = useCallback(
    (actionType: ActionType, amount?: number) => {
      if (isProcessing) return;
      setShowRaiseSlider(false);
      onAction({ actionType, amount });
    },
    [onAction, isProcessing],
  );

  const handleRaiseConfirm = useCallback(
    (amount: number) => {
      if (isProcessing) return;
      setShowRaiseSlider(false);
      const actionType: ActionType = raiseAction?.isAvailable ? 'raise' : 'bet';
      onAction({ actionType, amount });
    },
    [onAction, isProcessing, raiseAction],
  );

  // If raise slider is showing, render it instead of the main buttons
  if (showRaiseSlider && aggressiveAction) {
    return (
      <div className={`bg-gray-900/90 backdrop-blur-sm rounded-xl p-3 border border-gray-700 ${className}`}>
        <RaiseSlider
          minRaise={aggressiveAction.minRaise ?? 2}
          maxRaise={aggressiveAction.maxRaise ?? 100}
          potSize={availableActions.potSize ?? 0}
          suggestedSizings={aggressiveAction.suggestedSizings}
          onConfirm={handleRaiseConfirm}
          onCancel={() => setShowRaiseSlider(false)}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Pot odds display */}
      {availableActions.potOdds && (
        <div className="text-[0.65rem] text-gray-400">
          Pot Odds: <span className="text-gray-200 font-medium">{availableActions.potOdds}</span>
        </div>
      )}

      {/* Main action buttons */}
      <div className="flex items-center gap-2">
        {/* Fold */}
        {foldAction?.isAvailable && (
          <button
            onClick={() => handleSimpleAction('fold')}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600
              text-gray-200 text-sm font-semibold transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-95 transform"
          >
            Fold
          </button>
        )}

        {/* Check or Call */}
        {passiveAction && (
          <button
            onClick={() =>
              handleSimpleAction(
                passiveAction.actionType,
                passiveAction.callAmount,
              )
            }
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500
              text-white text-sm font-semibold transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-95 transform min-w-[80px]"
          >
            {passiveAction.actionType === 'check'
              ? 'Check'
              : `Call ${passiveAction.callAmount?.toFixed(0) ?? ''}`}
          </button>
        )}

        {/* Raise / Bet */}
        {aggressiveAction && (
          <button
            onClick={() => setShowRaiseSlider(true)}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400
              text-gray-900 text-sm font-bold transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-95 transform"
          >
            {raiseAction?.isAvailable ? 'Raise' : 'Bet'}
          </button>
        )}

        {/* All-In (only show if no raise available, or as standalone) */}
        {allInAction?.isAvailable && !aggressiveAction && (
          <button
            onClick={() => handleSimpleAction('all_in', allInAction.maxRaise)}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500
              text-white text-sm font-bold transition-colors uppercase tracking-wider
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-95 transform animate-pulse"
          >
            All In
          </button>
        )}
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="text-xs text-gray-400 animate-pulse">Processing...</div>
      )}
    </div>
  );
};

export default ActionPanel;
