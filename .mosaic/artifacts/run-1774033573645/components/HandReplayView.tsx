import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================
// Types
// ============================================================
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface PotInfo {
  mainPot: number;
  sidePots?: { amount: number; eligiblePlayers: number[] }[];
}

interface SnapshotPlayer {
  seatIndex: number;
  name: string;
  chips: number;
  isActive: boolean;
  position: string;
  currentBet?: number;
}

interface Action {
  playerSeatIndex: number;
  playerName?: string;
  actionType: string;
  amount?: number;
  street: string;
  potAfter?: number;
  timestamp: string;
}

interface TableSnapshot {
  communityCards: Card[];
  pot: PotInfo;
  players: SnapshotPlayer[];
  actionsThisStreet?: Action[];
}

interface ActionFrequency {
  actionType: string;
  frequency: number;
  sizingBB?: number;
}

interface EVAnalysis {
  playerEV: number;
  gtoOptimalEV: number;
  evLoss: number;
}

interface GTOEvaluation {
  gtoActions: ActionFrequency[];
  playerAction: string;
  playerAmount?: number;
  deviationSeverity: 'none' | 'minor' | 'major';
  deviationDescription?: string;
  evAnalysis: EVAnalysis;
}

interface DecisionPoint {
  index: number;
  street: string;
  snapshot: TableSnapshot;
  playerAction: { actionType: string; amount?: number };
  gtoEvaluation: GTOEvaluation;
}

interface KeyDeviation {
  decisionIndex: number;
  street: string;
  severity: 'none' | 'minor' | 'major';
  evLoss: number;
  description?: string;
}

interface HandEVSummary {
  totalEVLoss: number;
  decisionCount: number;
  keyDeviations: KeyDeviation[];
  perStreetEVLoss?: {
    preflop?: number;
    flop?: number;
    turn?: number;
    river?: number;
  };
}

interface HandReplay {
  handId: string;
  decisionPoints: DecisionPoint[];
  evSummary: HandEVSummary;
}

interface HandReplayViewProps {
  handId: string;
}

// ============================================================
// Helpers
// ============================================================
const STREETS = ['preflop', 'flop', 'turn', 'river'] as const;

const streetLabel = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1);

const severityColor = (s: string) => {
  if (s === 'none') return 'text-emerald-500';
  if (s === 'minor') return 'text-amber-500';
  return 'text-red-500';
};

const severityBg = (s: string) => {
  if (s === 'none') return 'bg-emerald-50 border-emerald-200';
  if (s === 'minor') return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
};

const severityDot = (s: string) => {
  if (s === 'none') return 'bg-emerald-500';
  if (s === 'minor') return 'bg-amber-500';
  return 'bg-red-500';
};

const suitSymbol = (s: string) => {
  const map: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
  return map[s] ?? s;
};

const suitColor = (s: string) => {
  if (s === 'h' || s === 'd') return 'text-red-500';
  return 'text-gray-900';
};

const formatBB = (n: number) => {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)} BB`;
};

const actionLabel = (a: string) => {
  const map: Record<string, string> = {
    fold: 'Fold',
    check: 'Check',
    call: 'Call',
    raise: 'Raise',
    all_in: 'All-In',
  };
  return map[a] ?? a;
};

// ============================================================
// Sub-components (inline — children are separate files)
// ============================================================

/** Card display */
const CardView: React.FC<{ card: Card; size?: 'sm' | 'md' }> = ({ card, size = 'md' }) => {
  const px = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm';
  return (
    <span className={`inline-flex items-center ${px} bg-white border border-gray-200 rounded-lg font-mono font-bold shadow-sm`}>
      <span className="text-gray-900">{card.rank}</span>
      <span className={suitColor(card.suit)}>{suitSymbol(card.suit)}</span>
    </span>
  );
};

// ============================================================
// Main Component
// ============================================================
const HandReplayView: React.FC<HandReplayViewProps> = ({ handId }) => {
  const [replay, setReplay] = useState<HandReplay | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch replay data
  useEffect(() => {
    let cancelled = false;
    const fetchReplay = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/hands/${handId}/replay`);
        if (!res.ok) throw new Error('Failed to load replay');
        const data: HandReplay = await res.json();
        if (!cancelled) {
          setReplay(data);
          setCurrentIndex(0);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchReplay();
    return () => { cancelled = true; };
  }, [handId]);

  // Navigation
  const totalPoints = replay?.decisionPoints.length ?? 0;
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < totalPoints - 1;

  const goTo = useCallback((i: number) => {
    setCurrentIndex(Math.max(0, Math.min(i, totalPoints - 1)));
  }, [totalPoints]);

  const goPrev = useCallback(() => { if (canPrev) goTo(currentIndex - 1); }, [canPrev, currentIndex, goTo]);
  const goNext = useCallback(() => { if (canNext) goTo(currentIndex + 1); }, [canNext, currentIndex, goTo]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goPrev, goNext]);

  // Current decision point
  const dp = replay?.decisionPoints[currentIndex] ?? null;

  // Street groups for jump nav
  const streetGroups = useMemo(() => {
    if (!replay) return [];
    const groups: { street: string; indices: number[] }[] = [];
    let currentStreet = '';
    for (const pt of replay.decisionPoints) {
      if (pt.street !== currentStreet) {
        currentStreet = pt.street;
        groups.push({ street: pt.street, indices: [] });
      }
      groups[groups.length - 1].indices.push(pt.index);
    }
    return groups;
  }, [replay]);

  // Loading / error
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !replay) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <div className="text-red-500 text-lg font-semibold">Failed to load replay</div>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hand Replay</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Hand #{handId.slice(0, 8)} &middot; {totalPoints} decision points
          </p>
        </div>
        <a
          href={`/hands/${handId}`}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          &larr; Back to hand
        </a>
      </div>

      {/* ── Street Jump Nav ── */}
      <nav className="flex gap-2">
        {STREETS.map((s) => {
          const group = streetGroups.find((g) => g.street === s);
          const isActive = dp?.street === s;
          const hasPoints = !!group;
          return (
            <button
              key={s}
              disabled={!hasPoints}
              onClick={() => { if (group) goTo(group.indices[0]); }}
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
              {group && (
                <span className={`ml-1.5 text-xs ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                  ({group.indices.length})
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-12 gap-4">
        {/* LEFT: Table Snapshot (8 cols) */}
        <div className="col-span-8 space-y-4">
          {/* Table Snapshot Card */}
          {dp && (
            <div className="bg-emerald-900 rounded-xl p-6 shadow-sm border border-emerald-800 min-h-[340px] relative">
              {/* Community Cards */}
              <div className="flex justify-center gap-2 mb-6">
                {dp.snapshot.communityCards.length > 0
                  ? dp.snapshot.communityCards.map((c, i) => (
                      <CardView key={i} card={c} />
                    ))
                  : <span className="text-emerald-400 text-sm italic">No community cards</span>
                }
              </div>

              {/* Pot */}
              <div className="text-center mb-6">
                <span className="bg-emerald-800 text-emerald-200 text-sm font-semibold px-4 py-1.5 rounded-full">
                  Pot: {dp.snapshot.pot.mainPot} BB
                  {dp.snapshot.pot.sidePots && dp.snapshot.pot.sidePots.length > 0 && (
                    <span className="ml-2 text-emerald-400">
                      (+{dp.snapshot.pot.sidePots.reduce((s, p) => s + p.amount, 0)} side)
                    </span>
                  )}
                </span>
              </div>

              {/* Player seats — simple 2-row layout */}
              <div className="grid grid-cols-3 gap-3">
                {dp.snapshot.players.map((p) => (
                  <div
                    key={p.seatIndex}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                      ${p.isActive ? 'bg-emerald-800/80' : 'bg-emerald-800/40 opacity-60'}
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{p.name}</div>
                      <div className="text-emerald-400 text-xs">
                        {p.position} &middot; {p.chips} BB
                        {p.currentBet ? ` (bet ${p.currentBet})` : ''}
                      </div>
                    </div>
                    {!p.isActive && (
                      <span className="text-emerald-500 text-xs font-medium">Fold</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Decision Timeline</h3>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {replay.decisionPoints.map((pt) => {
                const isActive = pt.index === currentIndex;
                const sev = pt.gtoEvaluation.deviationSeverity;
                return (
                  <button
                    key={pt.index}
                    onClick={() => goTo(pt.index)}
                    className={`
                      flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all
                      ${isActive ? 'bg-gray-100 ring-2 ring-blue-500' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className={`w-3 h-3 rounded-full ${severityDot(sev)}`} />
                    <span className="text-xs text-gray-500">{streetLabel(pt.street)}</span>
                    <span className="text-xs font-medium text-gray-700">
                      {actionLabel(pt.playerAction.actionType)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: Decision Point Panel (4 cols) */}
        <div className="col-span-4 space-y-4">
          {dp && (
            <>
              {/* Player Action */}
              <div className={`rounded-xl border p-4 shadow-sm ${severityBg(dp.gtoEvaluation.deviationSeverity)}`}>
                <div className="text-xs font-medium text-gray-500 mb-1">Your Action</div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {actionLabel(dp.playerAction.actionType)}
                    {dp.playerAction.amount ? ` ${dp.playerAction.amount} BB` : ''}
                  </span>
                  <span className={`text-sm font-semibold ${severityColor(dp.gtoEvaluation.deviationSeverity)}`}>
                    {dp.gtoEvaluation.deviationSeverity === 'none'
                      ? '✓ GTO'
                      : dp.gtoEvaluation.deviationSeverity === 'minor'
                        ? '⚠ Minor'
                        : '✗ Major'}
                  </span>
                </div>
                {dp.gtoEvaluation.deviationDescription && (
                  <p className="text-sm text-gray-600 mt-2">
                    {dp.gtoEvaluation.deviationDescription}
                  </p>
                )}
              </div>

              {/* GTO Strategy Distribution */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="text-xs font-medium text-gray-500 mb-3">GTO Strategy</div>
                <div className="space-y-2">
                  {dp.gtoEvaluation.gtoActions.map((a) => {
                    const pct = Math.round(a.frequency * 100);
                    const isPlayer = a.actionType === dp.playerAction.actionType;
                    return (
                      <div key={a.actionType} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className={`font-medium ${isPlayer ? 'text-blue-600' : 'text-gray-700'}`}>
                            {actionLabel(a.actionType)}
                            {a.sizingBB ? ` (${a.sizingBB}BB)` : ''}
                            {isPlayer && ' ←'}
                          </span>
                          <span className="text-gray-500">{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isPlayer ? 'bg-blue-500' : 'bg-gray-300'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* EV Analysis */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="text-xs font-medium text-gray-500 mb-3">EV Analysis</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-400">Your EV</div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatBB(dp.gtoEvaluation.evAnalysis.playerEV)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">GTO EV</div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatBB(dp.gtoEvaluation.evAnalysis.gtoOptimalEV)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-400">EV Loss</div>
                  <div className={`text-xl font-bold ${
                    dp.gtoEvaluation.evAnalysis.evLoss > 0 ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    {dp.gtoEvaluation.evAnalysis.evLoss > 0 ? '-' : ''}{Math.abs(dp.gtoEvaluation.evAnalysis.evLoss).toFixed(2)} BB
                  </div>
                </div>
              </div>
            </>
          )}
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

        <span className="text-sm text-gray-500">
          Decision <span className="font-semibold text-gray-900">{currentIndex + 1}</span> of {totalPoints}
        </span>

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

      {/* ── Hand Summary Footer ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Hand EV Summary</h3>
          <span className={`text-sm font-bold ${replay.evSummary.totalEVLoss > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            Total EV Loss: {replay.evSummary.totalEVLoss.toFixed(2)} BB
          </span>
        </div>

        {/* Per-street breakdown */}
        {replay.evSummary.perStreetEVLoss && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            {STREETS.map((s) => {
              const loss = replay.evSummary.perStreetEVLoss?.[s] ?? 0;
              return (
                <div key={s} className="bg-slate-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-400">{streetLabel(s)}</div>
                  <div className={`text-sm font-bold mt-0.5 ${loss > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {loss > 0 ? '-' : ''}{Math.abs(loss).toFixed(2)} BB
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Key deviations */}
        {replay.evSummary.keyDeviations.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-500">Key Deviations</div>
            {replay.evSummary.keyDeviations.map((d) => (
              <button
                key={d.decisionIndex}
                onClick={() => goTo(d.decisionIndex)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors"
              >
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${severityDot(d.severity)}`} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-700">
                    #{d.decisionIndex + 1} {streetLabel(d.street)}
                  </span>
                  {d.description && (
                    <span className="text-sm text-gray-500 ml-2">{d.description}</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-red-500 flex-shrink-0">
                  -{d.evLoss.toFixed(2)} BB
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HandReplayView;