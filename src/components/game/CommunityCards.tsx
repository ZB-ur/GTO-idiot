// ============================================================
// GTO Idiot — Community Cards Component
// Displays the 5 community card slots (flop/turn/river)
// ============================================================

import type { Card, Street } from '../../types';
import CardDisplay from './CardDisplay';

interface CommunityCardsProps {
  cards: Card[];
  street: Street;
  className?: string;
}

const STREET_LABELS: Record<Street, string> = {
  preflop: 'Pre-Flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

export default function CommunityCards({ cards, street, className = '' }: CommunityCardsProps) {
  // Always render 5 card slots
  const slots: (Card | null)[] = [];
  for (let i = 0; i < 5; i++) {
    slots.push(cards[i] ?? null);
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
        {STREET_LABELS[street]}
      </span>
      <div className="flex items-center gap-1.5">
        {slots.map((card, i) => {
          // Separate flop (0-2) | turn (3) | river (4) with wider gap
          const gapClass = i === 3 ? 'ml-2' : '';
          const isDealt = card !== null;

          return (
            <div key={i} className={gapClass}>
              {isDealt ? (
                <CardDisplay card={card} size="lg" />
              ) : (
                <div className="flex h-20 w-14 items-center justify-center rounded-md border border-dashed border-gray-600 bg-gray-800/50">
                  <span className="text-xs text-gray-600">?</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
