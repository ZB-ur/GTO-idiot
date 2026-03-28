'use client';

import { useState, useMemo, useCallback } from 'react';
import type { ActionType, AvailableAction } from '@/engine/types';
import RaiseSlider from './RaiseSlider';
import AllInConfirmDialog from './AllInConfirmDialog';

interface PlayerAction {
  action: ActionType;
  amount?: number;
}

interface ActionPanelProps {
  availableActions: AvailableAction[];
  currentPot: number;
  userStack: number;
  amountToCall: number;
  onAction: (action: PlayerAction) => void;
}

const ACTION_STYLES: Record<ActionType, string> = {
  fold: 'bg-gray-600 hover:bg-gray-500 text-gray-100',
  check: 'bg-green-700 hover:bg-green-600 text-white',
  call: 'bg-blue-700 hover:bg-blue-600 text-white',
  raise: 'bg-yellow-600 hover:bg-yellow-500 text-black',
  all_in: 'bg-red-700 hover:bg-red-600 text-white',
};

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All In',
};

export default function ActionPanel({
  availableActions,
  currentPot,
  userStack,
  amountToCall,
  onAction,
}: ActionPanelProps) {
  const raiseAction = useMemo(
    () => availableActions.find((a) => a.actionType === 'raise'),
    [availableActions],
  );

  const raiseMin = raiseAction?.minAmount ?? 0;
  const raiseMax = raiseAction?.maxAmount ?? userStack;

  const [raiseAmount, setRaiseAmount] = useState(raiseMin);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [showAllInConfirm, setShowAllInConfirm] = useState(false);

  const presets = useMemo(
    () => [
      { label: 'Min', amount: raiseMin },
      { label: '1/2 Pot', amount: Math.floor(currentPot * 0.5) },
      { label: '2/3 Pot', amount: Math.floor(currentPot * 0.67) },
      { label: 'Pot', amount: currentPot },
      { label: 'All-In', amount: raiseMax },
    ],
    [raiseMin, currentPot, raiseMax],
  );

  const handleAction = useCallback(
    (actionType: ActionType) => {
      if (actionType === 'raise') {
        if (!showRaiseSlider) {
          setShowRaiseSlider(true);
          setRaiseAmount(raiseMin);
          return;
        }
        onAction({ action: 'raise', amount: raiseAmount });
        setShowRaiseSlider(false);
      } else if (actionType === 'all_in') {
        setShowAllInConfirm(true);
      } else if (actionType === 'call') {
        onAction({ action: 'call', amount: amountToCall });
      } else {
        onAction({ action: actionType });
        setShowRaiseSlider(false);
      }
    },
    [showRaiseSlider, raiseAmount, raiseMin, amountToCall, onAction],
  );

  if (availableActions.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-lg mx-auto">
      {/* Raise slider */}
      {showRaiseSlider && raiseAction && (
        <div className="w-full bg-gray-800/90 rounded-xl p-3 border border-gray-700">
          <RaiseSlider
            minAmount={raiseMin}
            maxAmount={raiseMax}
            presets={presets}
            value={raiseAmount}
            onChange={setRaiseAmount}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap justify-center">
        {availableActions.map((action) => {
          const label =
            action.actionType === 'call' && amountToCall
              ? `Call ${amountToCall.toLocaleString()}`
              : action.actionType === 'raise' && showRaiseSlider
                ? `Raise to ${raiseAmount.toLocaleString()}`
                : ACTION_LABELS[action.actionType];

          return (
            <button
              key={action.actionType}
              type="button"
              onClick={() => handleAction(action.actionType)}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all cursor-pointer active:scale-95 ${ACTION_STYLES[action.actionType]}`}
            >
              {label}
            </button>
          );
        })}

        {showRaiseSlider && (
          <button
            type="button"
            onClick={() => setShowRaiseSlider(false)}
            className="px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* All-in confirmation */}
      <AllInConfirmDialog
        open={showAllInConfirm}
        amount={userStack}
        onConfirm={() => {
          setShowAllInConfirm(false);
          onAction({ action: 'all_in', amount: userStack });
        }}
        onCancel={() => setShowAllInConfirm(false)}
      />
    </div>
  );
}