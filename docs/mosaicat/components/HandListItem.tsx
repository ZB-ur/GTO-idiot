import React from 'react';

export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

export type HandOutcome =
  | 'won_showdown'
  | 'lost_showdown'
  | 'won_fold'
  | 'folded_preflop'
  | 'folded_postflop'
  | 'split_pot';

export interface HandHistoryEntry {
  id: string;
  sessionId: string;
  handNumber: number;
  userPosition: Position;
  outcome: HandOutcome;
  netResult: number;
  createdAt: string;
}

export interface HandListItemProps {
  hand: HandHistoryEntry;
  onClick: () => void;
}

const OUTCOME_CONFIG: Record<HandOutcome, { label: string; classes: string }> = {
  won_showdown: {
    label: 'Won at Showdown',
    classes: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  },
  lost_showdown: {
    label: 'Lost at Showdown',
    classes: 'bg-red-400/15 text-red-400 border-red-400/30',
  },
  won_fold: {
    label: 'Won (No Showdown)',
    classes: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  },
  folded_preflop: {
    label: 'Folded Preflop',
    classes: 'bg-gray-400/15 text-gray-400 border-gray-400/30',
  },
  folded_postflop: {
    label: 'Folded Postflop',
    classes: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
  },
  split_pot: {
    label: 'Split Pot',
    classes: 'bg-sky-400/15 text-sky-400 border-sky-400/30',
  },
};

function formatChips(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(abs / 1_000).toFixed(1)}K`;
  return abs.toLocaleString();
}

export function HandListItem({ hand, onClick }: HandListItemProps) {
  const outcome = OUTCOME_CONFIG[hand.outcome];
  const isPositive = hand.netResult > 0;
  const isNegative = hand.netResult < 0;

  let chipColor = 'text-gray-50';
  let chipSign = '';
  if (isPositive) {
    chipColor = 'text-emerald-400';
    chipSign = '+';
  } else if (isNegative) {
    chipColor = 'text-red-400';
    chipSign = '-';
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all group text-left"
    >
      {/* Hand number */}
      <div className="flex flex-col items-center shrink-0">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Hand</span>
        <span className="text-lg font-bold text-gray-50 tabular-nums leading-tight">
          #{hand.handNumber}
        </span>
      </div>

      {/* Position badge */}
      <span className="shrink-0 px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-xs font-bold text-gray-300">
        {hand.userPosition}
      </span>

      {/* Outcome tag */}
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-lg border ${outcome.classes}`}>
        {outcome.label}
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Chip result */}
      <span className={`${chipColor} text-sm font-semibold tabular-nums inline-flex items-center gap-1`}>
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.2" />
          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <text x="10" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor">$</text>
        </svg>
        <span>{chipSign}{formatChips(Math.abs(hand.netResult))}</span>
      </span>

      {/* Chevron */}
      <svg
        className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  );
}