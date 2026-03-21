import React from 'react';

interface PlayerSeatProps {
  playerName: string;
  chipCount: number;
  isUser: boolean;
  isActive: boolean;
  isTurn: boolean;
  isDealer: boolean;
  holeCards?: { rank: string; suit: string }[];
  currentBet: number;
  status: 'active' | 'folded' | 'all-in' | 'busted';
  position: string;
  botStyle?: string;
}

const suitSymbols: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const suitColors: Record<string, string> = { s: 'text-gray-900', h: 'text-red-500', d: 'text-blue-500', c: 'text-green-600' };

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  playerName,
  chipCount,
  isUser,
  isActive,
  isTurn,
  isDealer,
  holeCards,
  currentBet,
  status,
  position,
  botStyle,
}) => {
  const statusStyles: Record<string, string> = {
    active: '',
    folded: 'opacity-50',
    'all-in': 'ring-2 ring-amber-400',
    busted: 'opacity-30 grayscale',
  };

  return (
    <div
      className={`relative flex flex-col items-center gap-1 ${statusStyles[status]}`}
    >
      {/* Dealer Button */}
      {isDealer && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10">
          D
        </div>
      )}

      {/* Avatar + Name area */}
      <div
        className={`relative flex flex-col items-center rounded-xl px-4 py-3 min-w-[100px] ${
          isUser ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-100'
        } ${isTurn ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-400/30' : 'shadow-sm'}`}
      >
        {/* Turn indicator pulse */}
        {isTurn && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
        )}

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg font-bold mb-1">
          {playerName.charAt(0).toUpperCase()}
        </div>

        {/* Name + Position */}
        <div className="text-sm font-semibold truncate max-w-[90px]">{playerName}</div>
        <div className="text-xs opacity-70 flex items-center gap-1">
          <span>{position}</span>
          {botStyle && <span className="text-[10px] px-1 bg-gray-700 rounded">{botStyle}</span>}
        </div>

        {/* Chips */}
        <div className="text-sm font-mono mt-1">
          {chipCount.toLocaleString()}
        </div>

        {/* Status badge */}
        {status === 'folded' && (
          <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">Folded</div>
        )}
        {status === 'all-in' && (
          <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mt-0.5">All-In</div>
        )}
        {status === 'busted' && (
          <div className="text-[10px] uppercase tracking-wider text-red-400 mt-0.5">Busted</div>
        )}
      </div>

      {/* Hole Cards */}
      {holeCards && holeCards.length > 0 && (
        <div className="flex gap-1 mt-1">
          {holeCards.map((card, i) => (
            <div
              key={i}
              className="w-9 h-13 bg-white rounded-md shadow-md flex flex-col items-center justify-center border border-gray-200 text-sm font-bold"
            >
              <span className={suitColors[card.suit]}>{card.rank}</span>
              <span className={suitColors[card.suit]}>{suitSymbols[card.suit]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Current Bet */}
      {currentBet > 0 && (
        <div className="mt-1 px-2 py-0.5 bg-emerald-900/80 text-emerald-300 rounded-full text-xs font-mono">
          {currentBet}
        </div>
      )}
    </div>
  );
};

export default PlayerSeat;