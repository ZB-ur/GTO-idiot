typescript
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PokerTable from './PokerTable';
import ReplayControls from './ReplayControls';
import type { Card, HandState, Player, Pot, ActionRecord } from './PokerTable';

// ─── API-aligned types (from api-spec.yaml) ─────────────────────────

export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export type DecisionQuality = 'good' | 'minor_deviation' | 'major_deviation';

export interface ReplayFrame {
  index: number;
  type:
    | 'deal_hole_cards'
    | 'post_blinds'
    | 'player_action'
    | 'deal_flop'
    | 'deal_turn'
    | 'deal_river'
    | 'showdown'
    | 'award_pot';
  street: Street;
  action?: ActionRecord;
  cardsRevealed?: Card[];
  tableState: {
    pot: number;
    communityCards: Card[];
    players: Player[];
  };
  isUserDecisionPoint?: boolean;
}

export interface ReplayData {
  handId: string;
  totalFrames: number;
  frames: ReplayFrame[];
}

export interface GTORecommendation {
  action: string;
  frequency: number;
  betSize?: string;
  betAmount?: number;
  ev?: number;
}

export interface DecisionPointAnalysis {
  frameIndex: number;
  street: Street;
  position?: string;
  potAtDecision?: number;
  stackAtDecision?: number;
  userAction: { action: string; amount?: number };
  gtoRecommendations: GTORecommendation[];
  quality: DecisionQuality;
  evDifference: number;
  explanation?: string;
}

export interface HandAnalysis {
  handId: string;
  decisionPoints: DecisionPointAnalysis[];
  overallScore: number;
  totalEVLoss: number;
  summary?: string;
}

export interface LeakEntry {
  frameIndex: number;
  street: Street;
  context?: string;
  leakType: string;
  evLoss: number;
  description: string;
  suggestion: string;
}

// ─── Component Props ─────────────────────────────────────────────────

