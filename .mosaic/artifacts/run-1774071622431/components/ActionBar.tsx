import React, { useState } from 'react';
import { BetSlider } from './BetSlider';

interface LegalAction {
  action: string;
  minAmount?: number;
  maxAmount?: number;
}

interface ActionBarProps {
  legalActions: LegalAction[];
  pot: number;
  onAction: (action: string, amount?: number) => void;
}

const actionStyles: Record<string, string> = {
  fold: 'bg-gray-600 hover:bg-gray-500 text-white',
  check: 'bg-blue-600 hover:bg-blue-700 text-white',
  call: 'bg-green-600 hover:bg-green-700 text-white',
  bet: 'bg-amber-500 hover:bg-amber-600 text-white',
  raise: 'bg-amber-500 hover:bg-amber-600 text-white',
  'all-in': 'bg-red-600 hover:bg-red-700 text-white',
};

export const ActionBar: React.FC<ActionBarProps> = ({ legalActions, pot, onAction }) => {
  const [showSlider, setShowSlider] = useState(false);
  const [betAmount, setBetAmount] = useState(0);

  const betAction = legalActions.find((a) => a.action === 'bet' || a.action === 'raise');

  const handleBetRaise = () => {
    if (betAction) {
      setBetAmount(betAction.minAmount ?? 0);
      setShowSlider(true);
    }
  };

  const handleConfirmBet = () => {
    if (betAction) {
      onAction(betAction.action, betAmount);
      setShowSlider(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 px-4 py-4 z-40">
      <div className="max-w-2xl mx-auto space-y-3">
        {/* Bet slider (if active) */}
        {showSlider && betAction && (
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <BetSlider
                min={betAction.minAmount ?? 0}
                max={betAction.maxAmount ?? 0}
                pot={pot}
                value={betAmount}
                onChange={setBetAmount}
              />
            </div>
            <button
              onClick={handleConfirmBet}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
            >
              Confirm {betAction.action === 'raise' ? 'Raise' : 'Bet'} {betAmount}
            </button>
            <button
              onClick={() => setShowSlider(false)}
              className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {legalActions.map((la) => {
            if ((la.action === 'bet' || la.action === 'raise') && showSlider) return null;

            return (
              <button
                key={la.action}
                onClick={() => {
                  if (la.action === 'bet' || la.action === 'raise') {
                    handleBetRaise();
                  } else {
                    onAction(la.action, la.minAmount);
                  }
                }}
                className={`flex-1 py-3 font-semibold rounded-lg transition-colors text-sm uppercase tracking-wide ${
                  actionStyles[la.action] ?? 'bg-gray-600 text-white'
                }`}
              >
                {la.action}
                {la.action === 'call' && la.minAmount ? ` ${la.minAmount}` : ''}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActionBar;