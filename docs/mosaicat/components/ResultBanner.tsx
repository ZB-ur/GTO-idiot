import React, { useEffect, useState } from 'react';

export interface HandResultPotAmount {
  seatIndex: number;
  amount: number;
}

export interface HandResult {
  winnerSeatIndices: number[];
  potAmounts: HandResultPotAmount[];
  winningHand?: string;
}

export interface ResultBannerProps {
  result: HandResult;
  userSeatIndex: number;
  visible: boolean;
}

export function ResultBanner({ result, userSeatIndex, visible }: ResultBannerProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setAnimateIn(true), 50);
      return () => clearTimeout(timer);
    }
    setAnimateIn(false);
  }, [visible]);

  if (!visible) return null;

  const userWon = result.winnerSeatIndices.includes(userSeatIndex);
  const userPot = result.potAmounts.find((p) => p.seatIndex === userSeatIndex);
  const winAmount = userPot?.amount ?? 0;

  return (
    <div
      className={`
        fixed inset-x-0 top-1/3 z-50 flex justify-center pointer-events-none
        transition-all duration-500 ease-out
        ${animateIn ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}
      `}
    >
      <div
        className={`
          px-8 py-5 rounded-xl shadow-2xl border backdrop-blur-sm
          ${userWon
            ? 'bg-emerald-900/80 border-emerald-500/50'
            : 'bg-red-900/80 border-red-500/50'
          }
        `}
      >
        <div className="text-center">
          <div
            className={`text-2xl font-bold mb-1 ${
              userWon ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {userWon ? '🎉 You Won!' : '💔 You Lost'}
          </div>
          <div
            className={`text-3xl font-extrabold tabular-nums ${
              userWon ? 'text-emerald-300' : 'text-red-300'
            }`}
          >
            {userWon ? '+' : '−'}{Math.abs(winAmount)} chips
          </div>
          {result.winningHand && (
            <div className="text-sm text-gray-300 mt-2 font-medium">
              {result.winningHand}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}