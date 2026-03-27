import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// --- Types ---

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

type Street = 'preflop' | 'flop' | 'turn' | 'river';
type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'bet' | 'all_in';
type Rating = 'optimal' | 'acceptable' | 'error';

interface StreetAction {
  playerId: string;
  nickname: string;
  actionType: ActionType;
  amount?: number | null;
  sequenceIndex: number;
  potAfter: number;
  isUserAction?: boolean;
}

interface DecisionSummary {
  decisionIndex: number;
  street: Street;
  sequenceIndex: number;
  userAction: { actionType: ActionType; amount?: number | null };
  gtoAction: { actionType: ActionType; amount?: number | null };
  rating: Rating;
  evDifferenceBB?: number | null;
  isApproximate?: boolean;
}

interface DecisionDetail {
  decisionIndex: number;
  street: Street;
  position: string;
  holeCards: Card[];
  communityCards: Card[];
  potSize: number;
  stackSize: number;
  facingBet?: number | null;
  userAction: { actionType: ActionType; amount?: number | null; label: string };
  gtoAction: { actionType: ActionType; amount?: number | null; label: string };
  rating: Rating;
  evDifferenceBB?: number | null;
  isApproximate?: boolean;
  confidenceLevel: 'exact' | 'approximate';
  explanation: string;
  gtoUnavailable?: boolean;
  gtoUnavailableReason?: string | null;
}

interface HandReplay {
  handId: string;
  handNumber: number;
  playedAt: string;
  holeCards: Card[];
  resultBB: number;
  communityCards: {
    flop: Card[] | null;
    turn: Card | null;
    river: Card | null;
  };
  streets: {
    preflop: StreetAction[];
    flop?: StreetAction[] | null;
    turn?: StreetAction[] | null;
    river?: StreetAction[] | null;
  };
  decisions: DecisionSummary[];
  overallRating: {
    optimalCount: number;
    acceptableCount: number;
    errorCount: number;
    totalDecisions: number;
  };
}

// --- Helpers ---

const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = {
  s: 'text-gray-100',
  h: 'text-red-500',
  d: 'text-red-500',
  c: 'text-gray-100',
};

const STREET_LABELS: Record<Street, string> = {
  preflop: '翻前',
  flop: '翻牌',
  turn: '转牌',
  river: '河牌',
};

const ACTION_LABELS: Record<ActionType, string> = {
  fold: '弃牌',
  check: '过牌',
  call: '跟注',
  raise: '加注',
  bet: '下注',
  all_in: '全下',
};

const RATING_CONFIG: Record<Rating, { icon: string; label: string; color: string; bg: string }> = {
  optimal: { icon: '✅', label: '最优', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  acceptable: { icon: '⚠️', label: '可接受', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  error: { icon: '❌', label: '错误', color: 'text-red-500', bg: 'bg-red-500/10' },
};

function formatCard(card: Card): { rank: string; suit: string; colorClass: string } {
  return {
    rank: card.rank,
    suit: SUIT_SYMBOLS[card.suit],
    colorClass: SUIT_COLORS[card.suit],
  };
}

function formatAction(actionType: ActionType, amount?: number | null): string {
  const label = ACTION_LABELS[actionType];
  if (amount != null && ['raise', 'bet', 'call', 'all_in'].includes(actionType)) {
    return `${label} ${amount}`;
  }
  return label;
}

// --- Sub-components ---

function CardDisplay({ card, size = 'md' }: { card: Card; size?: 'sm' | 'md' | 'lg' }) {
  const { rank, suit, colorClass } = formatCard(card);
  const sizeClasses = {
    sm: 'w-8 h-11 text-xs',
    md: 'w-10 h-14 text-sm',
    lg: 'w-12 h-16 text-base',
  };
  return (
    <div
      className={`${sizeClasses[size]} bg-white rounded-lg shadow-md flex flex-col items-center justify-center font-bold ${colorClass}`}
    >
      <span>{rank}</span>
      <span className="-mt-1">{suit}</span>
    </div>
  );
}

function ReplayLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 p-6 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 bg-gray-800 rounded-lg w-48" />
        <div className="h-64 bg-gray-900 rounded-xl" />
        <div className="h-12 bg-gray-900 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-900 rounded-xl" />
          <div className="h-48 bg-gray-900 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function NoDecisionMessage() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
      <div className="text-4xl mb-3">🃏</div>
      <p className="text-gray-400 text-sm">本手牌没有需要评估的决策点</p>
      <p className="text-gray-500 text-xs mt-1">可能您在翻前就弃牌了</p>
    </div>
  );
}

function BackToListButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 text-gray-400 hover:text-amber-500 transition-colors text-sm"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      返回手牌列表
    </button>
  );
}

function ReplayTableView({
  holeCards,
  communityCards,
  activeStreet,
}: {
  holeCards: Card[];
  communityCards: HandReplay['communityCards'];
  activeStreet: Street;
}) {
  const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river'];
  const activeIdx = streetOrder.indexOf(activeStreet);

  const visibleCommunity: Card[] = [];
  if (communityCards.flop && activeIdx >= 1) {
    visibleCommunity.push(...communityCards.flop);
  }
  if (communityCards.turn && activeIdx >= 2) {
    visibleCommunity.push(communityCards.turn);
  }
  if (communityCards.river && activeIdx >= 3) {
    visibleCommunity.push(communityCards.river);
  }

  return (
    <div className="bg-emerald-900 border-2 border-emerald-700 rounded-xl p-6 relative overflow-hidden">
      {/* Felt texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      <div className="relative flex flex-col items-center gap-4">
        {/* Community cards */}
        <div className="flex items-center gap-2 min-h-[56px]">
          {visibleCommunity.length > 0 ? (
            visibleCommunity.map((card, i) => <CardDisplay key={i} card={card} size="md" />)
          ) : (
            <span className="text-emerald-700 text-sm italic">等待公共牌</span>
          )}
        </div>

        {/* Divider */}
        <div className="w-32 h-px bg-emerald-700/50" />

        {/* Hole cards */}
        <div className="flex items-center gap-2">
          <span className="text-emerald-400/70 text-xs mr-2">你的手牌</span>
          {holeCards.map((card, i) => (
            <CardDisplay key={i} card={card} size="md" />
          ))}
        </div>
      </div>
    </div>
  );
}

