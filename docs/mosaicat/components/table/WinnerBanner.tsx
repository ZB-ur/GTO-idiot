import React from 'react';

interface WinnerBannerProps {
  winnerName: string;
  amount: number;
  winningHand?: string;
  visible: boolean;
}

export const WinnerBanner: React.FC<WinnerBannerProps> = ({
  winnerName,
  amount,
  winningHand,
  visible,
}) => {
  if (!visible) return null;

  return (
    <div className="flex items-center justify-center py-3 px-6 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 rounded-xl backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-lg">🏆</span>
          <span className="text-gray-50 font-bold text-lg">
            {winnerName}
          </span>
          <span className="text-gray-400 font-medium">
            赢得底池
          </span>
          <span className="text-amber-400 font-bold text-lg">
            ${amount.toLocaleString()}
          </span>
        </div>
        {winningHand && (
          <span className="text-gray-500 text-sm">{winningHand}</span>
        )}
      </div>
    </div>
  );
};