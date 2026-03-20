import React from 'react';
import PlayingCard, { Suit, Rank } from './PlayingCard';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type SeatPosition = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
export type Street = 'preflop' | 'flop' | 'turn' | 'river';

export interface HandHistoryItem {
  handId: string;
  sessionId: string;
  handNumber: number;
  dateTime: string;
  userPosition: SeatPosition;
  holeCards: Card[];
  holeCardsShorthand?: string;
  communityCards?: Card[];
  result: number;
  reachedStreet?: Street;
}

export interface HandHistoryCardProps {
  hand: HandHistoryItem;
  onClick: (handId: string) => void;
  isExpanded?: boolean;
}

const positionColors: Record<SeatPosition, string> = {
  UTG: 'bg-red-500/20 text-red-400 border-red-500/30',
  MP: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  CO: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  BTN: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  SB: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  BB: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const streetLabels: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

function formatDate(dateTime: string): string {
  const d = new Date(dateTime);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}

function formatResult(result: number): { text: string; color: string } {
  if (result > 0) return { text: `+${result.toFixed(1)} BB`, color: 'text-green-400' };
  if (result < 0) return { text: `${result.toFixed(1)} BB`, color: 'text-red-400' };
  return { text: '0 BB', color: 'text-gray-400' };
}

export const HandHistoryCard: React.FC<HandHistoryCardProps> = ({
  hand,
  onClick,
  isExpanded = false,
}) => {
  const resultInfo = formatResult(hand.result);

  return (
    <div
      onClick={() => onClick(hand.handId)}
      className={`
        bg-gray-800 border rounded-xl cursor-pointer
        transition-all duration-200 hover:bg-gray-700/80 hover:border-gray-500
        ${isExpanded ? 'border-emerald-600 ring-1 ring-emerald-600/30' : 'border-gray-600'}
      `}
    >
      {/* Main row */}
      <div className="p-4 flex items-center gap-4">
        {/* Hand number */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
          <span className="text-gray-300 text-sm font-bold">#{hand.handNumber}</span>
        </div>

        {/* Info block */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Position badge */}
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${positionColors[hand.userPosition]}`}>
              {hand.userPosition}
            </span>
            {/* Date */}
            <span className="text-gray-500 text-xs">{formatDate(hand.dateTime)}</span>
            {/* Street reached */}
            {hand.reachedStreet && (
              <span className="text-gray-500 text-xs">
                &middot; {streetLabels[hand.reachedStreet]}
              </span>
            )}
          </div>

          {/* Hole cards shorthand */}
          {hand.holeCardsShorthand && (
            <span className="text-gray-300 text-sm font-mono font-semibold">
              {hand.holeCardsShorthand}
            </span>
          )}
        </div>

        {/* Hole cards visual */}
        <div className="flex-shrink-0 flex gap-1">
          {hand.holeCards.map((card, i) => (
            <PlayingCard key={i} card={card} size="sm" />
          ))}
        </div>

        {/* Result */}
        <div className="flex-shrink-0 text-right min-w-[80px]">
          <span className={`text-base font-bold ${resultInfo.color}`}>{resultInfo.text}</span>
        </div>

        {/* Expand chevron */}
        <div className="flex-shrink-0">
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded section */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-700">
          <div className="pt-3 flex items-center gap-3">
            {/* Community cards */}
            <div className="flex-1">
              <span className="text-gray-500 text-xs font-medium block mb-1.5">Community</span>
              <div className="flex gap-1">
                {hand.communityCards && hand.communityCards.length > 0 ? (
                  hand.communityCards.map((card, i) => (
                    <PlayingCard key={i} card={card} size="sm" />
                  ))
                ) : (
                  <span className="text-gray-600 text-xs italic">No community cards</span>
                )}
              </div>
            </div>

            {/* Session info */}
            <div className="text-right">
              <span className="text-gray-500 text-xs block">Session</span>
              <span className="text-gray-400 text-xs font-mono">
                {hand.sessionId.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandHistoryCard;