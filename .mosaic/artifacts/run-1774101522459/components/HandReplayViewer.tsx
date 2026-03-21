import React, { useState, useCallback, useMemo, useEffect } from 'react';

// ============================================================
// Types (aligned with API schema)
// ============================================================
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

type Position = 'BTN' | 'SB' | 'BB' | 'UTG' | 'MP' | 'CO';
type Street = 'preflop' | 'flop' | 'turn' | 'river';
type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';
type DecisionQuality = 'good' | 'minor_deviation' | 'major_deviation';

interface ActionLogEntry {
  seat: number;
  playerName: string;
  action: ActionType;
  amount?: number | null;
  street: Street;
  potAfter?: number;
  timestamp: string;
}

interface BlindStructure {
  smallBlind: number;
  bigBlind: number;
}

interface SeatRecord {
  seat: number;
  name: string;
  position: Position;
  isHuman?: boolean;
  botStyle?: string | null;
  startingStackBB: number;
  holeCards: Card[];
}

interface Winner {
  seat: number;
  potIndex: number;
  amountWonBB: number;
  handRank?: string | null;
}

interface HandSettlement {
  handId: string;
  winners: Winner[];
  showdownHands?: { seat: number; holeCards: Card[]; handRank: string }[];
  chipMovements: { seat: number; changesBB: number }[];
  playerFinalStacks: { seat: number; stackBB: number }[];
  wonWithoutShowdown?: boolean;
}

interface HandHistory {
  id: string;
  sessionId: string;
  timestamp: string;
  handNumber?: number;
  dealerSeat?: number;
  blinds?: BlindStructure;
  seats: SeatRecord[];
  communityCards: Card[];
  actionSequence: ActionLogEntry[];
  settlement: HandSettlement;
}

interface GameSnapshot {
  communityCards: Card[];
  potBB: number;
  playerStacks: { seat: number; stackBB: number; isActive: boolean }[];
  userPosition: Position;
  userHoleCards: Card[];
}

interface GTOActionEV {
  action: ActionType;
  amount?: number | null;
  evBB: number;
  frequency?: number;
}

interface GTOEvaluationResult {
  actions: GTOActionEV[];
  recommendedAction: ActionType;
  recommendedAmount?: number | null;
  handStrength?: number;
  potOdds?: number;
  spr?: number;
  isDegraded: boolean;
}

interface DecisionPointAnalysis {
  index: number;
  street: Street;
  gameSnapshot?: GameSnapshot;
  userAction: {
    type: ActionType;
    amount?: number | null;
    evBB?: number;
  };
  gtoEvaluation: GTOEvaluationResult;
  evDiffBB: number;
  quality: DecisionQuality;
}

interface TimelineMarker {
  label: string;
  street: Street;
  decisionPointIndices: number[];
}

interface HandReplayData {
  handHistory: HandHistory;
  decisionPoints: DecisionPointAnalysis[];
  totalEvLossBB: number;
  timelineMarkers?: TimelineMarker[];
}

interface HandReplayViewerProps {
  replayData: HandReplayData;
  onBack: () => void;
}

// ============================================================
// Helpers
// ============================================================
const STREETS: Street[] = ['preflop', 'flop', 'turn', 'river'];

const streetLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const streetShort: Record<string, string> = { preflop: 'PF', flop: 'F', turn: 'T', river: 'R' };

const suitSymbol: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const suitColor = (s: string) => (s === 'h' || s === 'd' ? 'text-red-600' : 'text-gray-900');

const actionLabel: Record<string, string> = {
  fold: 'Fold', check: 'Check', call: 'Call',
  bet: 'Bet', raise: 'Raise', all_in: 'All-In',
};

const qualityConfig: Record<DecisionQuality, {
  dot: string; bg: string; border: string; text: string; label: string; icon: string;
}> = {
  good: {
    dot: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200',
    text: 'text-emerald-600', label: 'Good', icon: '✓',
  },
  minor_deviation: {
    dot: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-200',
    text: 'text-amber-600', label: 'Minor', icon: '⚠',
  },
  major_deviation: {
    dot: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-200',
    text: 'text-red-600', label: 'Major', icon: '✗',
  },
};

const formatBB = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)} BB`;
const formatEvLoss = (n: number) => `${n < 0 ? '' : '-'}${Math.abs(n).toFixed(2)} BB`;

// 6-max seat positions on an elliptical table
const SEAT_POSITIONS: { top: string; left: string; transform: string }[] = [
  { top: '85%', left: '20%', transform: 'translate(-50%, -50%)' },   // 0 bottom-left
  { top: '50%', left: '2%', transform: 'translate(-50%, -50%)' },    // 1 mid-left
  { top: '12%', left: '20%', transform: 'translate(-50%, -50%)' },   // 2 top-left
  { top: '12%', left: '80%', transform: 'translate(-50%, -50%)' },   // 3 top-right
  { top: '50%', left: '98%', transform: 'translate(-50%, -50%)' },   // 4 mid-right
  { top: '85%', left: '80%', transform: 'translate(-50%, -50%)' },   // 5 bottom-right
];

// ============================================================
// Sub-components
// ============================================================

/** Single card */
const CardView: React.FC<{ card: Card; size?: 'sm' | 'md' }> = ({ card, size = 'md' }) => {
  const px = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  return (
    <span className={`inline-flex items-center ${px} bg-white border border-gray-200 rounded-lg font-mono font-bold shadow-sm`}>
      <span className="text-gray-900">{card.rank}</span>
      <span className={suitColor(card.suit)}>{suitSymbol[card.suit]}</span>
    </span>
  );
};

/** Replay poker table snapshot */
const TableSnapshot: React.FC<{
  snapshot?: GameSnapshot;
  seats: SeatRecord[];
  communityCards: Card[];
  dealerSeat?: number;
}> = ({ snapshot, seats, communityCards, dealerSeat }) => {
  const cards = snapshot?.communityCards ?? communityCards;
  const potBB = snapshot?.potBB ?? 0;

  return (
    <div className="bg-emerald-800 rounded-xl border border-emerald-900 shadow-sm relative overflow-hidden"
         style={{ minHeight: '320px' }}>
      {/* Felt gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-emerald-900 opacity-50" />

      <div className="relative p-6">
        {/* Community Cards */}
        <div className="flex justify-center gap-2 mt-8 mb-4">
          {cards.length > 0 ? (
            cards.map((c, i) => <CardView key={i} card={c} />)
          ) : (
            <span className="text-emerald-400 text-sm italic">No community cards</span>
          )}
        </div>

        {/* Pot */}
        <div className="text-center mb-6">
          <span className="bg-emerald-900/70 text-emerald-200 text-sm font-semibold px-4 py-1.5 rounded-full">
            Pot: {potBB.toFixed(1)} BB
          </span>
        </div>

        {/* Player seats */}
        <div className="relative" style={{ height: '160px' }}>
          {seats.map((seat, i) => {
            const pos = SEAT_POSITIONS[i] ?? SEAT_POSITIONS[0];
            const stackInfo = snapshot?.playerStacks.find(p => p.seat === seat.seat);
            const isActive = stackInfo?.isActive ?? true;
            const stack = stackInfo?.stackBB ?? seat.startingStackBB;
            const isDealer = seat.seat === dealerSeat;
            const isHuman = seat.isHuman;

            return (
              <div
                key={seat.seat}
                className="absolute"
                style={{ top: pos.top, left: pos.left, transform: pos.transform }}
              >
                <div className={`
                  flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs
                  ${isActive ? 'bg-emerald-800/80' : 'bg-emerald-900/60 opacity-50'}
                  ${isHuman ? 'ring-1 ring-blue-400' : ''}
                `}>
                  <div className="flex items-center gap-1">
                    {isDealer && (
                      <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">D</span>
                    )}
                    <span className="font-medium text-white truncate max-w-[72px]">{seat.name}</span>
                  </div>
                  <span className="text-emerald-400 text-[10px]">
                    {seat.position} · {stack.toFixed(1)} BB
                  </span>
                  {!isActive && <span className="text-emerald-500 text-[10px] font-medium">Folded</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* User hole cards */}
        {snapshot?.userHoleCards && snapshot.userHoleCards.length === 2 && (
          <div className="flex justify-center gap-1 mt-2">
            {snapshot.userHoleCards.map((c, i) => <CardView key={i} card={c} size="sm" />)}
          </div>
        )}
      </div>
    </div>
  );
};

/** Decision Analysis Panel */
const DecisionAnalysisPanel: React.FC<{
  dp: DecisionPointAnalysis;
}> = ({ dp }) => {
  const qc = qualityConfig[dp.quality];
  const gto = dp.gtoEvaluation;
  const sortedActions = [...gto.actions].sort((a, b) => (b.frequency ?? 0) - (a.frequency ?? 0));

  return (
    <div className="space-y-4">
      {/* Your Action */}
      <div className={`rounded-xl border p-4 shadow-sm ${qc.bg} ${qc.border}`}>
        <div className="text-xs font-medium text-gray-500 mb-1">Your Action</div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {actionLabel[dp.userAction.type] ?? dp.userAction.type}
            {dp.userAction.amount ? ` ${dp.userAction.amount} BB` : ''}
          </span>
          <span className={`text-sm font-semibold ${qc.text}`}>
            {qc.icon} {qc.label}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-4 text-sm">
          <span className="text-gray-500">
            EV Loss: <span className={`font-semibold ${dp.evDiffBB < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {formatEvLoss(dp.evDiffBB)}
            </span>
          </span>
        </div>
      </div>

      {/* GTO Strategy Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="text-xs font-medium text-gray-500 mb-3">GTO Strategy</div>
        <div className="space-y-2.5">
          {sortedActions.map((a) => {
            const pct = Math.round((a.frequency ?? 0) * 100);
            const isUserAction = a.action === dp.userAction.type;
            const isRecommended = a.action === gto.recommendedAction;
            return (
              <div key={`${a.action}-${a.amount}`} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${isRecommended ? 'text-blue-600' : 'text-gray-700'}`}>
                    {actionLabel[a.action] ?? a.action}
                    {a.amount ? ` (${a.amount}BB)` : ''}
                    {isUserAction && <span className="ml-1 text-xs text-gray-400">← you</span>}
                    {isRecommended && !isUserAction && <span className="ml-1 text-xs text-blue-400">★ GTO</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{formatBB(a.evBB)}</span>
                    <span className="text-gray-500 w-10 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isRecommended ? 'bg-blue-500' : 'bg-gray-300'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hand Strength & Stats */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="text-xs font-medium text-gray-500 mb-3">Hand Metrics</div>
        <div className="grid grid-cols-3 gap-3">
          {gto.handStrength != null && (
            <div>
              <div className="text-xs text-gray-400">Strength</div>
              <div className="text-base font-bold text-gray-900">{(gto.handStrength * 100).toFixed(0)}%</div>
            </div>
          )}
          {gto.potOdds != null && (
            <div>
              <div className="text-xs text-gray-400">Pot Odds</div>
              <div className="text-base font-bold text-gray-900">{(gto.potOdds * 100).toFixed(0)}%</div>
            </div>
          )}
          {gto.spr != null && (
            <div>
              <div className="text-xs text-gray-400">SPR</div>
              <div className="text-base font-bold text-gray-900">{gto.spr.toFixed(1)}</div>
            </div>
          )}
        </div>
        {gto.isDegraded && (
          <div className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5">
            ⚠ Heuristic estimate (computation timed out)
          </div>
        )}
      </div>
    </div>
  );
};

/** Inline timeline bar */
const ReplayTimelineBar: React.FC<{
  decisionPoints: DecisionPointAnalysis[];
  timelineMarkers?: TimelineMarker[];
  currentIndex: number;
  onSelect: (index: number) => void;
}> = ({ decisionPoints, timelineMarkers, currentIndex, onSelect }) => {
  // Group by street
  const streetGroups = useMemo(() => {
    if (timelineMarkers && timelineMarkers.length > 0) {
      return timelineMarkers.map(m => ({
        street: m.street,
        label: m.label,
        indices: m.decisionPointIndices,
      }));
    }
    const groups: { street: Street; label: string; indices: number[] }[] = [];
    let current = '';
    for (const dp of decisionPoints) {
      if (dp.street !== current) {
        current = dp.street;
        groups.push({ street: dp.street, label: streetLabel(dp.street), indices: [] });
      }
      groups[groups.length - 1].indices.push(dp.index);
    }
    return groups;
  }, [decisionPoints, timelineMarkers]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Decision Timeline</h3>
      {/* Street labels */}
      <div className="flex items-center gap-1 mb-2">
        {streetGroups.map((g) => {
          const hasActive = g.indices.includes(currentIndex);
          return (
            <button
              key={g.street}
              onClick={() => onSelect(g.indices[0])}
              className={`
                px-2.5 py-0.5 text-xs font-medium rounded-md transition-colors
                ${hasActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              {g.label} ({g.indices.length})
            </button>
          );
        })}
      </div>
      {/* Decision dots */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {decisionPoints.map((dp) => {
          const isActive = dp.index === currentIndex;
          const qc = qualityConfig[dp.quality];
          return (
            <button
              key={dp.index}
              onClick={() => onSelect(dp.index)}
              className={`
                flex-shrink-0 flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all
                ${isActive ? 'bg-gray-100 ring-2 ring-blue-500' : 'hover:bg-gray-50'}
              `}
            >
              <div className={`w-3 h-3 rounded-full ${qc.dot}`} />
              <span className="text-[10px] text-gray-400">{streetShort[dp.street] ?? dp.street}</span>
              <span className="text-xs font-medium text-gray-700">
                {actionLabel[dp.userAction.type] ?? dp.userAction.type}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/** Navigation controls */
const NavigationBar: React.FC<{
  currentIndex: number;
  totalPoints: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
}> = ({ currentIndex, totalPoints, canPrev, canNext, onPrev, onNext, onFirst, onLast }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <button
        onClick={onFirst}
        disabled={!canPrev}
        className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors
          ${canPrev ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
        title="First (Home)"
      >
        ⏮
      </button>
      <button
        onClick={onPrev}
        disabled={!canPrev}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
          ${canPrev ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
      >
        ← Prev
      </button>
    </div>

    <span className="text-sm text-gray-500">
      Decision <span className="font-semibold text-gray-900">{currentIndex + 1}</span> of {totalPoints}
    </span>

    <div className="flex items-center gap-2">
      <button
        onClick={onNext}
        disabled={!canNext}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
          ${canNext ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
      >
        Next →
      </button>
      <button
        onClick={onLast}
        disabled={!canNext}
        className={`px-2 py-2 rounded-lg text-sm font-medium transition-colors
          ${canNext ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
        title="Last (End)"
      >
        ⏭
      </button>
    </div>
  </div>
);

// ============================================================
// Main Component
// ============================================================
const HandReplayViewer: React.FC<HandReplayViewerProps> = ({ replayData, onBack }) => {
  const { handHistory, decisionPoints, totalEvLossBB, timelineMarkers } = replayData;
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalPoints = decisionPoints.length;
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < totalPoints - 1;

  const goTo = useCallback((i: number) => {
    setCurrentIndex(Math.max(0, Math.min(i, totalPoints - 1)));
  }, [totalPoints]);

  const goPrev = useCallback(() => { if (canPrev) goTo(currentIndex - 1); }, [canPrev, currentIndex, goTo]);
  const goNext = useCallback(() => { if (canNext) goTo(currentIndex + 1); }, [canNext, currentIndex, goTo]);
  const goFirst = useCallback(() => goTo(0), [goTo]);
  const goLast = useCallback(() => goTo(totalPoints - 1), [goTo, totalPoints]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'Home') goFirst();
      else if (e.key === 'End') goLast();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goPrev, goNext, goFirst, goLast]);

  const dp = decisionPoints[currentIndex] ?? null;

  // EV summary per street
  const perStreetEV = useMemo(() => {
    const result: Record<string, { count: number; totalLoss: number }> = {};
    for (const pt of decisionPoints) {
      if (!result[pt.street]) result[pt.street] = { count: 0, totalLoss: 0 };
      result[pt.street].count++;
      result[pt.street].totalLoss += pt.evDiffBB;
    }
    return result;
  }, [decisionPoints]);

  // Key deviations (major/minor sorted by severity)
  const keyDeviations = useMemo(() =>
    decisionPoints
      .filter(d => d.quality !== 'good')
      .sort((a, b) => a.evDiffBB - b.evDiffBB),
    [decisionPoints]
  );

  if (totalPoints === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Hand Replay</h1>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-400 text-5xl">🃏</div>
          <div className="text-lg font-semibold text-gray-600">No Decision Points</div>
          <p className="text-sm text-gray-400">This hand has no user decision points to replay.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hand Replay</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Hand #{handHistory.handNumber ?? handHistory.id.slice(0, 8)}
              {' · '}{totalPoints} decision{totalPoints !== 1 ? 's' : ''}
              {' · '}
              <span className={totalEvLossBB < 0 ? 'text-red-500 font-medium' : 'text-emerald-500 font-medium'}>
                {formatEvLoss(totalEvLossBB)} total
              </span>
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          ← → to navigate · Home/End to jump
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-12 gap-4">
        {/* LEFT: Table + Timeline (8 cols) */}
        <div className="col-span-8 space-y-4">
          <TableSnapshot
            snapshot={dp?.gameSnapshot}
            seats={handHistory.seats}
            communityCards={handHistory.communityCards}
            dealerSeat={handHistory.dealerSeat}
          />

          <ReplayTimelineBar
            decisionPoints={decisionPoints}
            timelineMarkers={timelineMarkers}
            currentIndex={currentIndex}
            onSelect={goTo}
          />
        </div>

        {/* RIGHT: Decision Analysis (4 cols) */}
        <div className="col-span-4">
          {dp && <DecisionAnalysisPanel dp={dp} />}
        </div>
      </div>

      {/* ── Navigation Controls ── */}
      <NavigationBar
        currentIndex={currentIndex}
        totalPoints={totalPoints}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={goPrev}
        onNext={goNext}
        onFirst={goFirst}
        onLast={goLast}
      />

      {/* ── Hand EV Summary Footer ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Hand EV Summary</h3>
          <span className={`text-sm font-bold ${totalEvLossBB < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            Total: {formatEvLoss(totalEvLossBB)}
          </span>
        </div>

        {/* Per-street breakdown */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {STREETS.map((s) => {
            const stats = perStreetEV[s];
            const loss = stats?.totalLoss ?? 0;
            return (
              <div key={s} className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400">{streetLabel(s)}</div>
                <div className={`text-sm font-bold mt-0.5 ${loss < 0 ? 'text-red-500' : loss === 0 ? 'text-gray-400' : 'text-emerald-500'}`}>
                  {stats ? formatEvLoss(loss) : '—'}
                </div>
                {stats && (
                  <div className="text-[10px] text-gray-400 mt-0.5">{stats.count} decision{stats.count !== 1 ? 's' : ''}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Key deviations */}
        {keyDeviations.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500">Key Deviations</div>
            {keyDeviations.map((d) => {
              const qc = qualityConfig[d.quality];
              return (
                <button
                  key={d.index}
                  onClick={() => goTo(d.index)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${qc.dot}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-700">
                      #{d.index + 1} {streetLabel(d.street)}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {actionLabel[d.userAction.type] ?? d.userAction.type}
                      {d.userAction.amount ? ` ${d.userAction.amount}BB` : ''}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-red-500 flex-shrink-0">
                    {formatEvLoss(d.evDiffBB)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HandReplayViewer;