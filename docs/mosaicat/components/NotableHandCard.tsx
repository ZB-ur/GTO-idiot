import React from 'react';

interface NotableHandCardProps {
  label: string;
  handNumber: number;
  amount: number;
  onClick: () => void;
}

export const NotableHandCard: React.FC<NotableHandCardProps> = ({
  label,
  handNumber,
  amount,
  onClick,
}) => {
  const isPositive = amount >= 0;
  const formattedAmount = `${isPositive ? '+' : ''}${amount}`;
  const amountColor = isPositive ? 'text-emerald-400' : 'text-red-400';

  return (
    <button
      onClick={onClick}
      className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex flex-col gap-2 text-left hover:border-gray-500 hover:bg-gray-800 transition-colors cursor-pointer w-full"
    >
      <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
        {label}
      </span>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-gray-400">Hand #{handNumber}</span>
        <span className={`text-xl font-bold ${amountColor}`}>
          {formattedAmount}
        </span>
      </div>
      <span className="text-xs text-gray-500">Tap to replay →</span>
    </button>
  );
};