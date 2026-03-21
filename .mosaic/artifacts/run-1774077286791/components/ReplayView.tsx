typescript
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReplayControls from './ReplayControls';
import DecisionComparison from './DecisionComparison';
import StrategyExplanation from './StrategyExplanation';
import HandSummaryCard from './HandSummaryCard';
import SkeletonLoader from './SkeletonLoader';
import type {
  ActionSummary,
  GTORecommendation,
  ConfidenceInfo,
  DecisionComparisonProps,
} from './DecisionComparison';
import type { EVDecisionBrief } from './HandSummaryCard';

// --- API Types (from api-spec.yaml) ---

interface Card {
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
}

interface ActionRecord {
  seat: number;
  playerName?: string;
  action: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin' | 'post_sb' | 'post_bb';
  amount?: number;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  timestamp: string;
}

interface DecisionSnapshot {
  communityCards: Card[];
  potSize: number;
  playerStack: number;
  playerPosition: string;
  effectiveStack: number;
  spr?: number;
  playerHoleCards: Card[];
  activePlayers?: number;
  actionSequence?: ActionRecord[];
}

interface ReplayDecisionPoint {
  index: number;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  snapshot: DecisionSnapshot;
  playerAction: ActionRecord;
}

interface HandReplay {
  handId: string;
  decisions: ReplayDecisionPoint[];
  totalDecisions: number;
  handResult?: unknown;
}

interface DecisionComparisonData {
  decisionIndex: number;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  playerAction: ActionSummary;
  gtoRecommendation: GTORecommendation;
  quality: 'good' | 'minor_deviation' | 'major_deviation';
  qualityColor: string;
  evDifference: number;
  strategyExplanation: string;
  confidence?: ConfidenceInfo;
}

interface EVSummary {
  handId: string;
  totalEVLoss: number;
  decisionCount: number;
  decisions: EVDecisionBrief[];
  qualityScore: number;
}

// --- Component ---

export interface ReplayViewProps {
  handId: string;
  onBack: () => void;
}

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLORS: Record<string, string> = {
  hearts: 'text-red-400',
  diamonds: 'text-red-400',
  clubs: 'text-white',
  spades: 'text-white',
};

