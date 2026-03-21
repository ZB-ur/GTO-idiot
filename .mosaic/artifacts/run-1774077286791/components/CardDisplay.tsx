import React from 'react';

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardSize = 'sm' | 'md' | 'lg';
export type CardAnimation = 'flip' | 'deal' | 'none';

interface CardDisplayProps {
  rank?: Rank;
  suit?: Suit;
  faceDown?: boolean;
  animate?: CardAnimation;
  size?: CardSize;
}

const suitSymbols: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<Suit, string> = {
  hearts: '#ef4444',
  diamonds: '#ef4444',
  clubs: '#1e293b',
  spades: '#1e293b',
};

const sizeConfig: Record<CardSize, { width: number; height: number; fontSize: number; suitSize: number }> = {
  sm: { width: 48, height: 68, fontSize: 14, suitSize: 16 },
  md: { width: 64, height: 90, fontSize: 18, suitSize: 22 },
  lg: { width: 80, height: 112, fontSize: 22, suitSize: 28 },
};

const rankDisplay = (rank: Rank): string => (rank === 'T' ? '10' : rank);

const CardDisplay: React.FC<CardDisplayProps> = ({
  rank,
  suit,
  faceDown = false,
  animate = 'none',
  size = 'md',
}) => {
  const config = sizeConfig[size];
  const showFace = !faceDown && rank && suit;

  const animationClass =
    animate === 'flip'
      ? 'animate-card-flip'
      : animate === 'deal'
        ? 'animate-card-deal'
        : '';

  return (
    <div
      className={`inline-block ${animationClass}`}
      style={{ perspective: '600px' }}
    >
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        {/* Card body */}
        <rect
          x="1"
          y="1"
          width={config.width - 2}
          height={config.height - 2}
          rx="6"
          ry="6"
          fill={faceDown ? '#1e40af' : '#ffffff'}
          stroke="#d1d5db"
          strokeWidth="1"
        />

        {faceDown ? (
          /* Card back pattern */
          <>
            <rect
              x="5"
              y="5"
              width={config.width - 10}
              height={config.height - 10}
              rx="3"
              ry="3"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1"
            />
            <line
              x1="5"
              y1="5"
              x2={config.width - 5}
              y2={config.height - 5}
              stroke="#3b82f6"
              strokeWidth="0.5"
              opacity="0.4"
            />
            <line
              x1={config.width - 5}
              y1="5"
              x2="5"
              y2={config.height - 5}
              stroke="#3b82f6"
              strokeWidth="0.5"
              opacity="0.4"
            />
          </>
        ) : showFace ? (
          /* Card face */
          <>
            {/* Top-left rank */}
            <text
              x="6"
              y={config.fontSize + 4}
              fontSize={config.fontSize}
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
              fill={suitColors[suit!]}
            >
              {rankDisplay(rank!)}
            </text>
            {/* Top-left suit */}
            <text
              x="6"
              y={config.fontSize + config.suitSize + 4}
              fontSize={config.suitSize * 0.8}
              fontFamily="system-ui, sans-serif"
              fill={suitColors[suit!]}
            >
              {suitSymbols[suit!]}
            </text>
            {/* Center suit */}
            <text
              x={config.width / 2}
              y={config.height / 2 + config.suitSize / 3}
              fontSize={config.suitSize * 1.5}
              fontFamily="system-ui, sans-serif"
              fill={suitColors[suit!]}
              textAnchor="middle"
            >
              {suitSymbols[suit!]}
            </text>
            {/* Bottom-right rank (inverted) */}
            <text
              x={config.width - 6}
              y={config.height - 8}
              fontSize={config.fontSize}
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
              fill={suitColors[suit!]}
              textAnchor="end"
              transform={`rotate(180, ${config.width - 6}, ${config.height - config.fontSize / 2 - 4})`}
            >
              {rankDisplay(rank!)}
            </text>
          </>
        ) : null}
      </svg>
    </div>
  );
};

export default CardDisplay;