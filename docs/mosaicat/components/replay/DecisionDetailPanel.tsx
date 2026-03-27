import React from 'react';

export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'bet' | 'all_in';
export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

export interface DecisionDetail {
  decisionIndex: number;
  street: Street;
  position: Position;
  holeCards: Card[];
  communityCards: Card[];
  potSize: number;
  stackSize: number;
  facingBet?: number | null;
  userAction: {
    actionType: ActionType;
    amount?: number | null;
    label: string;
  };
  gtoAction: {
    actionType: ActionType;
    amount?: number | null;
    label: string;
  };
  rating: 'optimal' | 'acceptable' | 'error';
  evDifferenceBB?: number | null;
  isApproximate: boolean;
  confidenceLevel?: 'exact' | 'approximate';
  explanation: string;
  gtoUnavailable?: boolean;
  gtoUnavailableReason?: string | null;
}

interface DecisionDetailPanelProps {
  decision: DecisionDetail | null;
}

const RATING_CONFIG: Record<string, { icon: string; label: string; color: string; bg: string; border: string }> = {
  optimal: { icon: '✅', label: '最优', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  acceptable: { icon: '⚠️', label: '可接受', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  error: { icon: '❌', label: '错误', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const STREET_LABELS: Record<Street, string> = {
  preflop: '翻前',
  flop: '翻牌',
  turn: '转牌',
  river: '河牌',
};

const SUIT_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  s: { symbol: '♠', color: 'text-gray-100' },
  h: { symbol: '♥', color: 'text-red-500' },
  d: { symbol: '♦', color: 'text-red-500' },
  c: { symbol: '♣', color: 'text-gray-100' },
};

const CardDisplay: React.FC<{ card: Card }> = ({ card }) => {
  const suit = SUIT_SYMBOLS[card.suit];
  return (
    <span className={`inline-flex items-center gap-0.5 font-mono font-bold text-sm ${suit.color}`}>
      {card.rank}{suit.symbol}
    </span>
  );
};

export const DecisionDetailPanel: React.FC<DecisionDetailPanelProps> = ({ decision }) => {
  if (!decision) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
        <div className="text-center text-gray-500 py-8">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-sm">选择一个决策点查看详细分析</p>
        </div>
      </div>
    );
  }

  const ratingCfg = RATING_CONFIG[decision.rating];

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header with rating */}
      <div className={`px-4 py-3 border-b border-gray-800 flex items-center justify-between ${ratingCfg.bg}`}>
        <h3 className="text-sm font-semibold text-gray-50">
          决策分析 #{decision.decisionIndex + 1}
        </h3>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${ratingCfg.bg} ${ratingCfg.color} ${ratingCfg.border}`}>
          {ratingCfg.icon} {ratingCfg.label}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Context info */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-gray-800 rounded-lg text-gray-300">
            {STREET_LABELS[decision.street]}
          </span>
          <span className="px-2 py-1 bg-gray-800 rounded-lg text-gray-300">
            {decision.position}
          </span>
          <span className="px-2 py-1 bg-gray-800 rounded-lg text-gray-300">
            底池 {decision.potSize}
          </span>
          <span className="px-2 py-1 bg-gray-800 rounded-lg text-gray-300">
            筹码 {decision.stackSize}
          </span>
          {decision.facingBet != null && (
            <span className="px-2 py-1 bg-gray-800 rounded-lg text-gray-300">
              面对 {decision.facingBet}
            </span>
          )}
        </div>

        {/* Cards display */}
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-500 text-xs block mb-1">手牌</span>
            <div className="flex gap-1">
              {decision.holeCards.map((card, i) => (
                <span key={i} className="bg-gray-800 px-1.5 py-0.5 rounded">
                  <CardDisplay card={card} />
                </span>
              ))}
            </div>
          </div>
          {decision.communityCards.length > 0 && (
            <div>
              <span className="text-gray-500 text-xs block mb-1">公共牌</span>
              <div className="flex gap-1">
                {decision.communityCards.map((card, i) => (
                  <span key={i} className="bg-gray-800 px-1.5 py-0.5 rounded">
                    <CardDisplay card={card} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GTO unavailable notice */}
        {decision.gtoUnavailable && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 text-sm">⚠️</span>
              <div>
                <p className="text-xs text-yellow-400 font-medium">GTO数据不可用</p>
                {decision.gtoUnavailableReason && (
                  <p className="text-xs text-gray-400 mt-0.5">{decision.gtoUnavailableReason}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User vs GTO comparison */}
        {!decision.gtoUnavailable && (
          <div className="grid grid-cols-2 gap-3">
            {/* User choice */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 space-y-1.5">
              <span className="text-xs text-gray-500">你的选择</span>
              <p className="text-sm font-semibold text-gray-50">{decision.userAction.label}</p>
            </div>

            {/* GTO recommendation */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 space-y-1.5">
              <span className="text-xs text-amber-400/70">GTO推荐</span>
              <p className="text-sm font-semibold text-amber-400">{decision.gtoAction.label}</p>
            </div>
          </div>
        )}

        {/* EV Difference */}
        {decision.evDifferenceBB != null && (
          <div className="flex items-center justify-between bg-gray-800/30 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-400">EV差异</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-semibold ${decision.evDifferenceBB < 0 ? 'text-red-400' : decision.evDifferenceBB > 0 ? 'text-emerald-400' : 'text-gray-300'}`}>
                {decision.evDifferenceBB > 0 ? '+' : ''}{decision.evDifferenceBB.toFixed(1)} BB
              </span>
              {decision.isApproximate && (
                <span className="px-1.5 py-0.5 bg-gray-700 rounded text-[10px] text-gray-400 font-medium">
                  近似
                </span>
              )}
            </div>
          </div>
        )}

        {/* Explanation */}
        <div className="border-t border-gray-800 pt-3">
          <p className="text-sm text-gray-300 leading-relaxed">{decision.explanation}</p>
        </div>
      </div>
    </div>
  );
};