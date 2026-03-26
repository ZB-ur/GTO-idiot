import React from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
type Street = 'preflop' | 'flop' | 'turn' | 'river';
type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in' | 'post-blind';
type DeviationStatus = 'correct' | 'deviation';
type PlayerStatus = 'active' | 'folded' | 'all-in' | 'sitting-out';
type HandResultType = 'win' | 'lose' | 'tie';

interface DecisionPlayerState {
  seatIndex: number;
  position: Position;
  chipCount: number;
  status: PlayerStatus;
  currentBet: number;
}

interface GtoActionFrequency {
  actionType: ActionType;
  amount?: number | null;
  frequency: number;
}

interface DecisionAnalysis {
  decisionId: string;
  street: Street;
  userAction: ActionType;
  userActionAmount?: number | null;
  gtoRecommendedAction: ActionType;
  gtoRecommendedAmount?: number | null;
  gtoActionFrequencies?: GtoActionFrequency[];
  deviationStatus: DeviationStatus;
  explanation: string;
}

interface GtoAnalysis {
  handId: string;
  decisionAnalyses: DecisionAnalysis[];
  overallDeviationCount: number;
  overallCorrectCount: number;
}

interface DecisionPoint {
  decisionId: string;
  street: Street;
  userAction: ActionType;
  userActionAmount?: number | null;
  potBeforeAction: number;
  communityCardsAtPoint: Card[];
  playerStates?: DecisionPlayerState[];
}

interface HandRecord {
  handId: string;
  sessionId: string;
  handNumber: number;
  timestamp: string;
  userPosition: Position;
  userHoleCards: Card[];
  communityCards: Card[];
  result: HandResultType;
  profitLoss: number;
  handSummary?: string;
  finalStreet: Street;
  decisionPoints: DecisionPoint[];
}

interface ReplayBoardState {
  street: Street;
  communityCards: Card[];
  pot: number;
  players: DecisionPlayerState[];
}

interface ReplayState {
  handId: string;
  handRecord: HandRecord;
  gtoAnalysis: GtoAnalysis;
  totalDecisionPoints: number;
  currentDecisionIndex: number;
  currentBoardState: ReplayBoardState;
}

interface ReplayScreenProps {
  replayState: ReplayState;
  onDecisionIndexChange: (index: number) => void;
  onBack: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = {
  s: 'text-gray-900',
  h: 'text-red-600',
  d: 'text-red-600',
  c: 'text-gray-900',
};

const STREET_LABELS: Record<Street, string> = {
  preflop: '翻前',
  flop: '翻牌',
  turn: '转牌',
  river: '河牌',
};

const ACTION_LABELS: Record<ActionType, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  bet: 'Bet',
  raise: 'Raise',
  'all-in': 'All-In',
  'post-blind': 'Post Blind',
};

const RESULT_CONFIG: Record<HandResultType, { label: string; color: string }> = {
  win: { label: '胜利', color: 'text-green-500' },
  lose: { label: '失败', color: 'text-red-500' },
  tie: { label: '平局', color: 'text-amber-500' },
};

