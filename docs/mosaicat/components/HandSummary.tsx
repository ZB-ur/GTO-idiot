import React from 'react';

interface Card {
  rank: string;
  suit: string;
}

interface HandHistoryPlayer {
  id: string;
  nickname: string;
  position: string;
  startingChips: number;
  endingChips: number;
  isUser: boolean;
  botStyle?: string | null;
  holeCards?: Card[] | null;
}

interface HandResult {
  winnerId: string;
  winnerNickname: string;
  amount: number;
  handRank: string;
  potLabel?: string;
}

interface HandHistoryRecord {
  handId: string;
  gameId: string;
  handNumber: number;
  timestamp: number;
  userPosition: string;
  userHoleCards?: Card[];
  userPnl: number;
  players: HandHistoryPlayer[];
  communityCards: Card[];
  actions: unknown[];
  pots?: Array<{ amount: number; eligiblePlayerIds: string[]; label?: string }>;
  results?: HandResult[];
  isKeyHand: boolean;
  keyHandReason?: string | null;
  summary?: string;
  lastStreetReached?: string;
}

interface HandSummaryProps {
  hand: HandHistoryRecord;
  className?: string;
}

const suitSymbols: Record<string, string> = {
  s: '♠', h: '♥', d: '♦', c: '♣',
};

const suitColors: Record<string, string> = {
  s: 'text-gray-50',
  h: 'text-red-500',
  d: 'text-blue-400',
  c: 'text-emerald-500',
};

function CardDisplay({ card }: { card: Card }) {
  return (
    <span className={`font-mono font-bold ${suitColors[card.suit]}`}>
      {card.rank}{suitSymbols[card.suit]}
    </span>
  );
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const HandSummary: React.FC<HandSummaryProps> = ({ hand, className = '' }) => {
  const pnlColor = hand.userPnl > 0
    ? 'text-emerald-500'
    : hand.userPnl < 0
      ? 'text-red-500'
      : 'text-gray-400';

  const pnlText = hand.userPnl > 0
    ? `+${hand.userPnl.toFixed(1)} BB`
    : `${hand.userPnl.toFixed(1)} BB`;

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-5 ${className}`}>
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-50">Hand #{hand.handNumber}</h3>
          {hand.isKeyHand && (
            <svg className="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
        <p className="text-sm text-gray-500">{formatTimestamp(hand.timestamp)}</p>
      </div>

      {/* Result */}
      <div className="bg-gray-800 rounded-lg p-3 text-center">
        <p className="text-sm text-gray-400 mb-1">Result</p>
        <p className={`text-2xl font-bold font-mono ${pnlColor}`}>{pnlText}</p>
        {hand.summary && (
          <p className="text-sm text-gray-400 mt-1">{hand.summary}</p>
        )}
      </div>

      {/* Community Cards */}
      {hand.communityCards.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Board</p>
          <div className="flex gap-1.5">
            {hand.communityCards.map((c, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-center min-w-[36px]">
                <CardDisplay card={c} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Players Table */}
      <div>
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Players</p>
        <div className="space-y-1">
          {hand.players.map((p) => {
            const chipDiff = p.endingChips - p.startingChips;
            const diffColor = chipDiff > 0
              ? 'text-emerald-500'
              : chipDiff < 0
                ? 'text-red-500'
                : 'text-gray-500';
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${p.isUser ? 'bg-gray-800 border border-amber-500/30' : 'bg-gray-800/50'}`}
              >
                <span className="w-8 text-center text-xs font-bold text-amber-400">{p.position}</span>
                <span className={`flex-1 ${p.isUser ? 'text-gray-50 font-semibold' : 'text-gray-300'}`}>
                  {p.nickname}
                </span>
                {p.botStyle && (
                  <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">{p.botStyle}</span>
                )}
                {p.holeCards && (
                  <span className="flex gap-0.5">
                    {p.holeCards.map((c, i) => <CardDisplay key={i} card={c} />)}
                  </span>
                )}
                <span className={`font-mono text-xs ${diffColor}`}>
                  {chipDiff > 0 ? '+' : ''}{chipDiff.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pot Info */}
      {hand.pots && hand.pots.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Pots</p>
          <div className="space-y-1">
            {hand.pots.map((pot, i) => (
              <div key={i} className="flex justify-between text-sm px-3 py-1.5 bg-gray-800 rounded-lg">
                <span className="text-gray-400">{pot.label || `Pot ${i + 1}`}</span>
                <span className="text-amber-400 font-mono font-semibold">{pot.amount} BB</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HandSummary;