const STREET_LABELS: Record<string, string> = {
  preflop: 'Pre-Flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const formatCard = (card: Card): string => `${card.rank}${SUIT_SYMBOLS[card.suit]}`;

const ReplayView: React.FC<ReplayViewProps> = ({ handId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [replay, setReplay] = useState<HandReplay | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comparison, setComparison] = useState<DecisionComparisonData | null>(null);
  const [evSummary, setEvSummary] = useState<EVSummary | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Fetch replay data
  useEffect(() => {
    const fetchReplay = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/hands/${handId}/replay`);
        const data: HandReplay = await res.json();
        setReplay(data);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchReplay();
  }, [handId]);

  // Fetch EV summary
  useEffect(() => {
    const fetchEVSummary = async () => {
      try {
        const res = await fetch(`/api/hands/${handId}/replay/ev-summary`);
        const data: EVSummary = await res.json();
        setEvSummary(data);
      } catch {
        // Handle error
      }
    };
    fetchEVSummary();
  }, [handId]);

  // Fetch comparison for current decision
  useEffect(() => {
    if (!replay || replay.decisions.length === 0) return;
    const fetchComparison = async () => {
      setComparisonLoading(true);
      try {
        const res = await fetch(`/api/hands/${handId}/replay/decisions/${currentIndex}`);
        const data: DecisionComparisonData = await res.json();
        setComparison(data);
      } catch {
        setComparison(null);
      } finally {
        setComparisonLoading(false);
      }
    };
    fetchComparison();
  }, [handId, currentIndex, replay]);

  const currentDecision = useMemo(
    () => replay?.decisions[currentIndex] ?? null,
    [replay, currentIndex],
  );

  const handlePrev = useCallback(() => setCurrentIndex((i) => Math.max(0, i - 1)), []);
  const handleNext = useCallback(
    () => setCurrentIndex((i) => Math.min((replay?.totalDecisions ?? 1) - 1, i + 1)),
    [replay],
  );
  const handleFirst = useCallback(() => setCurrentIndex(0), []);
  const handleLast = useCallback(
    () => setCurrentIndex((replay?.totalDecisions ?? 1) - 1),
    [replay],
  );
  const handleSeek = useCallback((index: number) => setCurrentIndex(index), []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="animate-pulse bg-gray-700 rounded-lg h-9 w-24" />
            <div className="animate-pulse bg-gray-700 rounded-lg h-6 w-48" />
          </div>
          <SkeletonLoader variant="card" count={2} />
        </div>
      </div>
    );
  }

  if (!replay || replay.decisions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">返回</span>
          </button>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-400 text-sm">该手牌没有决策记录</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-white text-lg font-bold">手牌复盘</h1>
              <p className="text-gray-500 text-xs font-mono">#{handId.slice(0, 8)}</p>
            </div>
          </div>
          {evSummary && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs">总评分</span>
              <span
                className={`text-lg font-bold tabular-nums ${
                  evSummary.qualityScore >= 80
                    ? 'text-emerald-400'
                    : evSummary.qualityScore >= 50
                      ? 'text-amber-400'
                      : 'text-red-400'
                }`}
              >
                {evSummary.qualityScore}
              </span>
            </div>
          )}
        </div>

        {/* Main content: 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column: Table + Controls */}
          <div className="lg:col-span-2 space-y-4">
            {/* Mini table replay area */}
            {currentDecision && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                {/* Street indicator */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
                  <span className="text-gray-300 text-sm font-semibold">
                    {STREET_LABELS[currentDecision.street]}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">位置</span>
                    <span className="text-xs font-semibold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full">
                      {currentDecision.snapshot.playerPosition}
                    </span>
                  </div>
                </div>

                {/* Table felt area */}
                <div className="relative bg-emerald-800 border-2 border-emerald-900 rounded-xl mx-4 my-4 p-6 flex flex-col items-center gap-4">
                  {/* Community cards */}
                  <div className="flex items-center gap-2 min-h-[56px]">
                    {currentDecision.snapshot.communityCards.length > 0 ? (
                      currentDecision.snapshot.communityCards.map((card, i) => (
                        <div
                          key={i}
                          className="w-10 h-14 bg-white rounded-md border border-gray-300 flex flex-col items-center justify-center shadow-sm"
                        >
                          <span className={`text-sm font-bold ${SUIT_COLORS[card.suit]}`}>
                            {card.rank}
                          </span>
                          <span className={`text-xs ${SUIT_COLORS[card.suit]}`}>
                            {SUIT_SYMBOLS[card.suit]}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-emerald-600 text-sm italic">Pre-Flop</span>
                    )}
                  </div>

                  {/* Pot size */}
                  <div className="flex items-center gap-1.5 bg-black/30 rounded-full px-3 py-1">
                    <span className="text-yellow-400 text-xs font-semibold">POT</span>
                    <span className="text-white text-sm font-bold tabular-nums">
                      {currentDecision.snapshot.potSize.toFixed(1)} BB
                    </span>
                  </div>
                </div>

                {/* Player info bar */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-700 bg-gray-800/50">
                  {/* Hole cards */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs">手牌</span>
                    <div className="flex gap-1">
                      {currentDecision.snapshot.playerHoleCards.map((card, i) => (
                        <span
                          key={i}
                          className={`text-sm font-bold ${SUIT_COLORS[card.suit]}`}
                        >
                          {formatCard(card)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stack + SPR */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 text-xs">筹码</span>
                      <span className="text-white text-xs font-semibold tabular-nums">
                        {currentDecision.snapshot.playerStack.toFixed(1)} BB
                      </span>
                    </div>
                    {currentDecision.snapshot.spr !== undefined && (
                      <>
                        <div className="w-px h-3 bg-gray-600" />
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 text-xs">SPR</span>
                          <span className="text-white text-xs font-semibold tabular-nums">
                            {currentDecision.snapshot.spr.toFixed(1)}
                          </span>
                        </div>
                      </>
                    )}
                    {currentDecision.snapshot.activePlayers !== undefined && (
                      <>
                        <div className="w-px h-3 bg-gray-600" />
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 text-xs">人数</span>
                          <span className="text-white text-xs font-semibold tabular-nums">
                            {currentDecision.snapshot.activePlayers}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Replay controls */}
            <ReplayControls
              currentIndex={currentIndex}
              totalDecisions={replay.totalDecisions}
              onPrev={handlePrev}
              onNext={handleNext}
              onFirst={handleFirst}
              onLast={handleLast}
              onSeek={handleSeek}
            />

            {/* Decision comparison panel */}
            {comparisonLoading ? (
              <div className="animate-pulse bg-gray-800 border border-gray-700 rounded-xl h-40" />
            ) : comparison ? (
              <div className="space-y-3">
                <DecisionComparison
                  playerAction={comparison.playerAction}
                  gtoRecommendation={comparison.gtoRecommendation}
                  quality={comparison.quality}
                  qualityColor={comparison.qualityColor}
                  evDifference={comparison.evDifference}
                  confidence={comparison.confidence}
                />
                <StrategyExplanation
                  explanation={comparison.strategyExplanation}
                  street={comparison.street}
                />
              </div>
            ) : null}
          </div>

          {/* Right column: Summary */}
          <div className="space-y-4">
            {evSummary ? (
              <HandSummaryCard
                totalEVLoss={evSummary.totalEVLoss}
                qualityScore={evSummary.qualityScore}
                decisionCount={evSummary.decisionCount}
                decisions={evSummary.decisions}
              />
            ) : (
              <div className="animate-pulse bg-gray-800 border border-gray-700 rounded-xl h-60" />
            )}

            {/* Action history for current street */}
            {currentDecision?.snapshot.actionSequence && currentDecision.snapshot.actionSequence.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-2">
                <div className="text-gray-400 text-xs font-medium">当前街行动</div>
                <div className="space-y-1">
                  {currentDecision.snapshot.actionSequence.map((action, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500 w-16 truncate">{action.playerName ?? `Seat ${action.seat}`}</span>
                      <span className="text-white capitalize">{action.action}</span>
                      {action.amount !== undefined && action.amount > 0 && (
                        <span className="text-gray-400 tabular-nums">{action.amount.toFixed(1)} BB</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplayView;