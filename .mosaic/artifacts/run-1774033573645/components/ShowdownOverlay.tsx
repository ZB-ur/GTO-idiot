import React, { useEffect, useState } from 'react';

// Types
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface Winner {
  seatIndex: number;
  amount: number;
  potType?: 'main' | 'side';
}

interface HandRanking {
  seatIndex: number;
  handName: string;
  cards: Card[];
}

interface HandResult {
  winners: Winner[];
  handRankings: HandRanking[];
  showdown?: boolean;
}

interface Player {
  seatIndex: number;
  name: string;
  chips: number;
  position: string;
  isHuman: boolean;
  isActive: boolean;
  holeCards?: Card[];
  botStyle?: string;
}

interface ShowdownOverlayProps {
  result: HandResult;
  players: Player[];
  isVisible: boolean;
  onDismiss: () => void;
}

const suitSymbols: Record<string, string> = {
  s: '♠', h: '♥', d: '♦', c: '♣',
};

const suitColors: Record<string, string> = {
  s: 'text-gray-900',
  h: 'text-red-500',
  d: 'text-blue-500',
  c: 'text-emerald-600',
};

function PlayingCardMini({ card }: { card: Card }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-12 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-bold ${suitColors[card.suit]}`}
    >
      {card.rank}{suitSymbols[card.suit]}
    </span>
  );
}

export default function ShowdownOverlay({
  result,
  players,
  isVisible,
  onDismiss,
}: ShowdownOverlayProps) {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    if (isVisible) {
      setPhase('enter');
      const t = setTimeout(() => setPhase('visible'), 50);
      return () => clearTimeout(t);
    } else {
      setPhase('exit');
    }
  }, [isVisible]);

  if (!isVisible && phase === 'exit') return null;

  const winnerIndices = new Set(result.winners.map((w) => w.seatIndex));
  const totalWon = result.winners.reduce((sum, w) => sum + w.amount, 0);

  const getPlayer = (seatIndex: number) =>
    players.find((p) => p.seatIndex === seatIndex);

  const winnerRankings = result.handRankings.filter((r) =>
    winnerIndices.has(r.seatIndex),
  );
  const loserRankings = result.handRankings.filter(
    (r) => !winnerIndices.has(r.seatIndex),
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
        phase === 'visible' ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={onDismiss}
    >
      <div
        className={`relative w-full max-w-lg mx-4 transition-all duration-500 ${
          phase === 'visible'
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Trophy glow ring */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-2xl blur-sm opacity-75 animate-pulse" />

        <div className="relative bg-emerald-900 border border-emerald-700 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-b from-emerald-800 to-emerald-900 px-6 pt-6 pb-4 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="text-xl font-bold text-amber-300 tracking-wide">
              SHOWDOWN
            </h2>
            <p className="text-emerald-300 text-sm mt-1">
              Pot: {totalWon.toLocaleString()} chips
            </p>
          </div>

          {/* Winners */}
          <div className="px-6 py-4 space-y-3">
            {winnerRankings.map((ranking) => {
              const player = getPlayer(ranking.seatIndex);
              const winAmount = result.winners.find(
                (w) => w.seatIndex === ranking.seatIndex,
              )?.amount ?? 0;

              return (
                <div
                  key={ranking.seatIndex}
                  className="bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-500/40 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👑</span>
                      <span className="text-white font-bold text-lg">
                        {player?.name ?? `Seat ${ranking.seatIndex}`}
                      </span>
                      {player?.isHuman && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-amber-300 font-bold text-lg">
                      +{winAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {ranking.cards.map((card, i) => (
                        <PlayingCardMini key={i} card={card} />
                      ))}
                    </div>
                    <span className="text-amber-200 text-sm font-medium">
                      {ranking.handName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Losers */}
          {loserRankings.length > 0 && (
            <div className="px-6 pb-4 space-y-2">
              <div className="border-t border-emerald-700 pt-3 mb-2">
                <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">
                  Other Hands
                </span>
              </div>
              {loserRankings.map((ranking) => {
                const player = getPlayer(ranking.seatIndex);
                return (
                  <div
                    key={ranking.seatIndex}
                    className="flex items-center justify-between bg-emerald-800/50 border border-emerald-700/50 rounded-lg px-4 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-200 font-medium text-sm">
                        {player?.name ?? `Seat ${ranking.seatIndex}`}
                      </span>
                      {player?.isHuman && (
                        <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-0.5">
                        {ranking.cards.map((card, i) => (
                          <PlayingCardMini key={i} card={card} />
                        ))}
                      </div>
                      <span className="text-emerald-400 text-xs min-w-[100px] text-right">
                        {ranking.handName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="px-6 pb-6 pt-2">
            <button
              onClick={onDismiss}
              className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-900 font-bold py-3 rounded-lg transition-colors duration-200 text-sm uppercase tracking-wider shadow-lg"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}