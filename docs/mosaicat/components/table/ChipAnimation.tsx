import React, { useEffect, useRef, useState } from 'react';

interface ChipAnimationProps {
  fromSeatIndex: number;
  amount: number;
  onComplete?: () => void;
}

/** Seat positions on a 6-player oval table (percentages of container) */
const SEAT_POSITIONS: Record<number, { x: number; y: number }> = {
  0: { x: 50, y: 90 },   // bottom center (user)
  1: { x: 10, y: 65 },   // left bottom
  2: { x: 10, y: 25 },   // left top
  3: { x: 50, y: 5 },    // top center
  4: { x: 90, y: 25 },   // right top
  5: { x: 90, y: 65 },   // right bottom
};

const POT_CENTER = { x: 50, y: 48 };

const ANIMATION_DURATION_MS = 600;

const formatChipAmount = (amount: number): string => {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k`;
  return String(amount);
};

export const ChipAnimation: React.FC<ChipAnimationProps> = ({
  fromSeatIndex,
  amount,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'moving' | 'done'>('moving');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const from = SEAT_POSITIONS[fromSeatIndex] ?? SEAT_POSITIONS[0];

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, ANIMATION_DURATION_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute flex items-center gap-1 transition-all ease-out"
        style={{
          left: `${from.x}%`,
          top: `${from.y}%`,
          transform: 'translate(-50%, -50%)',
          animation: `chipSlide ${ANIMATION_DURATION_MS}ms ease-out forwards`,
          ['--to-x' as string]: `${POT_CENTER.x - from.x}vw`,
          ['--to-y' as string]: `${POT_CENTER.y - from.y}vh`,
        }}
      >
        {/* Chip stack icon */}
        <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-amber-300 shadow-md flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full border border-amber-300/60" />
        </div>
        <span className="text-amber-400 text-xs font-bold drop-shadow-lg">
          {formatChipAmount(amount)}
        </span>
      </div>

      <style>{`
        @keyframes chipSlide {
          0% {
            left: ${from.x}%;
            top: ${from.y}%;
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            left: ${POT_CENTER.x}%;
            top: ${POT_CENTER.y}%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};