export interface HandReplayerProps {
  replayData: ReplayData;
  analysis?: HandAnalysis;
  leaks?: LeakEntry[];
  onBack?: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────

const STREET_LABELS: Record<string, string> = {
  preflop: 'Pre-Flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const QUALITY_STYLES: Record<DecisionQuality, { badge: string; bg: string; label: string }> = {
  good: {
    badge: 'bg-emerald-500/20 text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    label: '符合 GTO',
  },
  minor_deviation: {
    badge: 'bg-amber-500/20 text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    label: '轻微偏差',
  },
  major_deviation: {
    badge: 'bg-red-500/20 text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
    label: '重大偏差',
  },
};

const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = {
  s: 'text-white',
  h: 'text-red-400',
  d: 'text-red-400',
  c: 'text-white',
};

const formatCard = (card: Card): string => `${card.rank}${SUIT_SYMBOLS[card.suit] ?? ''}`;

const formatAction = (action: string, amount?: number): string => {
  const label = action.charAt(0).toUpperCase() + action.slice(1).replace('_', '-');
  return amount != null && amount > 0 ? `${label} ${amount.toFixed(1)} BB` : label;
};

// ─── Sub-components (inline — ActionTimeline, GTOPanel, ReviewSummary) ──

/** Action timeline: scrollable list of all frames grouped by street */
const ActionTimeline: React.FC<{
  frames: ReplayFrame[];
  currentIndex: number;
  decisionFrameIndices: Set<number>;
  onSeekFrame: (index: number) => void;
}> = ({ frames, currentIndex, decisionFrameIndices, onSeekFrame }) => {
  let lastStreet = '';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700">
        <span className="text-gray-300 text-sm font-semibold">行动时间轴</span>
      </div>
      <div className="max-h-[280px] overflow-y-auto divide-y divide-gray-700/50">
        {frames.map((frame) => {
          const showStreetHeader = frame.street !== lastStreet;
          lastStreet = frame.street;
          const isActive = frame.index === currentIndex;
          const isDecision = decisionFrameIndices.has(frame.index);

          return (
            <React.Fragment key={frame.index}>
              {showStreetHeader && (
                <div className="px-4 py-1.5 bg-gray-900/60 sticky top-0 z-10">
                  <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wide">
                    {STREET_LABELS[frame.street] ?? frame.street}
                  </span>
                </div>
              )}
              <button
                onClick={() => onSeekFrame(frame.index)}
                className={`w-full px-4 py-2 flex items-center gap-2 text-left transition-colors hover:bg-gray-700/40 ${
                  isActive ? 'bg-blue-600/15 border-l-2 border-blue-500' : 'border-l-2 border-transparent'
                }`}
              >
                {isDecision && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                )}
                <span className="text-gray-400 text-xs tabular-nums w-5 shrink-0">{frame.index}</span>
                <span className="text-white text-xs capitalize truncate">
                  {frame.type.replace(/_/g, ' ')}
                </span>
                {frame.action && (
                  <span className="text-gray-500 text-xs ml-auto truncate">
                    {frame.action.playerName ?? `Seat ${frame.action.seat}`}:{' '}
                    {formatAction(frame.action.action, frame.action.amount)}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/** GTO Panel: shows recommendations for the current decision point */
const GTOPanel: React.FC<{
  decision: DecisionPointAnalysis | null;
}> = ({ decision }) => {
  if (!decision) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="text-gray-400 text-xs font-medium mb-2">GTO 分析</div>
        <p className="text-gray-500 text-xs italic">选择一个决策点查看 GTO 推荐</p>
      </div>
    );
  }

  const style = QUALITY_STYLES[decision.quality];
  const BAR_COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500'];

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${style.bg}`}>
      {/* Quality + EV */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge}`}>
          {style.label}
        </span>
        <span className={`text-sm font-bold tabular-nums ${
          decision.evDifference === 0
            ? 'text-emerald-400'
            : decision.evDifference > -0.5
              ? 'text-amber-400'
              : 'text-red-400'
        }`}>
          EV: {decision.evDifference === 0 ? '0' : decision.evDifference.toFixed(2)} BB
        </span>
      </div>

      {/* Side-by-side: Your action vs GTO */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/20 rounded-lg p-3 space-y-1">
          <div className="text-gray-400 text-[10px] font-medium uppercase">你的选择</div>
          <div className="text-white text-sm font-semibold">
            {formatAction(decision.userAction.action, decision.userAction.amount)}
          </div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 space-y-1">
          <div className="text-gray-400 text-[10px] font-medium uppercase">GTO 推荐</div>
          <div className="text-white text-sm font-semibold">
            {decision.gtoRecommendations.length > 0
              ? formatAction(
                  decision.gtoRecommendations[0].action,
                  decision.gtoRecommendations[0].betAmount,
                )
              : '—'}
          </div>
        </div>
      </div>

      {/* Mixed strategy bar */}
      {decision.gtoRecommendations.length > 1 && (
        <div className="space-y-1.5">
          <div className="text-gray-400 text-[10px] font-medium uppercase">混合策略</div>
          <div className="flex items-center gap-0.5 h-3 w-full rounded-full overflow-hidden">
            {decision.gtoRecommendations.map((rec, i) => (
              <div
                key={i}
                className={`h-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                style={{ width: `${rec.frequency * 100}%` }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {decision.gtoRecommendations.map((rec, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`} />
                <span className="text-gray-300 text-xs">
                  {formatAction(rec.action, rec.betAmount)} {(rec.frequency * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      {decision.explanation && (
        <p className="text-gray-400 text-xs leading-relaxed">{decision.explanation}</p>
      )}
    </div>
  );
};

/** Review Summary: overall hand score + leak list */
const ReviewSummary: React.FC<{
  analysis: HandAnalysis;
  leaks?: LeakEntry[];
  onSeekFrame: (index: number) => void;
}> = ({ analysis, leaks, onSeekFrame }) => {
  const scoreColor =
    analysis.overallScore >= 80
      ? 'text-emerald-400'
      : analysis.overallScore >= 50
        ? 'text-amber-400'
        : 'text-red-400';

  const scoreBg =
    analysis.overallScore >= 80
      ? 'bg-emerald-500/10'
      : analysis.overallScore >= 50
        ? 'bg-amber-500/10'
        : 'bg-red-500/10';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      {/* Score header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-700 ${scoreBg}`}>
        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-sm font-semibold">复盘总结</span>
          {analysis.summary && (
            <span className="text-gray-500 text-xs hidden sm:inline truncate max-w-[200px]">
              {analysis.summary}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-bold tabular-nums ${scoreColor}`}>
            {analysis.overallScore}
          </span>
          <span className="text-gray-500 text-xs">/100</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-gray-700 border-b border-gray-700">
        <div className="px-4 py-2.5 flex flex-col items-center">
          <span className="text-gray-500 text-[10px] font-medium uppercase">决策数</span>
          <span className="text-white text-sm font-semibold tabular-nums">
            {analysis.decisionPoints.length}
          </span>
        </div>
        <div className="px-4 py-2.5 flex flex-col items-center">
          <span className="text-gray-500 text-[10px] font-medium uppercase">总 EV 损失</span>
          <span className="text-red-400 text-sm font-semibold tabular-nums">
            -{analysis.totalEVLoss.toFixed(2)} BB
          </span>
        </div>
        <div className="px-4 py-2.5 flex flex-col items-center">
          <span className="text-gray-500 text-[10px] font-medium uppercase">漏洞数</span>
          <span className="text-amber-400 text-sm font-semibold tabular-nums">
            {leaks?.length ?? 0}
          </span>
        </div>
      </div>

      {/* Leaks list */}
      {leaks && leaks.length > 0 && (
        <div className="divide-y divide-gray-700/50">
          {leaks.map((leak, i) => (
            <button
              key={i}
              onClick={() => onSeekFrame(leak.frameIndex)}
              className="w-full px-4 py-3 text-left hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 text-xs font-semibold">
                    -{leak.evLoss.toFixed(2)} BB
                  </span>
                  <span className="text-gray-400 text-xs bg-gray-700 px-1.5 py-0.5 rounded font-medium">
                    {STREET_LABELS[leak.street] ?? leak.street}
                  </span>
                </div>
                <svg
                  className="w-3.5 h-3.5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-white text-xs font-medium">{leak.leakType}</p>
              <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{leak.suggestion}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main HandReplayer Component ─────────────────────────────────────

const HandReplayer: React.FC<HandReplayerProps> = ({
  replayData,
  analysis,
  leaks,
  onBack,
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [showGTOOverlay, setShowGTOOverlay] = useState(true);

  const currentFrame = useMemo(
    () => replayData.frames[currentFrameIndex] ?? null,
    [replayData.frames, currentFrameIndex],
  );

  // Decision point indices for transport controls (only user decision frames)
  const decisionFrameIndices = useMemo(
    () => new Set(replayData.frames.filter((f) => f.isUserDecisionPoint).map((f) => f.index)),
    [replayData.frames],
  );

  const decisionFrameList = useMemo(
    () => replayData.frames.filter((f) => f.isUserDecisionPoint).map((f) => f.index),
    [replayData.frames],
  );

  // Current analysis decision (if on a decision point)
  const currentDecision = useMemo(() => {
    if (!analysis) return null;
    return analysis.decisionPoints.find((d) => d.frameIndex === currentFrameIndex) ?? null;
  }, [analysis, currentFrameIndex]);

  // Build a read-only HandState from the current frame
  const handState: HandState | null = useMemo(() => {
    if (!currentFrame) return null;
    return {
      id: replayData.handId,
      sessionId: '',
      handNumber: 0,
      street: currentFrame.street === 'preflop' ? 'preflop' : currentFrame.street,
      players: currentFrame.tableState.players,
      communityCards: currentFrame.tableState.communityCards,
      pots: [{ amount: currentFrame.tableState.pot, eligiblePlayers: [], isMainPot: true }],
      actionOn: -1, // read-only, no active player
      dealerSeat: 0,
      actions: [],
      isComplete: currentFrame.type === 'award_pot',
    };
  }, [currentFrame, replayData.handId]);

  // Navigation handlers
  const handlePrev = useCallback(
    () => setCurrentFrameIndex((i) => Math.max(0, i - 1)),
    [],
  );
  const handleNext = useCallback(
    () => setCurrentFrameIndex((i) => Math.min(replayData.totalFrames - 1, i + 1)),
    [replayData.totalFrames],
  );
  const handleFirst = useCallback(() => setCurrentFrameIndex(0), []);
  const handleLast = useCallback(
    () => setCurrentFrameIndex(replayData.totalFrames - 1),
    [replayData.totalFrames],
  );
  const handleSeek = useCallback((index: number) => setCurrentFrameIndex(index), []);
  const handleSeekFrame = useCallback((frameIndex: number) => {
    if (frameIndex >= 0 && frameIndex < replayData.totalFrames) {
      setCurrentFrameIndex(frameIndex);
    }
  }, [replayData.totalFrames]);

  // Jump to next/prev decision point
  const handlePrevDecision = useCallback(() => {
    const prev = decisionFrameList.filter((i) => i < currentFrameIndex);
    if (prev.length > 0) setCurrentFrameIndex(prev[prev.length - 1]);
  }, [currentFrameIndex, decisionFrameList]);

  const handleNextDecision = useCallback(() => {
    const next = decisionFrameList.find((i) => i > currentFrameIndex);
    if (next !== undefined) setCurrentFrameIndex(next);
  }, [currentFrameIndex, decisionFrameList]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-white text-lg font-bold">手牌复盘</h1>
            <p className="text-gray-500 text-xs font-mono">#{replayData.handId.slice(0, 8)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* GTO toggle */}
          <button
            onClick={() => setShowGTOOverlay((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showGTOOverlay
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            GTO
          </button>

          {/* Score badge */}
          {analysis && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 text-xs">得分</span>
              <span
                className={`text-lg font-bold tabular-nums ${
                  analysis.overallScore >= 80
                    ? 'text-emerald-400'
                    : analysis.overallScore >= 50
                      ? 'text-amber-400'
                      : 'text-red-400'
                }`}
              >
                {analysis.overallScore}
              </span>
            </div>
          )}

          {/* Decision jump buttons */}
          <div className="flex items-center gap-1 border-l border-gray-700 pl-3">
            <button
              onClick={handlePrevDecision}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
              title="上一个决策点"
              disabled={decisionFrameList.filter((i) => i < currentFrameIndex).length === 0}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-gray-500 text-[10px] px-1">决策</span>
            <button
              onClick={handleNextDecision}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
              title="下一个决策点"
              disabled={decisionFrameList.find((i) => i > currentFrameIndex) === undefined}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main content: 3-column layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Left column: Action Timeline */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <ActionTimeline
            frames={replayData.frames}
            currentIndex={currentFrameIndex}
            decisionFrameIndices={decisionFrameIndices}
            onSeekFrame={handleSeekFrame}
          />
        </div>

        {/* Center column: Poker Table (read-only) + Controls */}
        <div className="lg:col-span-5 order-1 lg:order-2 space-y-4">
          {/* Table area */}
          {handState && (
            <div className="relative">
              {/* Read-only overlay indicator */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-black/60 backdrop-blur-sm text-gray-300 text-[10px] font-medium px-2 py-1 rounded-lg border border-gray-700/50">
                  REPLAY
                </span>
              </div>

              {/* Decision quality indicator on table */}
              {currentDecision && showGTOOverlay && (
                <div className="absolute top-3 right-3 z-10">
                  <span
                    className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${QUALITY_STYLES[currentDecision.quality].badge}`}
                  >
                    {QUALITY_STYLES[currentDecision.quality].label}
                  </span>
                </div>
              )}

              <PokerTable
                handState={handState}
                onPlayerAction={() => {}}
                onNextHand={() => {}}
                onEndSession={() => {}}
                onReplayHand={() => {}}
              />
            </div>
          )}

          {/* Frame info bar */}
          {currentFrame && (
            <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-xs font-semibold uppercase">
                  {STREET_LABELS[currentFrame.street] ?? currentFrame.street}
                </span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-400 text-xs capitalize">
                  {currentFrame.type.replace(/_/g, ' ')}
                </span>
              </div>
              {currentFrame.action && (
                <span className="text-white text-xs">
                  {currentFrame.action.playerName ?? `Seat ${currentFrame.action.seat}`}:{' '}
                  {formatAction(currentFrame.action.action, currentFrame.action.amount)}
                </span>
              )}
            </div>
          )}

          {/* Replay controls */}
          <ReplayControls
            currentIndex={currentFrameIndex}
            totalDecisions={replayData.totalFrames}
            onPrev={handlePrev}
            onNext={handleNext}
            onFirst={handleFirst}
            onLast={handleLast}
            onSeek={handleSeek}
          />
        </div>

        {/* Right column: GTO Panel + Review Summary */}
        <div className="lg:col-span-4 order-3 space-y-4">
          {/* GTO Panel */}
          {showGTOOverlay && <GTOPanel decision={currentDecision} />}

          {/* Review Summary */}
          {analysis && (
            <ReviewSummary
              analysis={analysis}
              leaks={leaks}
              onSeekFrame={handleSeekFrame}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HandReplayer;