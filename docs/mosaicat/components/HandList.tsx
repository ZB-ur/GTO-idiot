import React, { useRef, useCallback, useEffect, useState } from 'react';

// Types from API spec
interface Card {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
type Street = 'preflop' | 'flop' | 'turn' | 'river';
type DeviationSeverity = 'minor' | 'moderate' | 'severe';

interface HandSummary {
  id: string;
  hand_number: number;
  session_id?: string;
  date: string;
  position: Position;
  result_bb: number;
  street_reached: Street;
  has_deviation?: boolean;
  max_deviation_severity?: DeviationSeverity | null;
  hero_hand?: Card[] | null;
}

interface HandListProps {
  hands: HandSummary[];
  total: number;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelect: (handId: string) => void;
  selectedId?: string;
}

const ROW_HEIGHT = 72;
const OVERSCAN = 5;

const suitSymbol: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColor: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-50',
  spades: 'text-gray-50',
};

const streetLabel: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const severityColor: Record<DeviationSeverity, string> = {
  minor: 'bg-green-400',
  moderate: 'bg-yellow-400',
  severe: 'bg-red-400',
};

const severityBorder: Record<DeviationSeverity, string> = {
  minor: 'border-l-green-400',
  moderate: 'border-l-yellow-400',
  severe: 'border-l-red-400',
};

function CardDisplay({ card }: { card: Card }) {
  return (
    <span className={`inline-flex items-center font-mono text-sm ${suitColor[card.suit]}`}>
      {card.rank}
      {suitSymbol[card.suit]}
    </span>
  );
}

function DeviationMarker({ severity }: { severity: DeviationSeverity }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${severityColor[severity]}`}
      title={`${severity} deviation`}
    />
  );
}

function formatResult(bb: number): { text: string; className: string } {
  if (bb > 0) return { text: `+${bb.toFixed(1)} BB`, className: 'text-emerald-500 font-semibold' };
  if (bb < 0) return { text: `${bb.toFixed(1)} BB`, className: 'text-red-500 font-semibold' };
  return { text: '0 BB', className: 'text-gray-500' };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}

export default function HandList({
  hands,
  total,
  hasMore,
  onLoadMore,
  onSelect,
  selectedId,
}: HandListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      setScrollTop(target.scrollTop);

      // Trigger load more when near bottom
      if (
        hasMore &&
        target.scrollHeight - target.scrollTop - target.clientHeight < ROW_HEIGHT * 3
      ) {
        onLoadMore();
      }
    },
    [hasMore, onLoadMore]
  );

  const totalHeight = hands.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    hands.length,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN
  );
  const visibleHands = hands.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-50">Hand History</h2>
        <span className="text-sm text-gray-500">
          {hands.length} / {total.toLocaleString()} hands
        </span>
      </div>

      {/* Column labels */}
      <div className="grid grid-cols-[3rem_4rem_3.5rem_1fr_5rem_5rem] gap-2 px-4 py-2 text-xs text-gray-500 border-b border-gray-800 uppercase tracking-wider">
        <span>#</span>
        <span>Cards</span>
        <span>Pos</span>
        <span>Street</span>
        <span className="text-right">Result</span>
        <span className="text-right">Dev</span>
      </div>

      {/* Virtual scroll container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleHands.map((hand, i) => {
            const index = startIndex + i;
            const result = formatResult(hand.result_bb);
            const isSelected = hand.id === selectedId;
            const borderClass =
              hand.has_deviation && hand.max_deviation_severity
                ? `border-l-2 ${severityBorder[hand.max_deviation_severity]}`
                : 'border-l-2 border-l-transparent';

            return (
              <div
                key={hand.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(hand.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSelect(hand.id);
                }}
                className={`
                  absolute w-full grid grid-cols-[3rem_4rem_3.5rem_1fr_5rem_5rem] gap-2
                  items-center px-4 cursor-pointer transition-colors
                  ${borderClass}
                  ${isSelected ? 'bg-gray-800' : 'hover:bg-gray-900'}
                `}
                style={{
                  top: index * ROW_HEIGHT,
                  height: ROW_HEIGHT,
                }}
              >
                {/* Hand number */}
                <span className="text-sm text-gray-400 font-mono">
                  {hand.hand_number}
                </span>

                {/* Hero cards */}
                <span className="flex gap-0.5">
                  {hand.hero_hand ? (
                    hand.hero_hand.map((card, ci) => (
                      <CardDisplay key={ci} card={card} />
                    ))
                  ) : (
                    <span className="text-gray-600 text-sm">--</span>
                  )}
                </span>

                {/* Position */}
                <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 rounded px-1.5 py-0.5 text-center">
                  {hand.position}
                </span>

                {/* Street reached + date */}
                <div className="flex flex-col">
                  <span className="text-sm text-gray-300">
                    {streetLabel[hand.street_reached]}
                  </span>
                  <span className="text-xs text-gray-600">
                    {formatDate(hand.date)}
                  </span>
                </div>

                {/* Result */}
                <span className={`text-sm text-right ${result.className}`}>
                  {result.text}
                </span>

                {/* Deviation marker */}
                <span className="flex justify-end">
                  {hand.has_deviation && hand.max_deviation_severity && (
                    <DeviationMarker severity={hand.max_deviation_severity} />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Load more indicator */}
        {hasMore && (
          <div className="flex items-center justify-center py-4 text-sm text-gray-500">
            <svg
              className="animate-spin h-4 w-4 mr-2 text-emerald-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading more...
          </div>
        )}
      </div>
    </div>
  );
}