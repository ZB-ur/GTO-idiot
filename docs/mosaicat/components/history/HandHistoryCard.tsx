'use client';

import { motion } from 'framer-motion';
import PlayingCard from '@/components/game/PlayingCard';
import type { Card } from '@/engine/types';

type HandResult = 'won' | 'lost' | 'tied';

interface HandHistoryListItem {
  handId: string;
  handNumber: number;
  timestamp: string;
  heroHoleCards: [Card, Card];
  communityCards: Card[];
  result: HandResult;
  heroProfit: number;
  gtoDeviationScore: number;
}

interface HandHistoryCardProps {
  hand: HandHistoryListItem;
  onClick: (handId: string) => void;
}

function getGTOBadge(score: number): { label: string; className: string } {
  if (score >= 80) {
    return {
      label: 'GTO',
      className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
  }
  if (score >= 50) {
    return {
      label: 'OK',
      className: 'bg-amber-400/20 text-amber-400 border-amber-400/30',
    };
  }
  return {
    label: 'Leak',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
}

function formatProfit(profit: number): { text: string; className: string } {
  const sign = profit >= 0 ? '+' : '';
  const text = `${sign}${profit.toFixed(1)} BB`;
  const className =
    profit > 0 ? 'text-emerald-400' : profit < 0 ? 'text-red-400' : 'text-gray-400';
  return { text, className };
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getResultBadge(result: HandResult): { label: string; className: string } {
  switch (result) {
    case 'won':
      return { label: 'Won', className: 'text-emerald-400' };
    case 'lost':
      return { label: 'Lost', className: 'text-red-400' };
    case 'tied':
      return { label: 'Tied', className: 'text-gray-400' };
  }
}

const SUIT_SYMBOLS: Record<string, string> = {
  s: '\u2660',
  h: '\u2665',
  d: '\u2666',
  c: '\u2663',
};

function MiniBoard({ cards }: { cards: Card[] }) {
  if (cards.length === 0) return null;
  return (
    <div className="flex gap-0.5">
      {cards.map((card, i) => (
        <span
          key={i}
          className={`text-[10px] font-mono font-bold ${
            card.suit === 'h' || card.suit === 'd' ? 'text-red-400' : 'text-gray-300'
          }`}
        >
          {card.rank}{SUIT_SYMBOLS[card.suit]}
        </span>
      ))}
    </div>
  );
}

export function HandHistoryCard({ hand, onClick }: HandHistoryCardProps) {
  const pl = formatProfit(hand.heroProfit);
  const gto = getGTOBadge(hand.gtoDeviationScore);
  const result = getResultBadge(hand.result);

  return (
    <motion.button
      onClick={() => onClick(hand.handId)}
      className="w-full text-left rounded-xl border border-gray-700/60 bg-[#1e293b] hover:bg-gray-700/60 hover:border-gray-600/80 p-4 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.998 }}
      transition={{ duration: 0.1 }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: hand info + cards */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col shrink-0">
            <span className="text-sm font-bold text-gray-100">#{hand.handNumber}</span>
            <span className="text-[10px] text-gray-500">{formatTimestamp(hand.timestamp)}</span>
          </div>

          {/* Hole cards */}
          <div className="flex gap-1 shrink-0">
            <PlayingCard card={hand.heroHoleCards[0]} size="sm" />
            <PlayingCard card={hand.heroHoleCards[1]} size="sm" />
          </div>

          {/* Board */}
          {hand.communityCards.length > 0 && (
            <div className="hidden sm:block">
              <MiniBoard cards={hand.communityCards} />
            </div>
          )}
        </div>

        {/* Right: GTO badge + profit */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-center">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${gto.className}`}
            >
              {gto.label}
            </span>
            <span className="text-[10px] text-gray-500 mt-0.5">{hand.gtoDeviationScore}%</span>
          </div>

          <span className={`text-sm font-bold tabular-nums ${pl.className}`}>
            {pl.text}
          </span>

          <svg
            className="w-4 h-4 text-gray-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </motion.button>
  );
}