import React from 'react';

interface QuickBet {
  label: string;
  amount: number;
}

interface QuickBetButtonsProps {
  quickBets: QuickBet[];
  onSelect: (amount: number) => void;
  activeAmount?: number;
}

const QuickBetButtons: React.FC<QuickBetButtonsProps> = ({
  quickBets,
  onSelect,
  activeAmount,
}) => {
  return (
    <div className="flex items-center gap-2">
      {quickBets.map((bet) => {
        const isActive = activeAmount !== undefined && activeAmount === bet.amount;
        return (
          <button
            key={bet.label}
            onClick={() => onSelect(bet.amount)}
            className={`
              px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-150
              border whitespace-nowrap
              ${
                isActive
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-900/40'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:text-white'
              }
              active:scale-95
            `}
          >
            {bet.label}
          </button>
        );
      })}
    </div>
  );
};

export default QuickBetButtons;