
import type { Card } from '../../types/card';
import { CardComponent } from './CardComponent';

interface CommunityCardsProps {
  readonly cards: readonly Card[];
  readonly animate?: boolean;
}

export function CommunityCards({ cards, animate = false }: CommunityCardsProps) {
  // Always show 5 slots, filled cards + empty placeholders
  const slots = Array.from({ length: 5 }, (_, i) => cards[i] ?? null);

  return (
    <div className="flex items-center justify-center gap-1.5">
      {slots.map((card, i) => (
        <div key={i}>
          {card ? (
            <CardComponent card={card} size="md" animate={animate} />
          ) : (
            <div className="h-16 w-11 rounded-lg border border-dashed border-gray-600/40" />
          )}
        </div>
      ))}
    </div>
  );
}
