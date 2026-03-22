import React from 'react';

interface CardData {
  rank: string;
  suit: string;
}

interface HandHistoryItemProps {
  handId: string;
  playedAt: string;
  blindLevel: string;
  holeCards: CardData[];
  profit: number;
  result: 'won' | 'lost' | 'folded' | 'split';
  playerPosition: string;
  onClick: (handId: string) => void;
}

const suitSymbol: Record<string, string> = {
  s: '♠', h: '♥', d: '♦', c: '♣',
};

const suitColor: Record<string, string> = {
  s: 'text-gray-900', h: 'text-red-600', d: 'text-red-600', c: 'text-gray-900',
};

const resultBadge: Record<string, { bg: string; text: string; label: string }> = {
  won: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Won' },
  lost: { bg: 'bg-red-100', text: 'text-red-700', label: 'Lost' },
  folded: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Folded' },
  split: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Split' },
};

export const HandHistoryItem: React.FC<HandHistoryItemProps> = ({
  handId,
  playedAt,
  blindLevel,
  holeCards,
  profit,
  result,
  playerPosition,
  onClick,
}) => {
  const badge = resultBadge[result];
  const profitColor = profit > 0 ? 'text-emerald-600' : profit < 0 ? 'text-red-500' : 'text-gray-500';
  const profitLabel = profit > 0 ? `+$${profit}` : profit < 0 ? `-$${Math.abs(profit)}` : '$0';
  const dateStr = new Date(playedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <button
      onClick={() => onClick(handId)}
      className="w-full flex items-center gap-4 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
    >
      <div className="flex gap-1">
        {holeCards.map((c, i) => (
          <div
            key={i}
            className="w-8 h-11 rounded-md bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center"
          >
            <span className={`text-[10px] font-bold ${suitColor[c.suit]}`}>{c.rank}</span>
            <span className={`text-[10px] ${suitColor[c.suit]}`}>{suitSymbol[c.suit]}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{blindLevel}</span>
          <span className="text-xs font-medium text-gray-400 uppercase">{playerPosition}</span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
        </div>
        <span className="text-xs text-gray-400 mt-0.5 block">{dateStr}</span>
      </div>

      <span className={`text-sm font-bold ${profitColor} tabular-nums`}>
        {profitLabel}
      </span>
    </button>
  );
};