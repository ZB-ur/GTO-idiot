import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlayingCard } from './PlayingCard';
import { CommunityCards, Card } from './CommunityCards';
import { PotDisplay } from './PotDisplay';
import { PlayerSeat, Player, SeatPosition } from './PlayerSeat';
import { GtoComparisonPanel } from './GtoComparisonPanel';

// ============================================================
// Types (aligned with API spec schemas)
// ============================================================
type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
type Street = 'preflop' | 'flop' | 'turn' | 'river';
type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';
type DeviationLevel = 'match' | 'minor_deviation' | 'major_deviation';
type PrecisionLevel = 'exact' | 'precomputed' | 'simplified' | 'pseudo_headsup';

interface GtoAction {
  action: ActionType;
  frequency: number;
  amount?: number;
  amountBB?: number;
  ev?: number;
}

interface GtoStrategy {
  actions: GtoAction[];
  precision: PrecisionLevel;
  isApproximate?: boolean;
  disclaimerMessage?: string;
  evEstimate?: number;
  solveTimeMs?: number;
}

interface DecisionPointReview {
  street: Street;
  position: Position;
  communityCards?: Card[];
  holeCards?: Card[];
  pot?: number;
  playerAction: {
    action: ActionType;
    amount?: number;
  };
  gtoStrategy: GtoStrategy;
  deviation: DeviationLevel;
  evLoss: number;
  actionContext?: string;
}

interface HandReview {
  handNumber: number;
  decisionPoints: DecisionPointReview[];
  totalEvLoss: number;
  overallDeviation: DeviationLevel;
  deviationCount?: {
    match?: number;
    minor?: number;
    major?: number;
  };
}

interface ActionRecord {
  seatIndex: number;
  playerName: string;
  action: ActionType;
  amount?: number;
  street: Street;
  potAfter?: number;
  timestamp: string;
}

interface StreetRecord {
  cardsDealt?: Card[];
  actions: ActionRecord[];
  potAtEnd?: number;
}

interface HandRecordPlayer {
  seatIndex: number;
  playerName: string;
  position: Position;
  isUser?: boolean;
  botStyle?: 'TAG' | 'LAG' | 'Fish' | 'Nit' | 'Maniac';
  startingChips: number;
  holeCards: Card[];
}

interface HandResult {
  winners: {
    seatIndex: number;
    playerName: string;
    amount: number;
    handStrength?: string;
    holeCards?: Card[];
  }[];
  potResults: {
    potName: string;
    amount: number;
    winnerSeatIndex: number;
  }[];
  showdownPlayers?: {
    seatIndex: number;
    holeCards: Card[];
    handStrength?: string;
  }[];
}

interface HandRecord {
  handNumber: number;
  sessionId: string;
  dealerSeatIndex?: number;
  blinds?: { small: number; big: number };
  players: HandRecordPlayer[];
  communityCards: Card[];
  streets: {
    preflop: StreetRecord;
    flop?: StreetRecord;
    turn?: StreetRecord;
    river?: StreetRecord;
  };
  result: HandResult;
  userProfit?: number;
  timestamp: string;
}

interface HandReplayViewerProps {
  handReview: HandReview;
  handRecord: HandRecord;
  onBack: () => void;
}

// ============================================================
// Constants & Helpers
// ============================================================
const STREETS: Street[] = ['preflop', 'flop', 'turn', 'river'];

const SEAT_LAYOUT: SeatPosition[] = [
  'bottom-left',
  'mid-left',
  'top-left',
  'top-right',
  'mid-right',
  'bottom-right',
];

const streetLabel = (s: Street): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

const actionLabel = (a: ActionType): string => {
  const map: Record<ActionType, string> = {
    fold: 'Fold', check: 'Check', call: 'Call',
    bet: 'Bet', raise: 'Raise', 'all-in': 'All-In',
  };
  return map[a] ?? a;
};

const deviationConfig = {
  match: {
    color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200',
    dot: 'bg-emerald-500', label: 'GTO Match', icon: '✓',
  },
  minor_deviation: {
    color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200',
    dot: 'bg-amber-400', label: 'Minor Deviation', icon: '⚠',
  },
  major_deviation: {
    color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200',
    dot: 'bg-red-500', label: 'Major Deviation', icon: '✗',
  },
};

