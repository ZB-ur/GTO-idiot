import React, { useEffect, useState, useRef } from 'react';

interface DealAnimationProps {
  targetSeats: number[];
  onComplete?: () => void;
}

/** Seat positions matching ChipAnimation layout */
const SEAT_POSITIONS: Record<number, { x: number; y: number }> = {
  0: { x: 50, y: 90 },
  1: { x: 10, y: 65 },
  2: { x: 10, y: 25 },
  3: { x: 50, y: 5 },
  4: { x: 90, y: 25 },
  5: { x: 90, y: 65 },
};

const DECK_POSITION = { x: 50, y: 10 };
const CARD_DELAY_MS = 150;
const CARD_FLY_MS = 400;

export const DealAnimation: React.FC<DealAnimationProps> = ({
  targetSeats,
  onComplete,
}) => {
  const [activeCards, setActiveCards] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Stagger card deals
    targetSeats.forEach((_, i) => {
      const t = setTimeout(() => {
        setActiveCards((prev) => [...prev, i]);
      }, i * CARD_DELAY_MS);
      timerRef.current.push(t);
    });

    // Complete callback after all cards have landed
    const totalDuration = targetSeats.length * CARD_DELAY_MS + CARD_FLY_MS;
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, totalDuration);
    timerRef.current.push(completeTimer);

    return () => {
      timerRef.current.forEach(clearTimeout);
    };
  }, [targetSeats, onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {activeCards.map((cardIndex) => {
        const seatIndex = targetSeats[cardIndex];
        const target = SEAT_POSITIONS[seatIndex] ?? SEAT_POSITIONS[0];

        return (
          <div
            key={cardIndex}
            className="absolute w-10 h-14 rounded-lg bg-gradient-to-br from-sky-800 to-sky-950 border border-sky-600 shadow-lg"
            style={{
              left: `${DECK_POSITION.x}%`,
              top: `${DECK_POSITION.y}%`,
              transform: 'translate(-50%, -50%) scale(0.6)',
              animation: `dealCard-${seatIndex} ${CARD_FLY_MS}ms ease-out forwards`,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-[70%] h-[75%] rounded border border-sky-500/40 bg-sky-900/60 flex items-center justify-center">
                <span className="text-sky-400/50 text-sm font-bold">✦</span>
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        ${targetSeats
          .map((seatIndex) => {
            const target = SEAT_POSITIONS[seatIndex] ?? SEAT_POSITIONS[0];
            return `
              @keyframes dealCard-${seatIndex} {
                0% {
                  left: ${DECK_POSITION.x}%;
                  top: ${DECK_POSITION.y}%;
                  transform: translate(-50%, -50%) scale(0.6);
                  opacity: 1;
                }
                100% {
                  left: ${target.x}%;
                  top: ${target.y}%;
                  transform: translate(-50%, -50%) scale(1);
                  opacity: 1;
                }
              }
            `;
          })
          .join('\n')}
      `}</style>
    </div>
  );
};