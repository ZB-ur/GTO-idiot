import React from 'react';

type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'allIn';
type DeviationSeverity = 'good' | 'minor' | 'mistake' | 'blunder';

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface GTOAnnotationData {
  stepIndex: number;
  street: string;
  position: string;
  holeCards?: Card[];
  communityCards?: Card[];
  playerAction: {
    actionType: ActionType;
    amount?: number;
  };
  gtoDistribution: {
    raise: number;
    call: number;
    fold: number;
  };
  severity: DeviationSeverity;
  evLossBbPer100?: number;
  explanation?: string;
  hasReferenceData?: boolean;
}

interface GTOAnnotationProps {
  annotation: GTOAnnotationData;
  className?: string;
}

const SEVERITY_CONFIG: Record<
  DeviationSeverity,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  good: {
    label: 'Good',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    icon: '✓',
  },
  minor: {
    label: 'Minor',
    color: 'text-amber-300',
    bg: 'bg-amber-300/10',
    border: 'border-amber-300/30',
    icon: '~',
  },
  mistake: {
    label: 'Mistake',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: '!',
  },
  blunder: {
    label: 'Blunder',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: '✗',
  },
};

const SUIT_SYMBOLS: Record<string, { char: string; color: string }> = {
  s: { char: '♠', color: 'text-gray-300' },
  h: { char: '♥', color: 'text-red-400' },
  d: { char: '♦', color: 'text-sky-400' },
  c: { char: '♣', color: 'text-emerald-400' },
};

const ACTION_COLORS: Record<string, string> = {
  raise: 'bg-amber-500',
  call: 'bg-emerald-500',
  fold: 'bg-gray-500',
};

function CardDisplay({ card }: { card: Card }) {
  const suit = SUIT_SYMBOLS[card.suit];
  return (
    <span className="inline-flex items-center bg-white rounded px-1 py-0.5 text-xs font-bold text-gray-900">
      {card.rank}
      <span className={suit.color}>{suit.char}</span>
    </span>
  );
}

function ActionDistributionBar({
  distribution,
}: {
  distribution: { raise: number; call: number; fold: number };
}) {
  const segments = [
    { key: 'raise', value: distribution.raise, color: 'bg-amber-500', label: 'Raise' },
    { key: 'call', value: distribution.call, color: 'bg-emerald-500', label: 'Call' },
    { key: 'fold', value: distribution.fold, color: 'bg-gray-500', label: 'Fold' },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-800">
        {segments.map((seg) => (
          <div
            key={seg.key}
            className={`${seg.color} transition-all duration-300`}
            style={{ width: `${seg.value * 100}%` }}
          />
        ))}
      </div>
      <div className="flex items-center gap-4">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${seg.color}`} />
            <span className="text-xs text-gray-400">
              {seg.label} {Math.round(seg.value * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeviationBadge({ severity }: { severity: DeviationSeverity }) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.bg} ${config.color} ${config.border}`}
    >
      <span className="text-sm">{config.icon}</span>
      {config.label}
    </span>
  );
}

export function GTOAnnotation({ annotation, className = '' }: GTOAnnotationProps) {
  const severityConfig = SEVERITY_CONFIG[annotation.severity];
  const actionLabel =
    annotation.playerAction.actionType === 'raise' && annotation.playerAction.amount
      ? `Raise to ${annotation.playerAction.amount}`
      : annotation.playerAction.actionType.charAt(0).toUpperCase() +
        annotation.playerAction.actionType.slice(1);

  return (
    <div
      className={`bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-4 shadow-lg shadow-black/40 ${className}`}
    >
      {/* Header: Position, Street, Cards, Severity Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-800 px-2 py-1 rounded-lg">
            {annotation.position}
          </span>
          <span className="text-xs text-gray-500 capitalize">{annotation.street}</span>
          {annotation.holeCards && (
            <div className="flex items-center gap-1">
              {annotation.holeCards.map((card, i) => (
                <CardDisplay key={i} card={card} />
              ))}
            </div>
          )}
        </div>
        <DeviationBadge severity={annotation.severity} />
      </div>

      {/* Player Action */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Your action:</span>
        <span
          className={`px-3 py-1 rounded-lg text-sm font-semibold ${
            ACTION_COLORS[annotation.playerAction.actionType] ?? 'bg-gray-700'
          } ${annotation.playerAction.actionType === 'raise' ? 'text-gray-950' : 'text-white'}`}
        >
          {actionLabel}
        </span>
        {annotation.evLossBbPer100 != null && annotation.severity !== 'good' && (
          <span className={`text-xs font-medium ${severityConfig.color}`}>
            −{annotation.evLossBbPer100.toFixed(1)} EV bb/100
          </span>
        )}
      </div>

      {/* GTO Distribution Bar */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">GTO Action Distribution</p>
        <ActionDistributionBar distribution={annotation.gtoDistribution} />
      </div>

      {/* Explanation */}
      {annotation.explanation && (
        <div className="bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-700/50">
          <p className="text-sm text-gray-300 leading-relaxed">{annotation.explanation}</p>
        </div>
      )}

      {/* GTO Reference Label */}
      {annotation.hasReferenceData && (
        <p className="text-[10px] text-gray-600 uppercase tracking-wider">
          GTO Reference (simplified) — not a solver-grade solution
        </p>
      )}
    </div>
  );
}