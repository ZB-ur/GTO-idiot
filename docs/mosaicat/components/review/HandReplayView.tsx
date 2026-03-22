import React, { useState, useEffect, useCallback } from 'react';

// Types
interface Card {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

interface ReviewAction {
  playerId: string;
  playerName: string;
  position: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
  actionType: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';
  amount?: number;
  isHumanAction: boolean;
  gtoComparison?: {
    userAction: { actionType: string; amount?: number };
    gtoAction: { actionType: string; amount?: number; sizing?: string };
    deviationLevel: 'conforming' | 'minor' | 'major';
    evLoss: number;
    explanation?: string;
  };
}

interface ReviewStreet {
  street: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  communityCards?: Card[];
  potAtStart?: number;
  actions: ReviewAction[];
}

interface HandReview {
  handId: string;
  handNumber: number;
  streets: ReviewStreet[];
  overallConformance: 'conforming' | 'minor_deviation' | 'major_deviation';
  totalEvLoss: number;
  humanPosition?: string;
  humanHoleCards?: Card[];
}

interface HandSummary {
  handId: string;
  handNumber: number;
  humanPosition: string;
  humanHoleCards?: Card[];
  humanResult: number;
  gtoConformance: 'conforming' | 'minor_deviation' | 'major_deviation' | 'mixed';
}

interface HandReplayViewProps {
  sessionId: string;
  handId: string;
}

const STREET_ORDER = ['preflop', 'flop', 'turn', 'river', 'showdown'] as const;
const STREET_LABELS: Record<string, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLORS: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-blue-500',
  clubs: 'text-green-700',
  spades: 'text-gray-900',
};

const POSITION_ANGLES: Record<string, number> = {
  BTN: 0,
  SB: 60,
  BB: 120,
  UTG: 180,
  HJ: 240,
  CO: 300,
};

function CardDisplay({ card, size = 'md' }: { card: Card; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-7 h-10 text-xs',
    md: 'w-9 h-13 text-sm',
    lg: 'w-11 h-16 text-base',
  };
  return (
    <div
      className={`${sizeClasses[size]} bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col items-center justify-center font-bold`}
    >
      <span className={SUIT_COLORS[card.suit]}>{card.rank}</span>
      <span className={`${SUIT_COLORS[card.suit]} -mt-1`}>{SUIT_SYMBOLS[card.suit]}</span>
    </div>
  );
}

function DeviationBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    conforming: 'bg-green-100 text-green-700 border-green-200',
    minor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    minor_deviation: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    major: 'bg-red-100 text-red-700 border-red-200',
    major_deviation: 'bg-red-100 text-red-700 border-red-200',
  };
  const labels: Record<string, string> = {
    conforming: 'GTO ✓',
    minor: 'Minor',
    minor_deviation: 'Minor',
    major: 'Major',
    major_deviation: 'Major',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styles[level] || styles.conforming}`}>
      {labels[level] || level}
    </span>
  );
}

// ── Street Stepper ──
function StreetStepper({
  streets,
  activeStreet,
  onSelect,
}: {
  streets: ReviewStreet[];
  activeStreet: number;
  onSelect: (i: number) => void;
}) {
  const availableStreets = streets.map((s) => s.street);

  return (
    <div className="flex items-center gap-1">
      {STREET_ORDER.filter((s) => availableStreets.includes(s)).map((street, idx) => {
        const streetData = streets.find((s) => s.street === street);
        const hasDeviation = streetData?.actions.some(
          (a) => a.gtoComparison && a.gtoComparison.deviationLevel !== 'conforming'
        );
        const isActive = idx === activeStreet;

        return (
          <React.Fragment key={street}>
            {idx > 0 && <div className="w-6 h-px bg-gray-300" />}
            <button
              onClick={() => onSelect(idx)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {STREET_LABELS[street]}
              {hasDeviation && !isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Action Timeline ──
function ActionTimeline({
  actions,
  activeAction,
  onSelect,
}: {
  actions: ReviewAction[];
  activeAction: number;
  onSelect: (i: number) => void;
}) {
  const actionLabels: Record<string, string> = {
    fold: 'Fold',
    check: 'Check',
    call: 'Call',
    bet: 'Bet',
    raise: 'Raise',
    all_in: 'All-in',
  };

  return (
    <div className="space-y-1">
      {actions.map((action, idx) => {
        const isActive = idx === activeAction;
        const deviation = action.gtoComparison;

        return (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-3 ${
              isActive
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50 border border-transparent'
            } ${action.isHumanAction ? 'font-medium' : ''}`}
          >
            <span
              className={`w-8 text-xs font-mono ${
                action.isHumanAction ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              {action.position}
            </span>
            <span className="flex-1 text-gray-900">
              {action.playerName}{' '}
              <span className="text-gray-500">
                {actionLabels[action.actionType]}
                {action.amount != null ? ` ${action.amount}BB` : ''}
              </span>
            </span>
            {deviation && <DeviationBadge level={deviation.deviationLevel} />}
            {deviation && deviation.evLoss > 0 && (
              <span className="text-xs text-red-500 font-medium">
                -{deviation.evLoss.toFixed(1)}BB
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Mini Table ──
function MiniTable({
  communityCards,
  pot,
  humanPosition,
  humanCards,
  activePosition,
}: {
  communityCards: Card[];
  pot: number;
  humanPosition?: string;
  humanCards?: Card[];
  activePosition?: string;
}) {
  const positions = ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'];
  const radius = 90;
  const centerX = 130;
  const centerY = 100;

  return (
    <div className="relative w-[260px] h-[200px] mx-auto">
      {/* Table felt */}
      <div className="absolute inset-4 bg-emerald-800 rounded-full border-4 border-emerald-900 shadow-inner" />

      {/* Community cards */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-0.5">
        {communityCards.map((card, i) => (
          <CardDisplay key={i} card={card} size="sm" />
        ))}
      </div>

      {/* Pot */}
      <div className="absolute top-[58%] left-1/2 -translate-x-1/2 text-emerald-200 text-xs font-medium">
        Pot: {pot}BB
      </div>

      {/* Player positions */}
      {positions.map((pos) => {
        const angle = ((POSITION_ANGLES[pos] - 90) * Math.PI) / 180;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const isHuman = pos === humanPosition;
        const isActive = pos === activePosition;

        return (
          <div
            key={pos}
            className="absolute flex flex-col items-center"
            style={{ left: x - 16, top: y - 16 }}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                isActive
                  ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-300'
                  : isHuman
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {pos}
            </div>
            {isHuman && humanCards && (
              <div className="flex gap-0.5 mt-0.5">
                {humanCards.map((c, i) => (
                  <CardDisplay key={i} card={c} size="sm" />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Replay Controls ──
function ReplayControls({
  canPrev,
  canNext,
  isPlaying,
  onPrev,
  onNext,
  onPlayPause,
  onReset,
  speed,
  onSpeedChange,
}: {
  canPrev: boolean;
  canNext: boolean;
  isPlaying: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (s: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={onReset}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"
        title="Reset"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
        </svg>
      </button>
      <button
        onClick={onPrev}
        disabled={!canPrev}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={onPlayPause}
        className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div className="ml-3 flex items-center gap-1 text-xs text-gray-500">
        <span>Speed:</span>
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-1.5 py-0.5 rounded ${
              speed === s ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Hand List ──
function HandList({
  hands,
  activeHandId,
  onSelect,
}: {
  hands: HandSummary[];
  activeHandId: string;
  onSelect: (id: string) => void;
}) {
  const conformanceColors: Record<string, string> = {
    conforming: 'bg-green-500',
    minor_deviation: 'bg-yellow-500',
    major_deviation: 'bg-red-500',
    mixed: 'bg-orange-500',
  };

  return (
    <div className="space-y-1 max-h-[400px] overflow-y-auto">
      {hands.map((hand) => (
        <button
          key={hand.handId}
          onClick={() => onSelect(hand.handId)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
            hand.handId === activeHandId
              ? 'bg-blue-50 border border-blue-200'
              : 'hover:bg-gray-50 border border-transparent'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${conformanceColors[hand.gtoConformance]}`} />
          <span className="font-mono text-gray-400 w-6">#{hand.handNumber}</span>
          <span className="text-xs text-gray-500 w-8">{hand.humanPosition}</span>
          <span className="flex-1" />
          <span
            className={`text-xs font-medium ${
              hand.humanResult >= 0 ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {hand.humanResult >= 0 ? '+' : ''}
            {hand.humanResult.toFixed(1)}BB
          </span>
        </button>
      ))}
    </div>
  );
}

// ── GTO Detail Panel ──
function GTODetailPanel({ comparison }: { comparison: ReviewAction['gtoComparison'] }) {
  if (!comparison) return null;

  const actionLabels: Record<string, string> = {
    fold: 'Fold', check: 'Check', call: 'Call',
    bet: 'Bet', raise: 'Raise', all_in: 'All-in',
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">GTO Analysis</h4>
        <DeviationBadge level={comparison.deviationLevel} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">Your Action</div>
          <div className="text-sm font-medium text-gray-900">
            {actionLabels[comparison.userAction.actionType]}
            {comparison.userAction.amount != null && ` ${comparison.userAction.amount}BB`}
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="text-xs text-gray-400 mb-1">GTO Optimal</div>
          <div className="text-sm font-medium text-blue-600">
            {actionLabels[comparison.gtoAction.actionType]}
            {comparison.gtoAction.sizing && ` ${comparison.gtoAction.sizing}`}
          </div>
        </div>
      </div>
      {comparison.evLoss > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">EV Loss:</span>
          <span className="font-semibold text-red-500">-{comparison.evLoss.toFixed(2)}BB</span>
        </div>
      )}
      {comparison.explanation && (
        <p className="text-xs text-gray-500 leading-relaxed">{comparison.explanation}</p>
      )}
    </div>
  );
}

// ── Main Component ──
export default function HandReplayView({ sessionId, handId }: HandReplayViewProps) {
  const [review, setReview] = useState<HandReview | null>(null);
  const [hands, setHands] = useState<HandSummary[]>([]);
  const [activeHandId, setActiveHandId] = useState(handId);
  const [activeStreetIdx, setActiveStreetIdx] = useState(0);
  const [activeActionIdx, setActiveActionIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch hand review
  useEffect(() => {
    async function fetchReview() {
      setLoading(true);
      try {
        const res = await fetch(`/sessions/${sessionId}/hands/${activeHandId}/review`);
        const data: HandReview = await res.json();
        setReview(data);
        setActiveStreetIdx(0);
        setActiveActionIdx(0);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchReview();
  }, [sessionId, activeHandId]);

  // Fetch hand list
  useEffect(() => {
    async function fetchHands() {
      try {
        const res = await fetch(`/sessions/${sessionId}/hands?limit=50`);
        const data = await res.json();
        setHands(data.hands);
      } catch {
        // handle error
      }
    }
    fetchHands();
  }, [sessionId]);

  // Compute cumulative community cards up to current street
  const getCommunityCardsUpTo = useCallback((): Card[] => {
    if (!review) return [];
    const cards: Card[] = [];
    for (let i = 0; i <= activeStreetIdx; i++) {
      const street = review.streets[i];
      if (street?.communityCards) cards.push(...street.communityCards);
    }
    return cards;
  }, [review, activeStreetIdx]);

  // Compute pot at current point
  const getCurrentPot = useCallback((): number => {
    if (!review) return 0;
    const street = review.streets[activeStreetIdx];
    return street?.potAtStart ?? 0;
  }, [review, activeStreetIdx]);

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || !review) return;

    const interval = setInterval(() => {
      const currentStreet = review.streets[activeStreetIdx];
      if (activeActionIdx < currentStreet.actions.length - 1) {
        setActiveActionIdx((p) => p + 1);
      } else if (activeStreetIdx < review.streets.length - 1) {
        setActiveStreetIdx((p) => p + 1);
        setActiveActionIdx(0);
      } else {
        setIsPlaying(false);
      }
    }, 1500 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, review, activeStreetIdx, activeActionIdx, speed]);

  const handlePrev = () => {
    if (activeActionIdx > 0) {
      setActiveActionIdx((p) => p - 1);
    } else if (activeStreetIdx > 0) {
      const prevIdx = activeStreetIdx - 1;
      setActiveStreetIdx(prevIdx);
      if (review) {
        setActiveActionIdx(review.streets[prevIdx].actions.length - 1);
      }
    }
  };

  const handleNext = () => {
    if (!review) return;
    const currentStreet = review.streets[activeStreetIdx];
    if (activeActionIdx < currentStreet.actions.length - 1) {
      setActiveActionIdx((p) => p + 1);
    } else if (activeStreetIdx < review.streets.length - 1) {
      setActiveStreetIdx((p) => p + 1);
      setActiveActionIdx(0);
    }
  };

  const canPrev = activeStreetIdx > 0 || activeActionIdx > 0;
  const canNext =
    review != null &&
    (activeStreetIdx < review.streets.length - 1 ||
      activeActionIdx < review.streets[activeStreetIdx].actions.length - 1);

  const currentStreet = review?.streets[activeStreetIdx];
  const currentAction = currentStreet?.actions[activeActionIdx];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading replay…
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Hand not found
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hand #{review.handNumber} Replay
          </h1>
          <div className="flex items-center gap-3 mt-1">
            {review.humanPosition && (
              <span className="text-sm text-gray-500">Position: {review.humanPosition}</span>
            )}
            <DeviationBadge level={review.overallConformance} />
            {review.totalEvLoss > 0 && (
              <span className="text-sm text-red-500 font-medium">
                Total EV Loss: -{review.totalEvLoss.toFixed(1)}BB
              </span>
            )}
          </div>
        </div>
        {review.humanHoleCards && (
          <div className="flex gap-1">
            {review.humanHoleCards.map((c, i) => (
              <CardDisplay key={i} card={c} size="lg" />
            ))}
          </div>
        )}
      </div>

      {/* Street Stepper */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <StreetStepper
          streets={review.streets}
          activeStreet={activeStreetIdx}
          onSelect={(i) => {
            setActiveStreetIdx(i);
            setActiveActionIdx(0);
          }}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left: Hand list */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Hands</h3>
          <HandList
            hands={hands}
            activeHandId={activeHandId}
            onSelect={setActiveHandId}
          />
        </div>

        {/* Center: Mini table + controls */}
        <div className="col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <MiniTable
              communityCards={getCommunityCardsUpTo()}
              pot={getCurrentPot()}
              humanPosition={review.humanPosition}
              humanCards={review.humanHoleCards}
              activePosition={currentAction?.position}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
            <ReplayControls
              canPrev={canPrev}
              canNext={canNext}
              isPlaying={isPlaying}
              onPrev={handlePrev}
              onNext={handleNext}
              onPlayPause={() => setIsPlaying((p) => !p)}
              onReset={() => {
                setActiveStreetIdx(0);
                setActiveActionIdx(0);
                setIsPlaying(false);
              }}
              speed={speed}
              onSpeedChange={setSpeed}
            />
          </div>

          {/* GTO Detail */}
          {currentAction?.gtoComparison && (
            <GTODetailPanel comparison={currentAction.gtoComparison} />
          )}
        </div>

        {/* Right: Action timeline */}
        <div className="col-span-4 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {currentStreet ? STREET_LABELS[currentStreet.street] : ''} Actions
          </h3>
          {currentStreet && (
            <ActionTimeline
              actions={currentStreet.actions}
              activeAction={activeActionIdx}
              onSelect={setActiveActionIdx}
            />
          )}
        </div>
      </div>
    </div>
  );
}