function formatChips(amount: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${amount}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────

/** Single playing card */
function CardView({ card, size = 'md' }: { card: Card; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-8 h-11 text-xs' : 'w-10 h-14 text-sm';
  return (
    <div
      className={`${sizeClasses} bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col items-center justify-center font-bold ${SUIT_COLORS[card.suit]}`}
    >
      <span>{card.rank}</span>
      <span className="-mt-1">{SUIT_SYMBOLS[card.suit]}</span>
    </div>
  );
}

/** Mini poker table showing board state */
function ReplayBoard({ boardState, userPosition, userHoleCards }: {
  boardState: ReplayBoardState;
  userPosition: Position;
  userHoleCards: Card[];
}) {
  // 6-max seat positions around a table (CSS positions as percentages)
  const SEAT_POSITIONS = [
    { top: '78%', left: '50%' },  // 0: bottom center
    { top: '65%', left: '12%' },  // 1: bottom-left
    { top: '18%', left: '12%' },  // 2: top-left
    { top: '5%', left: '50%' },   // 3: top center
    { top: '18%', left: '88%' },  // 4: top-right
    { top: '65%', left: '88%' },  // 5: bottom-right
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto" style={{ aspectRatio: '16/10' }}>
      {/* Table felt */}
      <div className="absolute inset-4 bg-emerald-800 rounded-[50%] border-4 border-emerald-900 shadow-lg" />

      {/* Pot */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
        <span className="text-emerald-200 text-xs font-medium">Pot</span>
        <div className="text-white font-bold text-lg">{boardState.pot}</div>
      </div>

      {/* Community cards */}
      <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 z-10">
        {boardState.communityCards.map((card, i) => (
          <CardView key={i} card={card} size="sm" />
        ))}
        {/* Empty card placeholders */}
        {Array.from({ length: 5 - boardState.communityCards.length }).map((_, i) => (
          <div key={`empty-${i}`} className="w-8 h-11 rounded-lg border border-emerald-700 bg-emerald-900/40" />
        ))}
      </div>

      {/* Player seats */}
      {boardState.players.map((player, i) => {
        const pos = SEAT_POSITIONS[i];
        const isUser = player.position === userPosition;
        const isFolded = player.status === 'folded';

        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center z-10"
            style={{ top: pos.top, left: pos.left }}
          >
            <div
              className={`px-2 py-1 rounded-lg text-xs font-medium shadow-sm border ${
                isUser
                  ? 'bg-blue-600 text-white border-blue-700'
                  : isFolded
                  ? 'bg-gray-300 text-gray-500 border-gray-400'
                  : 'bg-white text-gray-900 border-gray-200'
              }`}
            >
              <div className="font-bold">{player.position}</div>
              <div className={`text-[10px] ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                {player.status === 'all-in' ? 'ALL-IN' : player.chipCount}
              </div>
            </div>
            {/* User hole cards */}
            {isUser && userHoleCards.length === 2 && (
              <div className="flex gap-0.5 justify-center mt-1">
                {userHoleCards.map((card, ci) => (
                  <CardView key={ci} card={card} size="sm" />
                ))}
              </div>
            )}
            {/* Current bet indicator */}
            {player.currentBet > 0 && (
              <div className="text-[10px] text-amber-400 font-bold mt-0.5">
                {player.currentBet}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Timeline of decision points */
function ReplayTimeline({ totalPoints, currentIndex, analyses, onSelect }: {
  totalPoints: number;
  currentIndex: number;
  analyses: DecisionAnalysis[];
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 w-full">
      {Array.from({ length: totalPoints }).map((_, i) => {
        const analysis = analyses[i];
        const isActive = i === currentIndex;
        const isDeviation = analysis?.deviationStatus === 'deviation';

        return (
          <React.Fragment key={i}>
            {i > 0 && <div className="flex-1 h-0.5 bg-gray-200" />}
            <button
              onClick={() => onSelect(i)}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 ${
                isActive
                  ? isDeviation
                    ? 'bg-red-500 text-white border-red-600 scale-110 shadow-md'
                    : 'bg-green-500 text-white border-green-600 scale-110 shadow-md'
                  : isDeviation
                  ? 'bg-red-100 text-red-600 border-red-300 hover:bg-red-200'
                  : 'bg-green-100 text-green-600 border-green-300 hover:bg-green-200'
              }`}
            >
              {i + 1}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/** Decision point comparison card */
function DecisionPointCard({ analysis }: { analysis: DecisionAnalysis }) {
  const isDeviation = analysis.deviationStatus === 'deviation';

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${
        isDeviation ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            {STREET_LABELS[analysis.street]}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              isDeviation
                ? 'bg-red-500 text-white'
                : 'bg-green-500 text-white'
            }`}
          >
            {isDeviation ? '偏离' : '正确'}
          </span>
        </div>
      </div>

      {/* Action comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-xs text-gray-500 font-medium">你的操作</span>
          <div
            className={`text-base font-bold ${isDeviation ? 'text-red-600' : 'text-green-600'}`}
          >
            {ACTION_LABELS[analysis.userAction]}
            {analysis.userActionAmount != null && analysis.userActionAmount > 0
              ? ` ${analysis.userActionAmount}`
              : ''}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-gray-500 font-medium">GTO 建议</span>
          <div className="text-base font-bold text-blue-600">
            {ACTION_LABELS[analysis.gtoRecommendedAction]}
            {analysis.gtoRecommendedAmount != null && analysis.gtoRecommendedAmount > 0
              ? ` ${analysis.gtoRecommendedAmount}`
              : ''}
          </div>
        </div>
      </div>

      {/* GTO frequencies */}
      {analysis.gtoActionFrequencies && analysis.gtoActionFrequencies.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-gray-500 font-medium">GTO 混合策略</span>
          <div className="space-y-1">
            {analysis.gtoActionFrequencies.map((freq, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-700 w-16 shrink-0">
                  {ACTION_LABELS[freq.actionType]}
                  {freq.amount ? ` ${freq.amount}` : ''}
                </span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${freq.frequency * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">
                  {Math.round(freq.frequency * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <p className="text-sm text-gray-700 leading-relaxed">{analysis.explanation}</p>
    </div>
  );
}

/** Navigation buttons */
function ReplayNavButtons({ currentIndex, totalPoints, onChange }: {
  currentIndex: number;
  totalPoints: number;
  onChange: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => onChange(currentIndex - 1)}
        disabled={currentIndex === 0}
        className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← 上一步
      </button>
      <span className="text-sm text-gray-500">
        {currentIndex + 1} / {totalPoints}
      </span>
      <button
        onClick={() => onChange(currentIndex + 1)}
        disabled={currentIndex === totalPoints - 1}
        className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        下一步 →
      </button>
    </div>
  );
}

/** Approximation disclaimer */
function ApproximationDisclaimer() {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
      <span className="text-amber-500 text-sm mt-0.5">⚠</span>
      <p className="text-xs text-amber-700 leading-relaxed">
        GTO 建议基于简化模型的近似计算，仅供学习参考，不代表精确 GTO 解。实际对局中请结合对手倾向综合判断。
      </p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function ReplayScreen({
  replayState,
  onDecisionIndexChange,
  onBack,
}: ReplayScreenProps) {
  const { handRecord, gtoAnalysis, totalDecisionPoints, currentDecisionIndex, currentBoardState } =
    replayState;

  const currentAnalysis = gtoAnalysis.decisionAnalyses[currentDecisionIndex];
  const resultConfig = RESULT_CONFIG[handRecord.result];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>←</span>
            <span>返回</span>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900">
              Hand #{handRecord.handNumber} 复盘
            </h1>
            <p className="text-xs text-gray-500">
              {handRecord.userPosition} · {handRecord.handSummary}
            </p>
          </div>
          <div className="text-right">
            <span className={`text-sm font-bold ${resultConfig.color}`}>
              {resultConfig.label}
            </span>
            <div
              className={`text-xs font-medium ${
                handRecord.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formatChips(handRecord.profitLoss)} chips
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* GTO Summary Bar */}
        <div className="flex items-center justify-center gap-6 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {gtoAnalysis.overallCorrectCount}/{gtoAnalysis.overallCorrectCount + gtoAnalysis.overallDeviationCount}
            </div>
            <div className="text-xs text-gray-500">GTO 一致</div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {gtoAnalysis.overallCorrectCount}
            </div>
            <div className="text-xs text-gray-500">正确</div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {gtoAnalysis.overallDeviationCount}
            </div>
            <div className="text-xs text-gray-500">偏离</div>
          </div>
        </div>

        {/* Mini poker table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <ReplayBoard
            boardState={currentBoardState}
            userPosition={handRecord.userPosition}
            userHoleCards={handRecord.userHoleCards}
          />
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">决策时间轴</h2>
          <ReplayTimeline
            totalPoints={totalDecisionPoints}
            currentIndex={currentDecisionIndex}
            analyses={gtoAnalysis.decisionAnalyses}
            onSelect={onDecisionIndexChange}
          />
        </div>

        {/* Decision point analysis */}
        {currentAnalysis && <DecisionPointCard analysis={currentAnalysis} />}

        {/* Navigation */}
        <ReplayNavButtons
          currentIndex={currentDecisionIndex}
          totalPoints={totalDecisionPoints}
          onChange={onDecisionIndexChange}
        />

        {/* Disclaimer */}
        <ApproximationDisclaimer />
      </main>
    </div>
  );
}