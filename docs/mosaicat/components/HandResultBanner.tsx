import React from 'react';

interface HandResult {
  winnerNickname: string;
  amount: number;
  handRank?: string;
}

interface HandResultBannerProps {
  results: HandResult[];
  visible: boolean;
}

export const HandResultBanner: React.FC<HandResultBannerProps> = ({ results, visible }) => {
  if (!visible || results.length === 0) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-500 w-full max-w-md mx-auto">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-amber-500/30 rounded-xl px-5 py-3 shadow-lg shadow-amber-500/10">
        {results.map((result, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between gap-3 ${idx > 0 ? 'mt-2 pt-2 border-t border-gray-700' : ''}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-amber-400 text-lg">🏆</span>
              <span className="text-gray-50 font-semibold truncate">{result.winnerNickname}</span>
              {result.handRank && (
                <span className="text-gray-400 text-sm shrink-0">({result.handRank})</span>
              )}
            </div>
            <span className="text-emerald-500 font-bold text-lg shrink-0">
              +{result.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};