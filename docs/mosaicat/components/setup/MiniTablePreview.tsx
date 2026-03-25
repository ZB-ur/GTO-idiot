import React from 'react';

const AVATAR_STYLES: Record<string, { bg: string; emoji: string }> = {
  fish: { bg: 'bg-emerald-400', emoji: '🐟' },
  regular: { bg: 'bg-amber-400', emoji: '🎯' },
  gto: { bg: 'bg-red-400', emoji: '🧠' },
};

// Positions around an ellipse for 6 seats (hero + 5 bots)
const SEAT_POSITIONS = [
  { top: '78%', left: '50%' },  // Seat 0 — Hero (bottom center)
  { top: '60%', left: '12%' },  // Seat 1 — left
  { top: '15%', left: '15%' },  // Seat 2 — top-left
  { top: '5%',  left: '50%' },  // Seat 3 — top center
  { top: '15%', left: '85%' },  // Seat 4 — top-right
  { top: '60%', left: '88%' },  // Seat 5 — right
];

interface MiniTablePreviewProps {
  bots: Array<{ seatIndex: number; difficulty: string }>;
  stackSize: string;
}

export const MiniTablePreview: React.FC<MiniTablePreviewProps> = ({ bots, stackSize }) => {
  const botMap = new Map(bots.map((b) => [b.seatIndex, b.difficulty]));

  return (
    <div className="relative w-64 h-44 mx-auto">
      {/* Table felt */}
      <div className="absolute inset-4 bg-emerald-800 rounded-[50%] border-4 border-emerald-900 shadow-inner" />
      <div className="absolute inset-6 bg-emerald-700 rounded-[50%] border-2 border-emerald-600/30" />

      {/* Stack label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-200/70 text-xs font-medium">
        {stackSize}
      </div>

      {/* Seats */}
      {SEAT_POSITIONS.map((pos, idx) => {
        const isHero = idx === 0;
        const difficulty = botMap.get(idx) ?? 'fish';
        const avatar = AVATAR_STYLES[difficulty] ?? AVATAR_STYLES.fish;

        return (
          <div
            key={idx}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: pos.top, left: pos.left }}
          >
            {isHero ? (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-md border-2 border-blue-400">
                You
              </div>
            ) : (
              <div
                className={`w-7 h-7 rounded-full ${avatar.bg} flex items-center justify-center text-sm shadow-sm border-2 border-white/50`}
              >
                {avatar.emoji}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MiniTablePreview;