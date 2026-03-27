import React from 'react';

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface SidePot {
  amount: number;
  eligiblePlayerIds: string[];
}

interface TableFeltProps {
  communityCards: Card[];
  pot: number;
  sidePots?: SidePot[];
}

const SUIT_SYMBOLS: Record<string, string> = {
  s: '♠', h: '♥', d: '♦', c: '♣',
};

const SUIT_COLORS: Record<string, string> = {
  s: 'text-gray-800', h: 'text-red-500', d: 'text-red-500', c: 'text-gray-800',
};

function CommunityCard({ card }: { card: Card }) {
  return (
    <div className="w-14 h-20 rounded-lg bg-white border border-gray-200 flex flex-col items-center justify-center shadow-md">
      <span className={`text-base font-bold leading-none ${SUIT_COLORS[card.suit]}`}>
        {card.rank}
      </span>
      <span className={`text-lg leading-none ${SUIT_COLORS[card.suit]}`}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  );
}

function EmptyCardSlot() {
  return (
    <div className="w-14 h-20 rounded-lg border-2 border-dashed border-emerald-700/50" />
  );
}

function PotDisplay({ pot, sidePots }: { pot: number; sidePots?: SidePot[] }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1.5 bg-gray-950/60 backdrop-blur-sm px-4 py-1.5 rounded-full">
        <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span className="text-amber-500 font-bold text-base">{pot}</span>
      </div>
      {sidePots && sidePots.length > 0 && (
        <div className="flex gap-2">
          {sidePots.map((sp, i) => (
            <span
              key={i}
              className="text-amber-400/70 text-xs bg-gray-950/40 px-2 py-0.5 rounded-full"
            >
              边池 {sp.amount}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function TableFelt({ communityCards, pot, sidePots }: TableFeltProps) {
  // Fill up to 5 slots
  const cardSlots = Array.from({ length: 5 }, (_, i) => communityCards[i] ?? null);

  return (
    <div className="relative w-full h-full">
      {/* Elliptical felt surface */}
      <div className="absolute inset-0 rounded-[50%] bg-emerald-900 border-4 border-emerald-700 shadow-[inset_0_2px_40px_rgba(0,0,0,0.4)]">
        {/* Inner line */}
        <div className="absolute inset-4 rounded-[50%] border border-emerald-600/30" />
      </div>

      {/* Content centered on felt */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        {/* Pot display */}
        <PotDisplay pot={pot} sidePots={sidePots} />

        {/* Community cards */}
        <div className="flex gap-2">
          {cardSlots.map((card, i) =>
            card ? (
              <CommunityCard key={i} card={card} />
            ) : (
              <EmptyCardSlot key={i} />
            )
          )}
        </div>
      </div>
    </div>
  );
}