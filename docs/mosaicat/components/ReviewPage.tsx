import React, { useState, useEffect, useCallback } from 'react';

// Types from API spec
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface GtoRecommendedAction {
  action: string;
  frequency: number;
  amount?: number | null;
}

interface GtoAnalysis {
  hasData: boolean;
  recommendedActions?: GtoRecommendedAction[];
  userAction?: string;
  userActionFrequency?: number;
  deviation: 'match' | 'minor' | 'severe' | 'no_data';
  explanation?: string;
}

interface DecisionPoint {
  index: number;
  playerId: string;
  position: string;
  street: string;
  actionType: string;
  amount?: number | null;
  isUserDecision: boolean;
  potAtDecision?: number;
  stackAtDecision?: number;
  gtoAnalysis?: GtoAnalysis | null;
  boardAtDecision?: Card[];
}

interface HandHistoryPlayer {
  id: string;
  nickname: string;
  position: string;
  startingChips: number;
  endingChips: number;
  isUser: boolean;
  botStyle?: string | null;
  holeCards?: Card[] | null;
}

interface HandResult {
  winnerId: string;
  winnerNickname: string;
  amount: number;
  handRank: string;
  potLabel?: string;
}

interface HandHistoryRecord {
  handId: string;
  gameId: string;
  handNumber: number;
  timestamp: number;
  userPosition: string;
  userHoleCards?: Card[];
  userPnl: number;
  players: HandHistoryPlayer[];
  communityCards: Card[];
  actions: Array<{
    playerId: string;
    position: string;
    actionType: string;
    amount?: number;
    street: string;
    potAfterAction?: number;
    timestamp: number;
  }>;
  pots?: Array<{ amount: number; eligiblePlayerIds: string[]; label?: string }>;
  results?: HandResult[];
  isKeyHand: boolean;
  keyHandReason?: string | null;
  summary?: string;
  lastStreetReached?: string;
}

interface ReviewData {
  hand: HandHistoryRecord;
  decisionPoints: DecisionPoint[];
  userDecisionCount: number;
  gtoMatchCount: number;
  gtoDeviationCount: number;
  overallDeviation?: 'match' | 'minor' | 'severe' | 'no_data';
}

interface ReviewPageProps {
  handId: string;
}

const STREETS = ['preflop', 'flop', 'turn', 'river', 'showdown'] as const;

const DEVIATION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  match: { bg: 'bg-emerald-500/20', text: 'text-emerald-500', border: 'border-emerald-500' },
  minor: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500' },
  severe: { bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500' },
  no_data: { bg: 'bg-gray-500/20', text: 'text-gray-500', border: 'border-gray-500' },
};

const DEVIATION_LABELS: Record<string, string> = {
  match: 'GTO Match',
  minor: 'Minor Deviation',
  severe: 'Severe Deviation',
  no_data: 'No Data',
};