function StreetTimeline({
  streets,
  activeStreet,
  decisions,
  onStreetClick,
}: {
  streets: HandReplay['streets'];
  activeStreet: Street;
  decisions: DecisionSummary[];
  onStreetClick: (street: Street) => void;
}) {
  const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river'];
  const availableStreets = streetOrder.filter(
    (s) => streets[s] != null && (streets[s] as StreetAction[]).length > 0
  );

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-1">
        {availableStreets.map((street, idx) => {
          const isActive = street === activeStreet;
          const streetDecisions = decisions.filter((d) => d.street === street);
          const hasError = streetDecisions.some((d) => d.rating === 'error');
          const hasAcceptable = streetDecisions.some((d) => d.rating === 'acceptable');

          let dotColor = 'bg-gray-600';
          if (hasError) dotColor = 'bg-red-500';
          else if (hasAcceptable) dotColor = 'bg-yellow-500';
          else if (streetDecisions.length > 0) dotColor = 'bg-emerald-500';

          return (
            <div key={street} className="flex items-center">
              <button
                onClick={() => onStreetClick(street)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gray-800 text-amber-500 font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                <span className="text-sm">{STREET_LABELS[street]}</span>
              </button>
              {idx < availableStreets.length - 1 && (
                <div className="w-6 h-px bg-gray-700 mx-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionSequencePanel({
  actions,
  decisions,
  selectedDecision,
  onSelectDecision,
}: {
  actions: StreetAction[];
  decisions: DecisionSummary[];
  selectedDecision: number | null;
  onSelectDecision: (index: number) => void;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-gray-50 font-semibold text-sm mb-3">行动序列</h3>
      <div className="space-y-1.5">
        {actions.map((action, i) => {
          const decision = decisions.find((d) => d.sequenceIndex === action.sequenceIndex);
          const isSelected = decision != null && decision.decisionIndex === selectedDecision;
          const ratingCfg = decision ? RATING_CONFIG[decision.rating] : null;

          return (
            <button
              key={i}
              onClick={() => decision && onSelectDecision(decision.decisionIndex)}
              disabled={!decision}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                isSelected
                  ? 'bg-amber-500/10 border border-amber-500/30'
                  : decision
                    ? 'hover:bg-gray-800 cursor-pointer border border-transparent'
                    : 'opacity-60 cursor-default border border-transparent'
              }`}
            >
              {/* Player & action */}
              <span
                className={`text-xs font-medium w-16 truncate ${
                  action.isUserAction ? 'text-amber-500' : 'text-gray-400'
                }`}
              >
                {action.nickname}
              </span>
              <span className="text-gray-50 text-sm flex-1">
                {formatAction(action.actionType, action.amount)}
              </span>
              <span className="text-gray-500 text-xs">pot {action.potAfter}</span>

              {/* Rating badge */}
              {ratingCfg && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${ratingCfg.bg} ${ratingCfg.color}`}>
                  {ratingCfg.icon} {ratingCfg.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DecisionDetailPanel({
  detail,
  isLoading,
}: {
  detail: DecisionDetail | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
        <div className="h-5 bg-gray-800 rounded w-32 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-800 rounded w-3/4" />
          <div className="h-4 bg-gray-800 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500 text-sm">点击左侧行动查看决策详情</p>
      </div>
    );
  }

  const ratingCfg = RATING_CONFIG[detail.rating];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-50 font-semibold text-sm">
          决策 #{detail.decisionIndex + 1} — {STREET_LABELS[detail.street]}
        </h3>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${ratingCfg.bg} ${ratingCfg.color}`}>
          {ratingCfg.icon} {ratingCfg.label}
        </span>
      </div>

      {/* Context info */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="bg-gray-800 rounded-lg p-2.5 text-center">
          <div className="text-gray-500 mb-0.5">位置</div>
          <div className="text-gray-50 font-semibold">{detail.position}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-2.5 text-center">
          <div className="text-gray-500 mb-0.5">底池</div>
          <div className="text-gray-50 font-semibold">{detail.potSize} BB</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-2.5 text-center">
          <div className="text-gray-500 mb-0.5">剩余</div>
          <div className="text-gray-50 font-semibold">{detail.stackSize} BB</div>
        </div>
      </div>

      {/* Action comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-500 text-xs mb-1.5">你的行动</div>
          <div className="text-gray-50 font-semibold text-sm">{detail.userAction.label}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-gray-500 text-xs mb-1.5">GTO 推荐</div>
          <div className="text-amber-500 font-semibold text-sm">{detail.gtoAction.label}</div>
        </div>
      </div>

      {/* EV difference */}
      {detail.evDifferenceBB != null && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">EV 差异:</span>
          <span
            className={
              detail.evDifferenceBB < 0
                ? 'text-red-500 font-semibold'
                : detail.evDifferenceBB > 0
                  ? 'text-emerald-500 font-semibold'
                  : 'text-gray-400'
            }
          >
            {detail.evDifferenceBB > 0 ? '+' : ''}
            {detail.evDifferenceBB.toFixed(1)} BB
          </span>
          {detail.isApproximate && (
            <span className="text-gray-600 italic">(近似值)</span>
          )}
        </div>
      )}

      {/* Explanation */}
      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
        <p className="text-gray-300 text-sm leading-relaxed">{detail.explanation}</p>
      </div>

      {/* Confidence badge */}
      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            detail.confidenceLevel === 'exact'
              ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-sky-400/10 text-sky-400'
          }`}
        >
          {detail.confidenceLevel === 'exact' ? '精确数据' : '近似参考'}
        </span>
        {detail.gtoUnavailable && (
          <span className="text-xs text-gray-500">{detail.gtoUnavailableReason}</span>
        )}
      </div>
    </div>
  );
}

// --- Main Page ---

export default function HandReplayPage() {
  const { handId } = useParams<{ handId: string }>();
  const navigate = useNavigate();

  const [replay, setReplay] = useState<HandReplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeStreet, setActiveStreet] = useState<Street>('preflop');
  const [selectedDecision, setSelectedDecision] = useState<number | null>(null);
  const [decisionDetail, setDecisionDetail] = useState<DecisionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch replay data
  useEffect(() => {
    if (!handId) return;
    setLoading(true);
    fetch(`/api/hands/${handId}/replay`)
      .then((res) => {
        if (!res.ok) throw new Error('手牌不存在');
        return res.json();
      })
      .then((data: HandReplay) => {
        setReplay(data);
        // Default to first street that has actions
        const firstStreet: Street =
          (['preflop', 'flop', 'turn', 'river'] as Street[]).find(
            (s) => data.streets[s] && (data.streets[s] as StreetAction[]).length > 0
          ) ?? 'preflop';
        setActiveStreet(firstStreet);
        // Auto-select first decision if exists
        if (data.decisions.length > 0) {
          setSelectedDecision(data.decisions[0].decisionIndex);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [handId]);

  // Fetch decision detail
  useEffect(() => {
    if (!handId || selectedDecision == null) {
      setDecisionDetail(null);
      return;
    }
    setDetailLoading(true);
    fetch(`/api/hands/${handId}/replay/decisions/${selectedDecision}`)
      .then((res) => res.json())
      .then((data: DecisionDetail) => setDecisionDetail(data))
      .catch(() => setDecisionDetail(null))
      .finally(() => setDetailLoading(false));
  }, [handId, selectedDecision]);

  if (loading) return <ReplayLoadingSkeleton />;

  if (error || !replay) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-500 text-lg font-semibold">加载失败</p>
          <p className="text-gray-500 text-sm">{error ?? '未知错误'}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-amber-500 hover:text-amber-400 text-sm underline"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const currentActions = (replay.streets[activeStreet] as StreetAction[] | null) ?? [];
  const streetDecisions = replay.decisions.filter((d) => d.street === activeStreet);
  const { overallRating } = replay;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <BackToListButton onClick={() => navigate('/hands')} />
          <div className="flex items-center gap-4">
            {/* Overall rating summary */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-500">✅ {overallRating.optimalCount}</span>
              <span className="text-yellow-500">⚠️ {overallRating.acceptableCount}</span>
              <span className="text-red-500">❌ {overallRating.errorCount}</span>
            </div>
            {/* Result badge */}
            <div
              className={`text-sm font-bold px-3 py-1 rounded-full ${
                replay.resultBB >= 0
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-red-500/10 text-red-500'
              }`}
            >
              {replay.resultBB >= 0 ? '+' : ''}
              {replay.resultBB} BB
            </div>
          </div>
        </div>

        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold text-gray-50">
            手牌 #{replay.handNumber} 复盘
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            {new Date(replay.playedAt).toLocaleString('zh-CN')}
          </p>
        </div>

        {/* Table view */}
        <ReplayTableView
          holeCards={replay.holeCards}
          communityCards={replay.communityCards}
          activeStreet={activeStreet}
        />

        {/* Street timeline */}
        <StreetTimeline
          streets={replay.streets}
          activeStreet={activeStreet}
          decisions={replay.decisions}
          onStreetClick={setActiveStreet}
        />

        {/* Action + Decision panels */}
        {replay.decisions.length === 0 ? (
          <NoDecisionMessage />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ActionSequencePanel
              actions={currentActions}
              decisions={streetDecisions}
              selectedDecision={selectedDecision}
              onSelectDecision={setSelectedDecision}
            />
            <DecisionDetailPanel detail={decisionDetail} isLoading={detailLoading} />
          </div>
        )}
      </div>
    </div>
  );
}