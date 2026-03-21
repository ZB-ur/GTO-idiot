import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================
// Types (aligned with API spec schemas)
// ============================================================

export interface Card {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all_in';
export type DeviationSeverity = 'minor' | 'moderate' | 'severe';
export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface PlayerState {
  seat: number;
  name: string;
  position: Position;
  stack: number;
  hole_cards?: Card[] | null;
  is_active: boolean;
  is_all_in?: boolean;
  is_bot: boolean;
  current_bet?: number;
  total_invested?: number;
  last_action?: string | null;
}

export interface ReplayTableState {
  pot: number;
  community_cards: Card[];
  players: PlayerState[];
}

export interface GTOActionFrequency {
  action: ActionType;
  frequency: number;
  ev: number;
  bet_size?: string | null;
}

export interface Deviation {
  decision_point: number;
  street: Street;
  severity: DeviationSeverity;
  hero_action: { action: ActionType; amount?: number | null };
  gto_advice: GTOActionFrequency[];
  frequency_diff?: number;
  ev_loss: number;
  description: string;
}

export interface HandHistoryAction {
  sequence: number;
  seat: number;
  player_name: string;
  position: Position;
  street: Street;
  action: ActionType;
  amount?: number | null;
  pot_after?: number;
  is_hero?: boolean;
}

export interface ReplayStep {
  index: number;
  type: 'deal_hole_cards' | 'post_blinds' | 'player_action' | 'deal_community' | 'showdown';
  street: Street;
  table_state: ReplayTableState;
  action?: HandHistoryAction | null;
  is_hero_decision?: boolean;
  deviation?: Deviation | null;
}

export interface ReplayData {
  hand_id: string;
  steps: ReplayStep[];
  total_steps: number;
  street_indices?: {
    preflop?: number;
    flop?: number | null;
    turn?: number | null;
    river?: number | null;
  };
}

export interface DeviationAnalysis {
  hand_id: string;
  deviations: Deviation[];
  total_ev_loss: number;
  deviation_count?: {
    minor: number;
    moderate: number;
    severe: number;
  };
}

export interface ReplayViewerProps {
  replayData: ReplayData;
  deviations: DeviationAnalysis;
  onHandClick?: (handId: string) => void;
}

// ============================================================
// Constants & Helpers
// ============================================================

const STREETS: Street[] = ['preflop', 'flop', 'turn', 'river'];

const STREET_LABELS: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All-In',
};

const SEVERITY_CONFIG: Record<DeviationSeverity, { color: string; bg: string; border: string; dot: string; label: string }> = {
  minor: {
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
    dot: 'bg-green-400',
    label: 'Minor',
  },
  moderate: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    dot: 'bg-yellow-400',
    label: 'Moderate',
  },
  severe: {
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    dot: 'bg-red-400',
    label: 'Severe',
  },
};

const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2];

const suitSymbol = (s: string) => {
  const map: Record<string, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
  return map[s] ?? s;
};

const suitColor = (s: string) =>
  s === 'hearts' || s === 'diamonds' ? 'text-red-500' : 'text-gray-50';

const formatBB = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)} BB`;

const formatAmount = (n: number | null | undefined) =>
  n != null ? `${n.toFixed(1)} BB` : '';

// ============================================================
// Sub-components
// ============================================================

/** Inline playing card */
const CardView: React.FC<{ card: Card; size?: 'sm' | 'md' }> = ({ card, size = 'md' }) => {
  const px = size === 'sm' ? 'px-1 py-0.5 text-[10px]' : 'px-1.5 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center ${px} bg-white rounded-md font-mono font-bold shadow-sm`}>
      <span className="text-gray-900">{card.rank}</span>
      <span className={suitColor(card.suit)}>{suitSymbol(card.suit)}</span>
    </span>
  );
};

/** Street timeline with clickable segments */
const StreetTimeline: React.FC<{
  steps: ReplayStep[];
  currentIndex: number;
  streetIndices: ReplayData['street_indices'];
  deviations: Deviation[];
  onStepClick: (index: number) => void;
}> = ({ steps, currentIndex, streetIndices, deviations, onStepClick }) => {
  const currentStreet = steps[currentIndex]?.street;

  const deviationByStep = useMemo(() => {
    const map = new Map<number, Deviation>();
    deviations.forEach((d) => {
      const step = steps.find(
        (s) => s.is_hero_decision && s.deviation?.decision_point === d.decision_point
      );
      if (step) map.set(step.index, d);
    });
    return map;
  }, [deviations, steps]);

  return (
    <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2">
      {STREETS.map((street) => {
        const idx = streetIndices?.[street];
        if (idx == null && street !== 'preflop') return null;
        const startIdx = idx ?? 0;
        const isActive = street === currentStreet;
        const isPast =
          STREETS.indexOf(street) < STREETS.indexOf(currentStreet);

        // Check if this street has deviations
        const streetDeviations = deviations.filter((d) => d.street === street);
        const worstSeverity = streetDeviations.reduce<DeviationSeverity | null>(
          (worst, d) => {
            if (!worst) return d.severity;
            const order: DeviationSeverity[] = ['minor', 'moderate', 'severe'];
            return order.indexOf(d.severity) > order.indexOf(worst) ? d.severity : worst;
          },
          null
        );

        return (
          <React.Fragment key={street}>
            {street !== 'preflop' && (
              <div className={`w-6 h-px ${isPast || isActive ? 'bg-emerald-500' : 'bg-gray-700'}`} />
            )}
            <button
              onClick={() => onStepClick(startIdx)}
              className={`
                relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${isActive
                  ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40'
                  : isPast
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-750'
                  : 'bg-gray-800/50 text-gray-500 hover:bg-gray-800'
                }
              `}
            >
              {STREET_LABELS[street]}
              {worstSeverity && (
                <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_CONFIG[worstSeverity].dot}`} />
              )}
            </button>
          </React.Fragment>
        );
      })}

      {/* Step counter */}
      <span className="ml-auto text-xs text-gray-500 font-mono tabular-nums">
        {currentIndex + 1}/{steps.length}
      </span>
    </div>
  );
};

/** Playback controls */
const ReplayControls: React.FC<{
  currentIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
}> = ({
  currentIndex,
  totalSteps,
  isPlaying,
  speed,
  onPrev,
  onNext,
  onTogglePlay,
  onSpeedChange,
  onReset,
}) => {
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= totalSteps - 1;
  const progress = totalSteps > 1 ? (currentIndex / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        {/* Left: transport controls */}
        <div className="flex items-center gap-1">
          {/* Reset */}
          <button
            onClick={onReset}
            disabled={isFirst}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-50 disabled:text-gray-600 disabled:hover:bg-transparent transition-colors"
            aria-label="Reset"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>

          {/* Prev */}
          <button
            onClick={onPrev}
            disabled={isFirst || isPlaying}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-50 disabled:text-gray-600 disabled:hover:bg-transparent transition-colors"
            aria-label="Previous step"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            disabled={isLast && !isPlaying}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 text-gray-950 hover:bg-emerald-400 disabled:bg-gray-700 disabled:text-gray-500 transition-colors shadow-lg shadow-emerald-500/20"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            disabled={isLast || isPlaying}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-50 disabled:text-gray-600 disabled:hover:bg-transparent transition-colors"
            aria-label="Next step"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>

        {/* Right: speed selector */}
        <div className="flex items-center gap-1">
          {PLAYBACK_SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                speed === s
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/** Deviation detail panel */
const DeviationDetail: React.FC<{
  deviation: Deviation | null;
  stepIndex: number;
}> = ({ deviation, stepIndex }) => {
  if (!deviation) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-semibold text-gray-50">GTO Analysis</span>
        </div>
        <p className="text-sm text-gray-500">
          No deviation at this step. Your play aligns with GTO strategy.
        </p>
      </div>
    );
  }

  const config = SEVERITY_CONFIG[deviation.severity];

  return (
    <div className={`bg-gray-900 border ${config.border} rounded-xl p-4 space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className="text-sm font-semibold text-gray-50">GTO Deviation</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        </div>
        <span className="text-sm font-mono text-red-400">
          {formatBB(-deviation.ev_loss)} EV
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 leading-relaxed">
        {deviation.description}
      </p>

      {/* Your action vs GTO */}
      <div className="grid grid-cols-2 gap-3">
        {/* Hero action */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Your Action</span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-50">
              {ACTION_LABELS[deviation.hero_action.action]}
            </span>
            {deviation.hero_action.amount != null && (
              <span className="text-xs text-gray-400">
                {formatAmount(deviation.hero_action.amount)}
              </span>
            )}
          </div>
        </div>

        {/* GTO recommended */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">GTO Optimal</span>
          <div className="mt-1">
            {deviation.gto_advice
              .sort((a, b) => b.frequency - a.frequency)
              .slice(0, 2)
              .map((adv) => (
                <div key={adv.action} className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-emerald-400">
                    {ACTION_LABELS[adv.action]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(adv.frequency * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* GTO frequency breakdown */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          Action Frequencies
        </span>
        {deviation.gto_advice.map((adv) => (
          <div key={adv.action} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-14 shrink-0">
              {ACTION_LABELS[adv.action]}
            </span>
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500/60 rounded-full"
                style={{ width: `${adv.frequency * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 font-mono w-10 text-right">
              {(adv.frequency * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-gray-600 font-mono w-14 text-right">
              {formatBB(adv.ev)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Mini poker table rendering (simplified for replay context) */
const PokerTableMini: React.FC<{
  tableState: ReplayTableState;
  dealerSeat?: number;
  currentAction?: HandHistoryAction | null;
}> = ({ tableState, dealerSeat, currentAction }) => {
  // 6-seat elliptical positions (CSS percentage-based)
  const seatPositions = [
    { top: '78%', left: '20%' },   // Seat 0 — bottom-left (hero)
    { top: '35%', left: '2%' },    // Seat 1 — mid-left
    { top: '5%', left: '20%' },    // Seat 2 — top-left
    { top: '5%', left: '68%' },    // Seat 3 — top-right
    { top: '35%', left: '86%' },   // Seat 4 — mid-right
    { top: '78%', left: '68%' },   // Seat 5 — bottom-right
  ];

  return (
    <div className="relative w-full" style={{ paddingBottom: '56%' }}>
      {/* Felt background */}
      <div className="absolute inset-0 bg-emerald-900 rounded-[50%] border-4 border-emerald-800 shadow-inner"
        style={{ top: '12%', bottom: '12%', left: '5%', right: '5%' }}
      />

      {/* Community cards */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1">
        {tableState.community_cards.length > 0 ? (
          tableState.community_cards.map((card, i) => (
            <CardView key={i} card={card} size="sm" />
          ))
        ) : (
          <span className="text-xs text-emerald-700/50 font-medium">No cards</span>
        )}
      </div>

      {/* Pot */}
      {tableState.pot > 0 && (
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2">
          <div className="bg-gray-950/80 backdrop-blur-sm rounded-lg px-2 py-0.5 border border-gray-700/50">
            <span className="text-[10px] text-yellow-400 font-bold">
              Pot: {tableState.pot.toFixed(1)} BB
            </span>
          </div>
        </div>
      )}

      {/* Player seats */}
      {tableState.players.map((player) => {
        const pos = seatPositions[player.seat] ?? seatPositions[0];
        const isActing = currentAction?.seat === player.seat;
        const isHero = !player.is_bot;

        return (
          <div
            key={player.seat}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ top: pos.top, left: pos.left }}
          >
            <div
              className={`
                flex flex-col items-center gap-0.5 p-1.5 rounded-lg min-w-[72px]
                ${isActing ? 'ring-2 ring-emerald-400 bg-gray-800/90' : 'bg-gray-800/70'}
                ${!player.is_active ? 'opacity-40' : ''}
              `}
            >
              {/* Cards */}
              {player.hole_cards && player.hole_cards.length > 0 && (
                <div className="flex gap-0.5 mb-0.5">
                  {player.hole_cards.map((c, i) => (
                    <CardView key={i} card={c} size="sm" />
                  ))}
                </div>
              )}
              {/* Name + position */}
              <span className={`text-[10px] font-semibold truncate max-w-[68px] ${isHero ? 'text-emerald-400' : 'text-gray-300'}`}>
                {player.name}
              </span>
              <span className="text-[9px] text-gray-500">{player.position}</span>
              {/* Stack */}
              <span className="text-[10px] text-gray-400 font-mono">
                {player.stack.toFixed(1)}
              </span>
              {/* Current bet */}
              {player.current_bet != null && player.current_bet > 0 && (
                <span className="text-[9px] text-yellow-400 font-mono">
                  Bet: {player.current_bet.toFixed(1)}
                </span>
              )}
              {/* Last action badge */}
              {player.last_action && (
                <span className="text-[8px] bg-gray-700 text-gray-300 px-1 rounded">
                  {player.last_action}
                </span>
              )}
            </div>
            {/* Dealer button */}
            {dealerSeat === player.seat && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center text-[8px] font-black shadow">
                D
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// Main Component
// ============================================================

export const ReplayViewer: React.FC<ReplayViewerProps> = ({
  replayData,
  deviations,
  onHandClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const { steps, street_indices } = replayData;
  const currentStep = steps[currentIndex];
  const totalSteps = steps.length;

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, totalSteps]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && !isPlaying) {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight' && !isPlaying) {
        setCurrentIndex((prev) => Math.min(totalSteps - 1, prev + 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlaying, totalSteps]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(totalSteps - 1, prev + 1));
  }, [totalSteps]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSpeedChange = useCallback((s: number) => {
    setSpeed(s);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const handleStepClick = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  }, []);

  // Current step's deviation (if any)
  const currentDeviation = useMemo(() => {
    if (!currentStep?.is_hero_decision) return null;
    return currentStep.deviation ?? null;
  }, [currentStep]);

  // Deviation summary stats
  const deviationStats = useMemo(() => {
    const counts = deviations.deviation_count ?? { minor: 0, moderate: 0, severe: 0 };
    return {
      ...counts,
      total: counts.minor + counts.moderate + counts.severe,
      totalEVLoss: deviations.total_ev_loss,
    };
  }, [deviations]);

  // Action description for current step
  const actionDescription = useMemo(() => {
    if (!currentStep?.action) return null;
    const a = currentStep.action;
    const label = ACTION_LABELS[a.action] ?? a.action;
    const amount = a.amount != null ? ` ${a.amount.toFixed(1)} BB` : '';
    return `${a.player_name} (${a.position}): ${label}${amount}`;
  }, [currentStep]);

  return (
    <div className="bg-gray-950 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-gray-50">Hand Replay</h2>
          <span className="text-xs text-gray-500 font-mono">#{replayData.hand_id.slice(0, 8)}</span>
        </div>

        {/* Deviation summary badges */}
        <div className="flex items-center gap-2">
          {deviationStats.severe > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-400/10 text-red-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {deviationStats.severe} severe
            </span>
          )}
          {deviationStats.moderate > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-400/10 text-yellow-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              {deviationStats.moderate} moderate
            </span>
          )}
          {deviationStats.minor > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-400/10 text-green-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              {deviationStats.minor} minor
            </span>
          )}
          <span className="text-xs font-mono text-red-400">
            Total: {formatBB(-deviationStats.totalEVLoss)} EV
          </span>
        </div>
      </div>

      {/* Body — two-column layout */}
      <div className="flex">
        {/* Left: Table + Controls */}
        <div className="flex-1 p-5 space-y-4 min-w-0">
          {/* Street Timeline */}
          <StreetTimeline
            steps={steps}
            currentIndex={currentIndex}
            streetIndices={street_indices}
            deviations={deviations.deviations}
            onStepClick={handleStepClick}
          />

          {/* Poker Table */}
          {currentStep && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <PokerTableMini
                tableState={currentStep.table_state}
                currentAction={currentStep.action}
              />
            </div>
          )}

          {/* Action annotation bar */}
          {actionDescription && (
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </span>
              <span className="text-sm text-gray-50 font-medium">
                {actionDescription}
              </span>
              {currentStep?.is_hero_decision && (
                <span className="ml-auto px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                  Your Decision
                </span>
              )}
            </div>
          )}

          {/* Replay Controls */}
          <ReplayControls
            currentIndex={currentIndex}
            totalSteps={totalSteps}
            isPlaying={isPlaying}
            speed={speed}
            onPrev={handlePrev}
            onNext={handleNext}
            onTogglePlay={handleTogglePlay}
            onSpeedChange={handleSpeedChange}
            onReset={handleReset}
          />

          {/* Keyboard hint */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-gray-600">
            <span><kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-500 font-mono">←</kbd> Prev</span>
            <span><kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-500 font-mono">→</kbd> Next</span>
            <span><kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-500 font-mono">Space</kbd> Play/Pause</span>
          </div>
        </div>

        {/* Right: Deviation Detail Panel */}
        <div className="w-80 shrink-0 border-l border-gray-800 p-4 space-y-4 overflow-y-auto max-h-[720px]">
          <h3 className="text-sm font-bold text-gray-50">Deviation Analysis</h3>

          {/* Current step deviation */}
          <DeviationDetail deviation={currentDeviation} stepIndex={currentIndex} />

          {/* All deviations list */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              All Deviations ({deviationStats.total})
            </h4>
            {deviations.deviations.length === 0 ? (
              <p className="text-xs text-gray-600">No GTO deviations in this hand. Perfect play!</p>
            ) : (
              deviations.deviations.map((d, i) => {
                const cfg = SEVERITY_CONFIG[d.severity];
                return (
                  <button
                    key={i}
                    onClick={() => {
                      const step = steps.find(
                        (s) => s.is_hero_decision && s.deviation?.decision_point === d.decision_point
                      );
                      if (step) handleStepClick(step.index);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-colors hover:bg-gray-800/50 ${
                      currentDeviation?.decision_point === d.decision_point
                        ? `${cfg.border} ${cfg.bg}`
                        : 'border-gray-800 bg-gray-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        <span className="text-xs font-semibold text-gray-300">
                          {STREET_LABELS[d.street]}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-red-400">
                        {formatBB(-d.ev_loss)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {d.description}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplayViewer;