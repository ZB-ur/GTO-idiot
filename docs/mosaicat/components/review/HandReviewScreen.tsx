'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  HandReplay,
  DecisionPoint,
  GTOComparison,
  HandGTOSummary,
  Card,
  ActionType,
  Street,
  Position,
  RecordedAction,
} from '@/engine/types';
import { ReplayTableSnapshot } from '@/components/replay/ReplayTableSnapshot';
import { DecisionTimeline } from '@/components/replay/DecisionTimeline';
import { EVAnalysisCard } from '@/components/replay/EVAnalysisCard';
import { GTOFrequencyChart } from '@/components/replay/GTOFrequencyChart';
import { HandSummaryFooter } from '@/components/replay/HandSummaryFooter';

// ── Service imports ──
import { getHandReplay } from '@/services/review';
import { getGTOComparison } from '@/services/review';
import { getHandGTOSummary } from '@/services/review';

// ── Types ──

interface HandReviewScreenProps {
  handId: string;
  onBack: () => void;
}

const STREET_ORDER: Street[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];

const STREET_LABELS: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  allin: 'All-In',
};

function formatCard(card: Card): string {
  const suitSymbol: Record<string, string> = {
    s: '\u2660',
    h: '\u2665',
    d: '\u2666',
    c: '\u2663',
  };
  return `${card.rank}${suitSymbol[card.suit] ?? card.suit}`;
}

function formatChips(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k`;
  return amount.toFixed(amount % 1 === 0 ? 0 : 1);
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-900/30 border-green-700/40';
  if (score >= 50) return 'bg-yellow-900/30 border-yellow-700/40';
  return 'bg-red-900/30 border-red-700/40';
}

// ── Main Component ──

export function HandReviewScreen({ handId, onBack }: HandReviewScreenProps) {
  const [replay, setReplay] = useState<HandReplay | null>(null);
  const [summary, setSummary] = useState<HandGTOSummary | null>(null);
  const [gtoComparison, setGtoComparison] = useState<GTOComparison | null>(null);
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRangeModal, setShowRangeModal] = useState(false);

  // Load replay data
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([getHandReplay(handId), getHandGTOSummary(handId)])
      .then(([replayData, summaryData]) => {
        if (cancelled) return;
        setReplay(replayData);
        setSummary(summaryData);
        setCurrentDecisionIndex(0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load hand');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [handId]);

  // Load GTO comparison for current hero decision
  const currentDecision = replay?.decisionPoints[currentDecisionIndex] ?? null;

  useEffect(() => {
    if (!currentDecision?.isHero) {
      setGtoComparison(null);
      return;
    }

    let cancelled = false;
    getGTOComparison(handId, currentDecisionIndex)
      .then((data) => {
        if (!cancelled) setGtoComparison(data);
      })
      .catch(() => {
        if (!cancelled) setGtoComparison(null);
      });

    return () => {
      cancelled = true;
    };
  }, [handId, currentDecisionIndex, currentDecision?.isHero]);

  const totalDecisions = replay?.decisionPoints.length ?? 0;

  const handlePrev = useCallback(() => {
    setCurrentDecisionIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentDecisionIndex((i) => Math.min(totalDecisions - 1, i + 1));
  }, [totalDecisions]);

  const handleGoTo = useCallback((index: number) => {
    setCurrentDecisionIndex(index);
  }, []);

  // Group actions by street for the action log
  const actionsByStreet = useMemo(() => {
    if (!replay) return [];
    const groups: { street: Street; actions: DecisionPoint[] }[] = [];
    let currentStreet: Street | null = null;

    for (const dp of replay.decisionPoints) {
      if (dp.street !== currentStreet) {
        groups.push({ street: dp.street, actions: [] });
        currentStreet = dp.street;
      }
      groups[groups.length - 1]!.actions.push(dp);
    }
    return groups;
  }, [replay]);

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-800 rounded-lg" />
            <div className="h-64 bg-gray-800 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 bg-gray-800 rounded-xl" />
              <div className="h-48 bg-gray-800 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error || !replay) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error ?? 'Hand not found'}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-100">Hand Review</h1>
              <p className="text-sm text-gray-500">
                Hand #{replay.handId.slice(-6)} &middot;{' '}
                {replay.decisionPoints.length} decisions
              </p>
            </div>
          </div>

          {/* GTO Score Badge */}
          {summary && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${scoreBgColor(
                summary.gtoDeviationScore,
              )}`}
            >
              <span className="text-xs text-gray-400">GTO Score</span>
              <span
                className={`text-2xl font-bold tabular-nums ${scoreColor(
                  summary.gtoDeviationScore,
                )}`}
              >
                {summary.gtoDeviationScore}
              </span>
            </div>
          )}
        </div>

        {/* ── Hand Summary Card ── */}
        {summary && (
          <motion.div
            className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-200">Summary</h2>
              {summary.totalEvDifference !== 0 && (
                <span
                  className={`text-sm font-medium tabular-nums ${
                    summary.totalEvDifference >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {summary.totalEvDifference >= 0 ? '+' : ''}
                  {summary.totalEvDifference.toFixed(1)} BB
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <span className="text-xs text-gray-500 block mb-0.5">Decisions</span>
                <span className="text-lg font-bold text-gray-200 tabular-nums">
                  {summary.decisionCount}
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500 block mb-0.5">Hero Decisions</span>
                <span className="text-lg font-bold text-blue-300 tabular-nums">
                  {summary.heroDecisionCount}
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500 block mb-0.5">EV Diff</span>
                <span
                  className={`text-lg font-bold tabular-nums ${
                    summary.totalEvDifference >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {summary.totalEvDifference >= 0 ? '+' : ''}
                  {summary.totalEvDifference.toFixed(2)}
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500 block mb-0.5">GTO Score</span>
                <span
                  className={`text-lg font-bold tabular-nums ${scoreColor(
                    summary.gtoDeviationScore,
                  )}`}
                >
                  {summary.gtoDeviationScore}/100
                </span>
              </div>
            </div>

            {/* Verdict */}
            <p className="text-sm text-gray-400 leading-relaxed">{summary.verdict}</p>

            {/* Worst decision callout */}
            {summary.worstDecision && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-red-900/20 border border-red-800/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400 font-medium">Worst Decision</span>
                  <span className="text-xs text-red-500 tabular-nums">
                    {summary.worstDecision.evDifference.toFixed(2)} BB
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {summary.worstDecision.description}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Decision Timeline ── */}
        <DecisionTimeline
          decisionPoints={replay.decisionPoints}
          currentIndex={currentDecisionIndex}
          onSelect={handleGoTo}
        />

        {/* ── Navigation Buttons ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentDecisionIndex <= 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Prev Decision
          </button>

          <span className="text-sm text-gray-500 tabular-nums">
            {currentDecisionIndex + 1} / {totalDecisions}
          </span>

          <button
            onClick={handleNext}
            disabled={currentDecisionIndex >= totalDecisions - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next Decision
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* ── Table View + GTO Comparison (side-by-side on desktop) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Table snapshot — 3/5 width */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {currentDecision && (
                <motion.div
                  key={`table-${currentDecisionIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ReplayTableSnapshot
                    snapshot={currentDecision.tableSnapshot}
                    highlightSeat={currentDecision.seatIndex}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* GTO Comparison Panel — 2/5 width */}
          <div className="lg:col-span-2 space-y-4">
            {/* Decision Info */}
            {currentDecision && (
              <motion.div
                key={`info-${currentDecisionIndex}`}
                className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-4"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-200">
                    Decision #{currentDecisionIndex + 1}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 uppercase tracking-wide">
                    {currentDecision.street}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Player</span>
                    <span className="text-gray-200 font-medium">
                      {currentDecision.isHero ? (
                        <span className="text-blue-400">Hero</span>
                      ) : (
                        `Seat ${currentDecision.seatIndex}`
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Action</span>
                    <span className="text-gray-200 font-medium">
                      {ACTION_LABELS[currentDecision.action.type] ?? currentDecision.action.type}
                      {currentDecision.action.amount != null &&
                        ` ${formatChips(currentDecision.action.amount)}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Pot</span>
                    <span className="text-chip-gold font-medium tabular-nums">
                      {formatChips(currentDecision.pot)}
                    </span>
                  </div>
                  {currentDecision.communityCards.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Board</span>
                      <span className="text-gray-200 font-medium tracking-wide">
                        {currentDecision.communityCards.map(formatCard).join(' ')}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* GTO Comparison */}
            {gtoComparison && currentDecision?.isHero && (
              <motion.div
                key={`gto-${currentDecisionIndex}`}
                className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-4"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-200">GTO Comparison</h3>
                  <span
                    className={`text-xs font-medium tabular-nums ${
                      gtoComparison.evDifference >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {gtoComparison.evDifference >= 0 ? '+' : ''}
                    {gtoComparison.evDifference.toFixed(2)} BB
                  </span>
                </div>

                {/* Your action vs GTO */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-900/30 border border-blue-700/40">
                    <span className="text-xs text-blue-300">Your Action</span>
                    <span className="text-sm font-medium text-blue-200">
                      {ACTION_LABELS[gtoComparison.heroAction.type] ?? gtoComparison.heroAction.type}
                      {gtoComparison.heroAction.amount != null &&
                        ` ${formatChips(gtoComparison.heroAction.amount)}`}
                    </span>
                  </div>

                  {/* GTO recommended actions */}
                  <div>
                    <span className="text-xs text-gray-500 mb-1.5 block">GTO Strategy</span>
                    <div className="space-y-1.5">
                      {gtoComparison.gtoRecommendation
                        .sort((a, b) => b.frequency - a.frequency)
                        .map((rec) => (
                          <div
                            key={rec.type}
                            className="flex items-center justify-between px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700/40"
                          >
                            <span className="text-xs text-gray-300 font-medium">
                              {ACTION_LABELS[rec.type] ?? rec.type}
                              {rec.amount != null && ` ${formatChips(rec.amount)}`}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{ width: `${rec.frequency}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 tabular-nums w-8 text-right">
                                {Math.round(rec.frequency)}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {gtoComparison.comparisonLabel && (
                    <p className="text-[10px] text-gray-600 mt-1">
                      {gtoComparison.comparisonLabel}
                    </p>
                  )}

                  {/* View Range Chart button (preflop only) */}
                  {gtoComparison.comparisonType === 'preflop_range' && (
                    <button
                      onClick={() => setShowRangeModal(true)}
                      className="w-full mt-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-blue-400 hover:text-blue-300 hover:bg-gray-750 transition-colors"
                    >
                      View Range Chart
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Non-hero decision placeholder */}
            {currentDecision && !currentDecision.isHero && (
              <div className="rounded-xl border border-dashed border-gray-700/60 bg-gray-800/30 p-4 text-center">
                <p className="text-xs text-gray-600">
                  GTO comparison not available for opponent actions
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Action Log ── */}
        <motion.div
          className="rounded-xl border border-gray-700/60 bg-gray-800/50 p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <h3 className="text-sm font-semibold text-gray-200 mb-3">Action Log</h3>

          <div className="space-y-3">
            {actionsByStreet.map((group) => (
              <div key={group.street}>
                <span className="text-[10px] uppercase tracking-wider text-gray-600 block mb-1.5">
                  {STREET_LABELS[group.street]}
                </span>
                <div className="space-y-1">
                  {group.actions.map((dp, idx) => {
                    const isSelected =
                      replay.decisionPoints.indexOf(dp) === currentDecisionIndex;
                    return (
                      <button
                        key={`${group.street}-${idx}`}
                        onClick={() =>
                          handleGoTo(replay.decisionPoints.indexOf(dp))
                        }
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors ${
                          isSelected
                            ? 'bg-blue-900/40 border border-blue-600/40 text-blue-200'
                            : 'bg-gray-800/60 border border-transparent hover:bg-gray-700/60 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {dp.isHero && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          )}
                          <span className={dp.isHero ? 'text-blue-300 font-medium' : ''}>
                            {dp.isHero ? 'Hero' : `Seat ${dp.seatIndex}`}
                          </span>
                        </div>
                        <span className="font-medium">
                          {ACTION_LABELS[dp.action.type] ?? dp.action.type}
                          {dp.action.amount != null && ` ${formatChips(dp.action.amount)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Hand Summary Footer ── */}
        {summary && replay && (
          <HandSummaryFooter
            evSummary={{
              totalEVLoss: Math.abs(summary.totalEvDifference),
              majorDeviations: summary.worstDecision ? 1 : 0,
              minorDeviations: 0,
            }}
            decisionPoints={replay.decisionPoints}
          />
        )}

        {/* ── Range Chart Modal ── */}
        <AnimatePresence>
          {showRangeModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/60"
                onClick={() => setShowRangeModal(false)}
              />

              {/* Modal */}
              <motion.div
                className="relative w-full max-w-2xl rounded-xl border border-gray-700 bg-gray-800 shadow-xl p-6"
                initial={{ scale: 0.95, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 16 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-100">
                    Preflop Range Chart
                  </h3>
                  <button
                    onClick={() => setShowRangeModal(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="text-center py-12 text-gray-500 text-sm">
                  Range chart loaded from /ranges/{'{position}'} endpoint
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}