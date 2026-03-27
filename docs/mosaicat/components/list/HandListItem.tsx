import React from 'react';

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface GTORatingSummary {
  optimalCount: number;
  acceptableCount: number;
  errorCount: number;
  totalDecisions: number;
}

interface HandListItemData {
  handId: string;
  handNumber: number;
  sessionId: string;
  playedAt: string;
  holeCards: [Card, Card];
  resultBB: number;
  gtoRating: GTORatingSummary;
}

interface HandListItemProps {
  hand: HandListItemData;
  onClick: (handId: string) => void;
}

const suitSymbol: Record<string, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

const suitColor: Record<string, string> = {
  s: 'text-gray-100',
  h: 'text-red-500',
  d: 'text-red-500',
  c: 'text-gray-100',
};

function MiniCardPair({ cards }: { cards: [Card, Card] }) {
  return (
    <div className="flex gap-0.5">
      {cards.map((card, i) => (
        <span
          key={i}
          className={`inline-flex items-center justify-center w-8 h-10 rounded bg-gray-800 border border-gray-700 text-xs font-bold ${suitColor[card.suit]}`}
        >
          {card.rank}{suitSymbol[card.suit]}
        </span>
      ))}
    </div>
  );
}

function ResultBadge({ resultBB }: { resultBB: number }) {
  const isPositive = resultBB > 0;
  const isZero = resultBB === 0;
  return (
    <span
      className={`text-sm font-semibold tabular-nums ${
        isZero
          ? 'text-gray-400'
          : isPositive
            ? 'text-emerald-500'
            : 'text-red-500'
      }`}
    >
      {isPositive ? '+' : ''}{resultBB.toFixed(1)} BB
    </span>
  );
}

function GTORatingSummaryDisplay({ rating }: { rating: GTORatingSummary }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {rating.optimalCount > 0 && (
        <span className="text-emerald-500">✅{rating.optimalCount}</span>
      )}
      {rating.acceptableCount > 0 && (
        <span className="text-yellow-500">⚠️{rating.acceptableCount}</span>
      )}
      {rating.errorCount > 0 && (
        <span className="text-red-500">❌{rating.errorCount}</span>
      )}
    </div>
  );
}

function formatTime(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export const HandListItem: React.FC<HandListItemProps> = ({ hand, onClick }) => {
  return (
    <button
      onClick={() => onClick(hand.handId)}
      className="w-full flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 hover:bg-gray-800/60 transition-all duration-200 text-left"
    >
      {/* Hand number */}
      <span className="text-gray-500 text-sm font-mono w-8 shrink-0 text-right">
        #{hand.handNumber}
      </span>

      {/* Mini card pair */}
      <MiniCardPair cards={hand.holeCards} />

      {/* Time + GTO */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-gray-400 text-xs">
          {formatTime(hand.playedAt)}
        </span>
        <GTORatingSummaryDisplay rating={hand.gtoRating} />
      </div>

      {/* Result */}
      <div className="shrink-0">
        <ResultBadge resultBB={hand.resultBB} />
      </div>

      {/* Chevron */}
      <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};