export default function ReviewPage({ handId }: ReviewPageProps) {
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function fetchReview() {
      try {
        setLoading(true);
        const res = await fetch(`/api/hands/${handId}/review`);
        if (!res.ok) throw new Error(`Failed to load review: ${res.status}`);
        const data: ReviewData = await res.json();
        setReviewData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    fetchReview();
  }, [handId]);

  const totalSteps = reviewData?.decisionPoints.length ?? 0;
  const currentDecision = reviewData?.decisionPoints[currentStep] ?? null;

  const handlePrev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentStep((s) => Math.min(totalSteps - 1, s + 1));
  }, [totalSteps]);

  const handleJumpToStep = useCallback((index: number) => {
    setCurrentStep(index);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isPlaying || currentStep >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <div className="text-gray-400 text-lg">Loading review...</div>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <div className="text-red-500 text-lg">{error ?? 'Review data not found'}</div>
      </div>
    );
  }

  const { hand, decisionPoints, userDecisionCount, gtoMatchCount, gtoDeviationCount, overallDeviation } = reviewData;

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-gray-50 transition-colors">
            ← Back
          </button>
          <h1 className="text-lg font-semibold">
            Hand #{hand.handNumber}
          </h1>
          <span className="text-sm text-gray-400">
            {hand.userPosition} · {hand.userHoleCards?.map((c) => `${c.rank}${c.suit}`).join('') ?? '??'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${hand.userPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {hand.userPnl >= 0 ? '+' : ''}{hand.userPnl.toFixed(1)} BB
          </span>
          {overallDeviation && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${DEVIATION_COLORS[overallDeviation].bg} ${DEVIATION_COLORS[overallDeviation].text}`}>
              {DEVIATION_LABELS[overallDeviation]}
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-[1fr_320px] gap-0 overflow-hidden">
        {/* Left: Table + Timeline + Controls */}
        <div className="flex flex-col overflow-hidden">
          {/* Poker Table Area (child: PokerTable) */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl aspect-[16/10] bg-gray-900 border border-gray-700 rounded-xl flex items-center justify-center">
              {/* PokerTable child renders here */}
              <span className="text-gray-500 text-sm">PokerTable</span>
            </div>
          </div>

          {/* Review Timeline (child: ReviewTimeline) */}
          <div className="px-6 pb-2">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              {/* Street tabs */}
              <div className="flex gap-1 mb-3">
                {STREETS.map((street) => {
                  const hasActions = decisionPoints.some((dp) => dp.street === street);
                  const currentStreet = currentDecision?.street;
                  return (
                    <button
                      key={street}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                        currentStreet === street
                          ? 'bg-amber-500 text-gray-950'
                          : hasActions
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-800/50 text-gray-600 cursor-default'
                      }`}
                      disabled={!hasActions}
                    >
                      {street.charAt(0).toUpperCase() + street.slice(1)}
                    </button>
                  );
                })}
              </div>

              {/* Timeline dots */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {decisionPoints.map((dp, i) => {
                  const isActive = i === currentStep;
                  const deviation = dp.gtoAnalysis?.deviation;
                  const dotColor = dp.isUserDecision && deviation
                    ? DEVIATION_COLORS[deviation].border
                    : 'border-gray-600';

                  return (
                    <button
                      key={dp.index}
                      onClick={() => handleJumpToStep(i)}
                      className={`w-7 h-7 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-[10px] font-medium transition-all ${dotColor} ${
                        isActive
                          ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-gray-900 scale-110'
                          : 'hover:scale-105'
                      } ${
                        dp.isUserDecision ? 'bg-gray-800' : 'bg-gray-900'
                      }`}
                      title={`${dp.position} ${dp.actionType}${dp.amount ? ` ${dp.amount}BB` : ''}`}
                    >
                      {dp.position.slice(0, 2)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step Controls (child: StepControls) */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentStep(0)}
                className="p-2 text-gray-400 hover:text-gray-50 transition-colors"
                title="First"
              >
                ⏮
              </button>
              <button
                onClick={handlePrev}
                disabled={currentStep <= 0}
                className="p-2 text-gray-400 hover:text-gray-50 disabled:text-gray-600 transition-colors"
                title="Previous"
              >
                ◀
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-gray-950 flex items-center justify-center font-bold transition-colors"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep >= totalSteps - 1}
                className="p-2 text-gray-400 hover:text-gray-50 disabled:text-gray-600 transition-colors"
                title="Next"
              >
                ▶
              </button>
              <button
                onClick={() => setCurrentStep(totalSteps - 1)}
                className="p-2 text-gray-400 hover:text-gray-50 transition-colors"
                title="Last"
              >
                ⏭
              </button>
              <span className="text-xs text-gray-500 ml-2">
                {currentStep + 1} / {totalSteps}
              </span>
            </div>
          </div>
        </div>

        {/* Right sidebar: GTO Panel + Hand Summary */}
        <aside className="border-l border-gray-700 bg-gray-900 flex flex-col overflow-hidden">
          {/* GTO Panel (child: GtoPanel) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">GTO Analysis</h2>

            {currentDecision ? (
              <>
                {/* Current action info */}
                <div className="bg-gray-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{currentDecision.position}</span>
                    <span className="text-xs text-gray-500">{currentDecision.street}</span>
                  </div>
                  <div className="text-lg font-semibold capitalize">
                    {currentDecision.actionType}
                    {currentDecision.amount ? ` ${currentDecision.amount} BB` : ''}
                  </div>
                  {currentDecision.potAtDecision !== undefined && (
                    <div className="text-xs text-gray-500">
                      Pot: {currentDecision.potAtDecision} BB · Stack: {currentDecision.stackAtDecision} BB
                    </div>
                  )}
                </div>

                {/* GTO comparison */}
                {currentDecision.isUserDecision && currentDecision.gtoAnalysis ? (
                  <div className="space-y-3">
                    {/* Deviation badge */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${DEVIATION_COLORS[currentDecision.gtoAnalysis.deviation].bg}`}>
                      <div className={`w-2 h-2 rounded-full ${DEVIATION_COLORS[currentDecision.gtoAnalysis.deviation].text.replace('text-', 'bg-')}`} />
                      <span className={`text-sm font-medium ${DEVIATION_COLORS[currentDecision.gtoAnalysis.deviation].text}`}>
                        {DEVIATION_LABELS[currentDecision.gtoAnalysis.deviation]}
                      </span>
                    </div>

                    {/* Recommended actions */}
                    {currentDecision.gtoAnalysis.recommendedActions && currentDecision.gtoAnalysis.recommendedActions.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-medium text-gray-400">GTO Strategy</h3>
                        {currentDecision.gtoAnalysis.recommendedActions.map((ra, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="capitalize">{ra.action}{ra.amount ? ` ${ra.amount}BB` : ''}</span>
                                <span className="text-gray-400">{ra.frequency}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    ra.action === currentDecision.gtoAnalysis!.userAction
                                      ? DEVIATION_COLORS[currentDecision.gtoAnalysis!.deviation].text.replace('text-', 'bg-')
                                      : 'bg-gray-500'
                                  }`}
                                  style={{ width: `${ra.frequency}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Explanation */}
                    {currentDecision.gtoAnalysis.explanation && (
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {currentDecision.gtoAnalysis.explanation}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {currentDecision.isUserDecision ? 'No GTO data for this spot' : 'Opponent action — no GTO comparison'}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">Select a decision point</div>
            )}
          </div>

          {/* Hand Summary (child: HandSummary) */}
          <div className="border-t border-gray-700 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Summary</h2>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-800 rounded-lg p-2">
                <div className="text-lg font-bold">{userDecisionCount}</div>
                <div className="text-[10px] text-gray-500">Decisions</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <div className="text-lg font-bold text-emerald-500">{gtoMatchCount}</div>
                <div className="text-[10px] text-gray-500">GTO Match</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <div className="text-lg font-bold text-red-500">{gtoDeviationCount}</div>
                <div className="text-[10px] text-gray-500">Deviations</div>
              </div>
            </div>
            {hand.summary && (
              <p className="text-xs text-gray-400">{hand.summary}</p>
            )}
            {hand.results && hand.results.length > 0 && (
              <div className="text-xs text-gray-500">
                Winner: {hand.results[0].winnerNickname} — {hand.results[0].handRank}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}