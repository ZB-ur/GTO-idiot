import React from 'react';

type HandOutcome =
  | 'showdown_win'
  | 'showdown_loss'
  | 'folded_preflop'
  | 'folded_postflop'
  | 'won_without_showdown'
  | 'split_pot';

interface OutcomeTagProps {
  outcome: HandOutcome;
}

const OUTCOME_CONFIG: Record<HandOutcome, { label: string; classes: string }> = {
  showdown_win: {
    label: 'Won at Showdown',
    classes: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  },
  showdown_loss: {
    label: 'Lost at Showdown',
    classes: 'bg-red-400/15 text-red-400 border-red-400/30',
  },
  folded_preflop: {
    label: 'Folded Preflop',
    classes: 'bg-gray-400/15 text-gray-400 border-gray-400/30',
  },
  folded_postflop: {
    label: 'Folded Postflop',
    classes: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
  },
  won_without_showdown: {
    label: 'Won (No Showdown)',
    classes: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  },
  split_pot: {
    label: 'Split Pot',
    classes: 'bg-sky-400/15 text-sky-400 border-sky-400/30',
  },
};

export const OutcomeTag: React.FC<OutcomeTagProps> = ({ outcome }) => {
  const config = OUTCOME_CONFIG[outcome];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-lg border ${config.classes}`}
    >
      {config.label}
    </span>
  );
};

export type { HandOutcome };