const formatBB = (n: number): string => {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)} BB`;
};

/**
 * Build the community cards visible at a given decision point's street.
 */
function communityCardsAtStreet(handRecord: HandRecord, street: Street): Card[] {
  const cards: Card[] = [];
  if (street === 'preflop') return cards;
  if (handRecord.streets.flop?.cardsDealt) cards.push(...handRecord.streets.flop.cardsDealt);
  if (street === 'flop') return cards;
  if (handRecord.streets.turn?.cardsDealt) cards.push(...handRecord.streets.turn.cardsDealt);
  if (street === 'turn') return cards;
  if (handRecord.streets.river?.cardsDealt) cards.push(...handRecord.streets.river.cardsDealt);
  return cards;
}

/**
 * Compute cumulative pot up to a decision point.
 */
function potAtDecisionPoint(
  handRecord: HandRecord,
  dpIndex: number,
  decisionPoints: DecisionPointReview[],
): number {
  const dp = decisionPoints[dpIndex];
  return dp.pot ?? handRecord.streets[dp.street]?.potAtEnd ?? 0;
}

/**
 * Derive player states for a given decision point (who's active, chips, bets).
 */
function playersAtDecisionPoint(
  handRecord: HandRecord,
  dp: DecisionPointReview,
  dpIndex: number,
  allDps: DecisionPointReview[],
): Player[] {
  // Collect all actions up to this decision point's street
  const allActionsBeforeThisDP: ActionRecord[] = [];
  for (const s of STREETS) {
    const streetRec = handRecord.streets[s];
    if (!streetRec) break;
    allActionsBeforeThisDP.push(...streetRec.actions);
    if (s === dp.street) break;
  }

  const foldedSeats = new Set<number>();
  allActionsBeforeThisDP.forEach(a => {
    if (a.action === 'fold') foldedSeats.add(a.seatIndex);
  });

  return handRecord.players.map((p) => {
    const isUser = !!p.isUser;
    const showCards = isUser || foldedSeats.has(p.seatIndex) === false;
    return {
      seatIndex: p.seatIndex,
      name: p.playerName,
      chips: p.startingChips,
      position: p.position,
      isHuman: isUser,
      isActive: !foldedSeats.has(p.seatIndex),
      botStyle: p.botStyle === 'Maniac' ? 'LAG' : (p.botStyle as any),
      holeCards: showCards && p.holeCards.length === 2
        ? [p.holeCards[0], p.holeCards[1]] as [Card, Card]
        : undefined,
    };
  });
}

// ============================================================
// HandReplayViewer — Main Component
// ============================================================
export const HandReplayViewer: React.FC<HandReplayViewerProps> = ({
  handReview,
  handRecord,
  onBack,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalPoints = handReview.decisionPoints.length;

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < totalPoints - 1;

  const goTo = useCallback(
    (i: number) => setCurrentIndex(Math.max(0, Math.min(i, totalPoints - 1))),
    [totalPoints],
  );
  const goPrev = useCallback(() => { if (canPrev) goTo(currentIndex - 1); }, [canPrev, currentIndex, goTo]);
  const goNext = useCallback(() => { if (canNext) goTo(currentIndex + 1); }, [canNext, currentIndex, goTo]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goPrev, goNext, onBack]);

  // Current decision point
  const dp = handReview.decisionPoints[currentIndex];
  const devConfig = deviationConfig[dp.deviation];

  // Derived state for current decision
  const communityCards = useMemo(
    () => dp.communityCards ?? communityCardsAtStreet(handRecord, dp.street),
    [dp, handRecord],
  );

  const potAmount = useMemo(
    () => potAtDecisionPoint(handRecord, currentIndex, handReview.decisionPoints),
    [handRecord, currentIndex, handReview.decisionPoints],
  );

  const players = useMemo(
    () => playersAtDecisionPoint(handRecord, dp, currentIndex, handReview.decisionPoints),
    [handRecord, dp, currentIndex, handReview.decisionPoints],
  );

  const userPlayer = handRecord.players.find(p => p.isUser);
  const userSeatIndex = userPlayer?.seatIndex ?? 0;
  const dealerSeatIndex = handRecord.dealerSeatIndex ?? 0;

  // Street groups for jump nav
  const streetGroups = useMemo(() => {
    const groups: Record<string, number[]> = {};
    handReview.decisionPoints.forEach((pt, i) => {
      if (!groups[pt.street]) groups[pt.street] = [];
      groups[pt.street].push(i);
    });
    return groups;
  }, [handReview.decisionPoints]);

  // Actions on current street
  const currentStreetActions = useMemo(() => {
    const streetRec = handRecord.streets[dp.street];
    return streetRec?.actions ?? [];
  }, [handRecord, dp.street]);

  // ── Per-street EV loss ──
  const perStreetEvLoss = useMemo(() => {
    const result: Record<Street, number> = { preflop: 0, flop: 0, turn: 0, river: 0 };
    handReview.decisionPoints.forEach(pt => {
      result[pt.street] = (result[pt.street] ?? 0) + pt.evLoss;
    });
    return result;
  }, [handReview.decisionPoints]);

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hand #{handRecord.handNumber}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalPoints} decision points &middot;{' '}
              <span className={handReview.totalEvLoss > 0 ? 'text-red-500 font-semibold' : 'text-emerald-500 font-semibold'}>
                {handReview.totalEvLoss > 0 ? '-' : ''}{Math.abs(handReview.totalEvLoss).toFixed(2)} BB total EV
              </span>
            </p>
          </div>
        </div>

        {/* Overall deviation badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${deviationConfig[handReview.overallDeviation].bg} ${deviationConfig[handReview.overallDeviation].border}`}>
          <span className={`text-sm font-semibold ${deviationConfig[handReview.overallDeviation].color}`}>
            {deviationConfig[handReview.overallDeviation].icon} {deviationConfig[handReview.overallDeviation].label}
          </span>
          {handReview.deviationCount && (
            <div className="flex items-center gap-1.5 ml-2 text-xs">
              <span className="text-emerald-600">{handReview.deviationCount.match ?? 0}✓</span>
              <span className="text-amber-500">{handReview.deviationCount.minor ?? 0}⚠</span>
              <span className="text-red-500">{handReview.deviationCount.major ?? 0}✗</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Street Jump Nav ── */}
      <nav className="flex gap-2">
        {STREETS.map((s) => {
          const indices = streetGroups[s];
          const isActive = dp.street === s;
          const hasPoints = !!indices;
          return (
            <button
              key={s}
              disabled={!hasPoints}
              onClick={() => { if (indices) goTo(indices[0]); }}
              className={`
                px-4 py-1.5 text-sm font-medium rounded-lg transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : hasPoints
                    ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {streetLabel(s)}
              {indices && (
                <span className={`ml-1.5 text-xs ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                  ({indices.length})
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Main Grid: Table + GTO Panel ── */}
      <div className="grid grid-cols-12 gap-4">
        {/* LEFT: Table Snapshot (8 cols) */}
        <div className="col-span-8 space-y-4">
          {/* Poker table with replay state */}
          <div className="bg-emerald-900 rounded-xl border-4 border-emerald-800 shadow-lg relative overflow-hidden"
               style={{ minHeight: '420px' }}>
            {/* Replay badge */}
            <div className="absolute top-3 right-4 z-20 bg-black/40 text-white/70 text-[10px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Replay &middot; {streetLabel(dp.street)}
            </div>

            {/* Street & context info */}
            <div className="absolute top-3 left-4 z-20">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg ${devConfig.bg} ${devConfig.color} ${devConfig.border} border`}>
                {devConfig.icon} {devConfig.label}
              </span>
            </div>

            {/* Inner felt */}
            <div className="absolute inset-6 border-2 border-emerald-700/30 rounded-[40%]" />

            {/* Community cards center */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10">
              <CommunityCards cards={communityCards} animated={false} />
            </div>

            {/* Pot display center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 z-10">
              <PotDisplay mainPot={potAmount} />
            </div>

            {/* Player seats */}
            {players.map((player, i) => {
              const seatPos = SEAT_LAYOUT[player.seatIndex] ?? SEAT_LAYOUT[0];
              return (
                <div
                  key={player.seatIndex}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                  style={seatPositionStyle(player.seatIndex)}
                >
                  <PlayerSeat
                    player={player}
                    isCurrentActor={false}
                    isDealer={player.seatIndex === dealerSeatIndex}
                    isThinking={false}
                    showCards={player.isHuman || !player.isActive}
                    position={seatPos}
                  />
                </div>
              );
            })}
          </div>

          {/* Decision Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Decision Timeline</h3>
            <div className="flex items-center gap-0 overflow-x-auto pb-2">
              {handReview.decisionPoints.map((pt, i) => {
                const isCurrent = i === currentIndex;
                const sev = deviationConfig[pt.deviation];
                const isDeviation = pt.deviation !== 'match';
                return (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <div className={`h-0.5 w-6 flex-shrink-0 ${i <= currentIndex ? 'bg-blue-300' : 'bg-gray-200'}`} />
                    )}
                    <button
                      onClick={() => goTo(i)}
                      className={`
                        flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all
                        ${isCurrent ? 'bg-blue-50 ring-2 ring-blue-600 shadow-sm' : 'hover:bg-gray-50'}
                      `}
                    >
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                        {streetLabel(pt.street).slice(0, 2)}
                      </span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${sev.dot} ${isCurrent ? 'ring-2 ring-offset-2' : ''}`}>
                        {isDeviation && <span className="text-white text-[10px] font-bold">!</span>}
                      </div>
                      <span className={`text-xs font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                        {actionLabel(pt.playerAction.action)}
                      </span>
                      {isDeviation && (
                        <span className={`text-[10px] font-semibold ${sev.color}`}>
                          -{pt.evLoss.toFixed(1)}
                        </span>
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Action History for current street */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {streetLabel(dp.street)} Actions
            </h3>
            <div className="space-y-1.5">
              {currentStreetActions.map((action, i) => {
                const isUserAction = action.seatIndex === userSeatIndex;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm ${
                      isUserAction ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="text-gray-400 text-xs w-6 text-right">{i + 1}.</span>
                    <span className={`font-medium ${isUserAction ? 'text-blue-600' : 'text-gray-700'} w-24 truncate`}>
                      {action.playerName}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {actionLabel(action.action)}
                      {action.amount ? ` ${action.amount}` : ''}
                    </span>
                    {action.potAfter != null && (
                      <span className="text-gray-400 text-xs ml-auto">
                        Pot: {action.potAfter}
                      </span>
                    )}
                  </div>
                );
              })}
              {currentStreetActions.length === 0 && (
                <p className="text-sm text-gray-400 italic">No actions recorded</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: GTO Comparison Panel (4 cols) */}
        <div className="col-span-4 space-y-4">
          {/* Player Action Card */}
          <div className={`rounded-xl border p-4 shadow-sm ${devConfig.bg} ${devConfig.border}`}>
            <div className="text-xs font-medium text-gray-500 mb-1">Your Decision</div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">
                {actionLabel(dp.playerAction.action)}
                {dp.playerAction.amount ? ` ${dp.playerAction.amount} BB` : ''}
              </span>
              <span className={`text-sm font-semibold ${devConfig.color}`}>
                {devConfig.icon} {dp.deviation === 'match' ? 'GTO' : dp.deviation === 'minor_deviation' ? 'Minor' : 'Major'}
              </span>
            </div>
            {dp.actionContext && (
              <p className="text-sm text-gray-600 mt-2">{dp.actionContext}</p>
            )}
            {dp.holeCards && dp.holeCards.length === 2 && (
              <div className="flex gap-1.5 mt-3">
                <PlayingCard rank={dp.holeCards[0].rank as any} suit={dp.holeCards[0].suit as any} size="sm" />
                <PlayingCard rank={dp.holeCards[1].rank as any} suit={dp.holeCards[1].suit as any} size="sm" />
                <span className="text-xs text-gray-500 ml-2 self-center">{dp.position}</span>
              </div>
            )}
          </div>

          {/* GTO Strategy Frequencies */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">GTO Strategy</span>
              {dp.gtoStrategy.isApproximate && (
                <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                  ≈ Approximate
                </span>
              )}
            </div>
            <div className="space-y-2.5">
              {dp.gtoStrategy.actions
                .sort((a, b) => b.frequency - a.frequency)
                .map((gtoAction) => {
                  const pct = Math.round(gtoAction.frequency * 100);
                  const isPlayerAction = gtoAction.action === dp.playerAction.action;
                  return (
                    <div key={`${gtoAction.action}-${gtoAction.amount ?? ''}`} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-medium ${isPlayerAction ? 'text-blue-600' : 'text-gray-700'}`}>
                          {actionLabel(gtoAction.action)}
                          {gtoAction.amountBB ? ` (${gtoAction.amountBB}BB)` : ''}
                          {isPlayerAction && (
                            <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-semibold">
                              YOU
                            </span>
                          )}
                        </span>
                        <span className="text-gray-500 tabular-nums">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${isPlayerAction ? 'bg-blue-500' : 'bg-gray-300'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {gtoAction.ev != null && (
                        <div className="text-[10px] text-gray-400 text-right">
                          EV: {formatBB(gtoAction.ev)}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
            {dp.gtoStrategy.disclaimerMessage && (
              <p className="text-[11px] text-gray-400 mt-3 italic border-t border-gray-100 pt-2">
                {dp.gtoStrategy.disclaimerMessage}
              </p>
            )}
          </div>

          {/* EV Analysis Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-xs font-medium text-gray-500 mb-3">EV Analysis</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400">GTO EV</div>
                <div className="text-lg font-bold text-gray-900">
                  {dp.gtoStrategy.evEstimate != null ? formatBB(dp.gtoStrategy.evEstimate) : '—'}
                </div>
              </div>
              <div className={`rounded-lg p-3 text-center ${devConfig.bg}`}>
                <div className="text-xs text-gray-400">EV Loss</div>
                <div className={`text-lg font-bold ${devConfig.color}`}>
                  {dp.evLoss > 0 ? `-${dp.evLoss.toFixed(2)}` : '0.00'} BB
                </div>
              </div>
            </div>
          </div>

          {/* Per-street EV summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-xs font-medium text-gray-500 mb-3">EV Loss by Street</div>
            <div className="grid grid-cols-4 gap-2">
              {STREETS.map((s) => {
                const loss = perStreetEvLoss[s];
                const isCurrentStreet = dp.street === s;
                return (
                  <div
                    key={s}
                    className={`rounded-lg p-2 text-center ${isCurrentStreet ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-slate-50'}`}
                  >
                    <div className="text-[10px] text-gray-400 uppercase">{streetLabel(s).slice(0, 2)}</div>
                    <div className={`text-xs font-bold mt-0.5 ${loss > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {loss > 0 ? `-${loss.toFixed(1)}` : '0.0'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-3 flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={!canPrev}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${canPrev
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          ← Previous
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Decision <span className="font-semibold text-gray-900">{currentIndex + 1}</span> of {totalPoints}
          </span>
          <span className="text-xs text-gray-400">
            (← → keys)
          </span>
        </div>

        <button
          onClick={goNext}
          disabled={!canNext}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${canNext
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Next →
        </button>
      </div>

      {/* ── Hand Result Footer ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Hand Result</h3>
          {handRecord.userProfit != null && (
            <span className={`text-sm font-bold ${handRecord.userProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {handRecord.userProfit >= 0 ? '+' : ''}{handRecord.userProfit} BB
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {handRecord.result.winners.map((w, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
              <span className="text-sm font-semibold text-gray-900">{w.playerName}</span>
              <span className="text-xs text-gray-500">won</span>
              <span className="text-sm font-bold text-emerald-600">{w.amount} BB</span>
              {w.handStrength && (
                <span className="text-xs text-gray-400">({w.handStrength})</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Seat position styling for the elliptical table layout
function seatPositionStyle(seatIndex: number): React.CSSProperties {
  const positions = [
    { top: '82%', left: '50%' },   // 0: bottom center (human)
    { top: '68%', left: '10%' },   // 1: bottom-left
    { top: '18%', left: '10%' },   // 2: top-left
    { top: '5%', left: '50%' },    // 3: top center
    { top: '18%', left: '90%' },   // 4: top-right
    { top: '68%', left: '90%' },   // 5: bottom-right
  ];
  const pos = positions[seatIndex] ?? positions[0];
  return { top: pos.top, left: pos.left };
}

export default HandReplayViewer;