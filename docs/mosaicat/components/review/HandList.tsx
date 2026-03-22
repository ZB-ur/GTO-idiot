import React from 'react';

export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface CardData {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

export interface HandSummary {
  handId: string;
  handNumber: number;
  position: Position;
  holeCards: [CardData, CardData];
  resultBB: number;
  overallConformance: 'conforming' | 'minor_deviation' | 'major_deviation';
  totalEvLoss: number;
  street: string; // last street reached
}

interface HandListProps {
  hands: HandSummary[];
  onSelectHand: (handId: string) => void;
  selectedHandId?: string;
}

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-blue-500',
  clubs: 'text-green-700',
  spades: 'text-gray-900',
};

const conformanceBadge: Record<string, { label: string; color: string; bg: string; border: string }> = {
  conforming: { label: 'GTO', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  minor_deviation: { label: 'Minor', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  major_deviation: { label: 'Major', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
};

const MiniCard: React.FC<{ card: CardData }> = ({ card }) => (
  <span className={`text-sm font-bold ${suitColors[card.suit]}`}>
    {card.rank}{suitSymbols[card.suit]}
  </span>
);

export const HandList: React.FC<HandListProps> = ({
  hands,
  onSelectHand,
  selectedHandId,
}) => {
  if (hands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-base font-semibold text-gray-900 mb-1">No hands yet</p>
        <p className="text-sm text-gray-500">Play a session to see your hand history here.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {hands.map((hand) => {
        const badge = conformanceBadge[hand.overallConformance];
        const isSelected = selectedHandId === hand.handId;
        const isWin = hand.resultBB > 0;
        const isLoss = hand.resultBB < 0;

        return (
          <button
            key={hand.handId}
            onClick={() => onSelectHand(hand.handId)}
            className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors ${
              isSelected
                ? 'bg-blue-50 border-l-2 border-blue-600'
                : 'hover:bg-gray-50 border-l-2 border-transparent'
            }`}
          >
            {/* Hand number */}
            <span className="text-xs text-gray-400 font-mono w-6 text-right shrink-0">
              #{hand.handNumber}
            </span>

            {/* Cards */}
            <div className="flex items-center gap-0.5 shrink-0 w-16">
              <MiniCard card={hand.holeCards[0]} />
              <MiniCard card={hand.holeCards[1]} />
            </div>

            {/* Position */}
            <span className="text-xs font-semibold text-gray-500 uppercase w-8 shrink-0">
              {hand.position}
            </span>

            {/* GTO badge */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${badge.color} ${badge.bg} border ${badge.border} shrink-0`}>
              {badge.label}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* EV loss (if any) */}
            {hand.totalEvLoss > 0 && (
              <span className="text-xs text-red-500 font-medium shrink-0">
                −{hand.totalEvLoss.toFixed(1)}BB
              </span>
            )}

            {/* Result */}
            <span
              className={`text-sm font-semibold tabular-nums w-16 text-right shrink-0 ${
                isWin ? 'text-green-600' : isLoss ? 'text-red-600' : 'text-gray-400'
              }`}
            >
              {isWin ? '+' : ''}{hand.resultBB.toFixed(1)}BB
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default HandList;