import React from 'react';

export type Suit = 's' | 'h' | 'd' | 'c';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface WinnerInfo {
  seat: number;
  playerName: string;
  amount: number;
  handRank?: string;
  bestHand?: Card[];
}

export interface PlayerHandResult {
  seat: number;
  playerName: string;
  holeCards?: Card[];
  handRank?: string | null;
  chipChange: number;
  finalStack: number;
}

export interface HandResult {
  handId: string;
  winners: WinnerInfo[];
  playerResults: PlayerHandResult[];
  isShowdown?: boolean;
  highlights?: { type: string; description: string }[];
  timestamp: string;
}

export interface HandResultModalProps {
  result: HandResult;
  open: boolean;
  onNextHand: () => void;
  onReplay: () => void;
  onEndSession: () => void;
}

const SUIT_SYMBOLS: Record<Suit, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<Suit, string> = {
  s: 'text-gray-900',
  h: 'text-red-600',
  d: 'text-red-600',
  c: 'text-gray-900',
};

const HandResultModal: React.FC<HandResultModalProps> = ({
  result,
  open,
  onNextHand,
  onReplay,
  onEndSession,
}) => {
  if (!open) return null;

  const winner = result.winners[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-amber-600/20 border-b border-gray-700 px-6 py-4 text-center">
          <div className="text-amber-400 text-sm font-medium">Hand Complete</div>
          <div className="text-white text-xl font-bold mt-1">
            {winner?.playerName} 胜出!
          </div>
          {winner?.handRank && (
            <div className="text-gray-300 text-sm mt-0.5">{winner.handRank}</div>
          )}
        </div>

        {/* Winner's cards */}
        {winner?.bestHand && (
          <div className="flex items-center justify-center gap-1.5 py-4 border-b border-gray-700">
            {winner.bestHand.map((card, i) => (
              <div
                key={i}
                className={`w-12 h-[68px] rounded-md bg-white border border-gray-300 shadow-sm
                  flex flex-col items-center justify-center ${SUIT_COLORS[card.suit]}`}
              >
                <span className="text-sm font-bold leading-none">{card.rank}</span>
                <span className="text-base leading-none">{SUIT_SYMBOLS[card.suit]}</span>
              </div>
            ))}
          </div>
        )}

        {/* Player results */}
        <div className="px-6 py-4 space-y-2">
          {result.playerResults.map((pr) => (
            <div
              key={pr.seat}
              className="flex items-center justify-between py-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">
                  {pr.playerName.charAt(0)}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{pr.playerName}</div>
                  {pr.handRank && (
                    <div className="text-gray-500 text-xs">{pr.handRank}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-sm font-bold tabular-nums ${
                    pr.chipChange > 0
                      ? 'text-emerald-400'
                      : pr.chipChange < 0
                        ? 'text-red-400'
                        : 'text-gray-400'
                  }`}
                >
                  {pr.chipChange > 0 ? '+' : ''}{pr.chipChange.toFixed(1)} BB
                </div>
                <div className="text-gray-500 text-xs tabular-nums">
                  {pr.finalStack.toFixed(1)} BB
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Highlights */}
        {result.highlights && result.highlights.length > 0 && (
          <div className="px-6 pb-3">
            {result.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-1.5 text-amber-400 text-xs">
                <span>★</span>
                <span>{h.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-gray-700 px-6 py-4 flex items-center gap-2">
          <button
            onClick={onEndSession}
            className="px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300 text-sm font-medium
              hover:bg-gray-700 transition-colors"
          >
            结束牌局
          </button>
          <button
            onClick={onReplay}
            className="px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300 text-sm font-medium
              hover:bg-gray-700 transition-colors flex-1"
          >
            查看复盘
          </button>
          <button
            onClick={onNextHand}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold
              hover:bg-emerald-500 transition-colors flex-1 shadow-lg shadow-emerald-600/20"
          >
            下一局
          </button>
        </div>
      </div>
    </div>
  );
};

export default HandResultModal;