import React from 'react';
import type { AvailableActions, PlayerAction } from '../../types';
import RaiseSlider from './RaiseSlider';

export interface ActionPanelProps {
  availableActions: AvailableActions;
  onAction: (action: PlayerAction) => void;
  disabled?: boolean;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ availableActions, onAction, disabled }) => {
  return (
    <div className="action-panel">
      {availableActions.actions.map((action) => (
        <button
          key={action}
          disabled={disabled}
          onClick={() => onAction({ action })}
        >
          {action}
        </button>
      ))}
      {availableActions.minRaise !== undefined && (
        <RaiseSlider
          min={availableActions.minRaise}
          max={availableActions.maxRaise ?? availableActions.minRaise}
          onRaise={(amount) => onAction({ action: 'raise', amount })}
        />
      )}
    </div>
  );
};

export default ActionPanel;
