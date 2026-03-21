
import type { Card } from '../../types/card';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../types/card';

interface CardComponentProps {
  readonly card?: Card | null;
  readonly faceDown?: boolean;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly animate?: boolean;
  readonly className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-11 text-xs',
  md: 'w-11 h-16 text-sm',
  lg: 'w-14 h-20 text-base',
};

export function CardComponent({ card, faceDown = false, size = 'md', animate = false, className = '' }: CardComponentProps) {
  if (!card || faceDown) {
    return (
      <div
        className={`${sizeStyles[size]} flex items-center justify-center rounded-lg border border-gray-600 bg-gradient-to-br from-blue-800 to-blue-950 shadow-md ${
          animate ? 'animate-deal' : ''
        } ${className}`}
      >
        <div className="text-lg text-blue-400/40">♠</div>
      </div>
    );
  }

  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const colorClass = SUIT_COLORS[card.suit];

  return (
    <div
      className={`${sizeStyles[size]} flex flex-col items-center justify-center rounded-lg border border-gray-300/20 bg-white shadow-md ${
        animate ? 'animate-deal' : ''
      } ${className}`}
    >
      <span className={`font-bold leading-none ${colorClass} drop-shadow-sm`} style={{ filter: 'none' }}>
        <span className="text-gray-900" style={{ color: card.suit === 'h' || card.suit === 'd' ? '#ef4444' : card.suit === 'c' ? '#16a34a' : '#1f2937' }}>
          {card.rank}
        </span>
      </span>
      <span className={`leading-none ${size === 'sm' ? 'text-xs' : 'text-sm'}`} style={{ color: card.suit === 'h' || card.suit === 'd' ? '#ef4444' : card.suit === 'c' ? '#16a34a' : '#1f2937' }}>
        {suitSymbol}
      </span>
    </div>
  );
}
