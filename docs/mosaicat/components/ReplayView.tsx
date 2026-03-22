import React, { useState, useMemo } from 'react';

export interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

export interface ReplayAction {
  playerId: string;
  playerName?: string;
  position?: string;
  action: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
  amount?: number;
  isPlayerAction: boolean;
  gtoAnalysis?: {
    deviation: 'match' | 'minor' | 'major';
    actualActionFrequency?: number;
    recommendedActions: Array<{ action: string; frequency: number; sizing?: string }>;
    explanation?: string;
    scenario?: string;
  };
}

export interface ReplayStreet {
  street: string;
  communityCards?: Card[];
  pot?: number;
  actions: ReplayAction[];
}

export interface HandRecord {
  handId: string;
  playedAt: string;
  blindLevel: string;
  dealerPosition?: string;
  players: Array<{
    playerId: string;
    name: string;
    position: string;
    startingStack: number;
    holeCards: [Card, Card];
    isHuman: boolean;
    botStyle?: string;
  }>;
  streets: Array<{
    street: string;
    communityCards?: Card[];
    actions: Array<{
      playerId: string;
      playerName?: string;
      position?: string;
      action: string;
      amount?: number;
      street: string;
      potAfter?: number;
      timestamp?: number;
    }>;
    potAtStart: number;
    potAtEnd?: number;
  }>;
  result: {
    winners: Array<{ playerId: string; amount: number; handRank?: string; bestFiveCards?: Card[] }>;
    playerProfit: number;
  };
}

export interface HandReplay {
  handId: string;
  handRecord: HandRecord;
  streets: ReplayStreet[];
  overallCompliance: number;
}

interface ReplayViewProps {
  replay: HandReplay;
  onBack: () => void;
  onNextHand?: () => void;
  onPrevHand?: () => void;
}

const streetOrder = ['preflop', 'flop', 'turn', 'river'];

const suitSymbols: Record<string, { symbol: string; color: string }> = {
  s: { symbol: '♠', color: 'text-gray-900' },
  h: { symbol: '♥', color: 'text-red-600' },
  d: { symbol: '♦', color: 'text-red-600' },
  c: { symbol: '♣', color: 'text-gray-900' },
};

const deviationBadge: Record<string, { label: string; bg: string; text: string }> = {
  match: { label: 'GTO Match', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  minor: { label: 'Minor Deviation', bg: 'bg-amber-100', text: 'text-amber-700' },
  major: { label: 'Major Deviation', bg: 'bg-red-100', text: 'text-red-700' },
};

const ReplayView: React.FC<ReplayViewProps> = ({ replay, onBack, onNextHand, onPrevHand }) => {
  const [activeStreetIndex, setActiveStreetIndex] = useState(0);

  const activeStreet = replay.streets[activeStreetIndex];
  const record = replay.handRecord;

  const compliancePercent = Math.round(replay.overallCompliance * 100);
  const complianceColor =
    compliancePercent >= 70 ? 'text-emerald-600' : compliancePercent >= 40 ? 'text-amber-500' : 'text-red-500';

  const playerDecisions = useMemo(() => {
    return replay.streets.flatMap((s) => s.actions.filter((a) => a.isPlayerAction && a.gtoAnalysis));
  }, [replay.streets]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Hand Replay</h2>
            <p className="text-sm text-gray-500">
              {record.blindLevel} &middot; {new Date(record.playedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onPrevHand && (
            <button onClick={onPrevHand} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
              ← Prev
            </button>
          )}
          {onNextHand && (
            <button onClick={onNextHand} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Compliance + Result summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <div className={`text-3xl font-bold ${complianceColor}`}>{compliancePercent}%</div>
          <div className="text-xs text-gray-500 mt-1">GTO Compliance</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <div className={`text-3xl font-bold ${record.result.playerProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {record.result.playerProfit >= 0 ? '+' : ''}{record.result.playerProfit}
          </div>
          <div className="text-xs text-gray-500 mt-1">Profit / Loss</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{playerDecisions.length}</div>
          <div className="text-xs text-gray-500 mt-1">Decisions Analyzed</div>
        </div>
      </div>

      {/* Players (with bot styles revealed) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {record.players.map((p) => {
            const suit = suitSymbols[p.holeCards[0].suit];
            const suit2 = suitSymbols[p.holeCards[1].suit];
            return (
              <div
                key={p.playerId}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  p.isHuman ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex gap-0.5">
                  <span className={`text-xs font-bold ${suit.color}`}>{p.holeCards[0].rank}{suit.symbol}</span>
                  <span className={`text-xs font-bold ${suit2.color}`}>{p.holeCards[1].rank}{suit2.symbol}</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900">{p.name}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400">{p.position}</span>
                    {p.botStyle && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-slate-200 text-slate-600 font-medium">
                        {p.botStyle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Street Navigator */}
      <div className="flex gap-2">
        {replay.streets.map((street, i) => {
          const isActive = i === activeStreetIndex;
          const hasDeviation = street.actions.some(
            (a) => a.isPlayerAction && a.gtoAnalysis && a.gtoAnalysis.deviation !== 'match'
          );
          return (
            <button
              key={street.street}
              onClick={() => setActiveStreetIndex(i)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg border capitalize transition-colors ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {street.street}
              {hasDeviation && !isActive && (
                <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Community cards for active street */}
      {activeStreet.communityCards && activeStreet.communityCards.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Board:</span>
          <div className="flex gap-1">
            {activeStreet.communityCards.map((card, i) => {
              const s = suitSymbols[card.suit];
              return (
                <span
                  key={i}
                  className={`inline-flex items-center justify-center w-9 h-12 rounded-md bg-white border border-gray-200 shadow-sm text-xs font-bold ${s.color}`}
                >
                  {card.rank}{s.symbol}
                </span>
              );
            })}
          </div>
          {activeStreet.pot && (
            <span className="ml-auto text-sm text-gray-500">
              Pot: <span className="font-bold text-gray-900">${activeStreet.pot}</span>
            </span>
          )}
        </div>
      )}

      {/* Action Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 capitalize">{activeStreet.street} Actions</h3>
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200" />
          <div className="space-y-3">
            {activeStreet.actions.map((action, index) => {
              const deviation = action.gtoAnalysis?.deviation;
              const badge = deviation ? deviationBadge[deviation] : null;
              const isPlayer = action.isPlayerAction;

              return (
                <div key={index} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-6 top-2.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                      deviation === 'match' ? 'bg-emerald-500' : deviation === 'minor' ? 'bg-amber-400' : deviation === 'major' ? 'bg-red-500' : isPlayer ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                  <div
                    className={`flex-1 rounded-lg border p-3 ${
                      isPlayer && deviation === 'match' ? 'bg-emerald-50 border-emerald-300' :
                      isPlayer && deviation === 'minor' ? 'bg-amber-50 border-amber-300' :
                      isPlayer && deviation === 'major' ? 'bg-red-50 border-red-300' :
                      isPlayer ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-400 w-8">{action.position || '—'}</span>
                        <span className={`text-sm font-semibold ${isPlayer ? 'text-gray-900' : 'text-gray-600'}`}>
                          {action.playerName || action.playerId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${
                          action.action === 'fold' ? 'text-gray-400' :
                          action.action === 'raise' || action.action === 'all_in' ? 'text-red-600' :
                          action.action === 'call' ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {action.action === 'all_in' ? 'All-In' : action.action.charAt(0).toUpperCase() + action.action.slice(1)}
                        </span>
                        {action.amount != null && <span className="text-sm font-mono text-gray-500">${action.amount}</span>}
                      </div>
                    </div>
                    {isPlayer && badge && action.gtoAnalysis && (
                      <div className="mt-2 pt-2 border-t border-gray-200/60">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                          {deviation === 'match' ? '✓' : deviation === 'minor' ? '~' : '✗'} {badge.label}
                        </span>
                        {action.gtoAnalysis.explanation && (
                          <p className="text-xs text-gray-500 mt-1">{action.gtoAnalysis.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GTO Comparison summary cards */}
      {playerDecisions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {playerDecisions.map((decision, i) => {
            const dev = decision.gtoAnalysis!;
            const badge = deviationBadge[dev.deviation];
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {decision.position} — {decision.action}{decision.amount ? ` $${decision.amount}` : ''}
                  </span>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="space-y-1">
                  {dev.recommendedActions.map((rec, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            dev.deviation === 'match' ? 'bg-emerald-400' : dev.deviation === 'minor' ? 'bg-amber-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${rec.frequency * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-16">{rec.action}</span>
                      <span className="text-xs font-mono text-gray-400 w-10 text-right">{(rec.frequency * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
                {dev.explanation && <p className="text-xs text-gray-500 mt-2">{dev.explanation}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReplayView;