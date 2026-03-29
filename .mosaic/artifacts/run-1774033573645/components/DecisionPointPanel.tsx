import React from 'react';

// ─── Types ───────────────────────────────────────────────────
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface ActionFrequency {
  actionType: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
  frequency: number;
  sizingBB?: number;
}

interface EVAnalysis {
  playerEV: number;
  gtoOptimalEV: number;
  evLoss: number;
}

type DeviationSeverity = 'none' | 'minor' | 'major';

interface GTOEvaluation {
  gtoActions: ActionFrequency[];
  playerAction: string;
  playerAmount?: number;
  deviationSeverity: DeviationSeverity;
  deviationDescription?: string;
  evAnalysis: EVAnalysis;
}

interface PotInfo {
  mainPot: number;
  sidePots?: { amount: number; eligiblePlayers: number[] }[];
}

interface SnapshotPlayer {
  seatIndex: number;
  name?: string;
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

interface DecisionPoint {
  index: number;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  snapshot: TableSnapshot;
  playerAction: { actionType: string; amount?: number };
  gtoEvaluation: GTOEvaluation;
}

interface DecisionPointPanelProps {
  decisionPoint: DecisionPoint;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────
const STREET_LABELS: Record<string, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const ACTION_LABELS: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All-In',
};

const ACTION_COLORS: Record<string, string> = {
  fold: 'bg-gray-400',
  check: 'bg-blue-400',
  call: 'bg-emerald-500',
  raise: 'bg-amber-500',
  all_in: 'bg-red-500',
};

const SEVERITY_CONFIG: Record<DeviationSeverity, { bg: string; text: string; border: string; label: string; icon: string }> = {
  none: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'GTO Match', icon: '✓' },
  minor: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Minor Deviation', icon: '!' },
  major: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Major Deviation', icon: '✗' },
};

const SUIT_SYMBOLS: Record<string, { char: string; color: string }> = {
  s: { char: '♠', color: 'text-gray-900' },
  h: { char: '♥', color: 'text-red-500' },
  d: { char: '♦', color: 'text-blue-500' },
  c: { char: '♣', color: 'text-emerald-600' },
};

function formatBB(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)} BB`;
}

// ─── Sub-components ──────────────────────────────────────────

/** DeviationBadge — severity indicator pill */
function DeviationBadge({ severity }: { severity: DeviationSeverity }) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className="text-sm leading-none">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

/** GTOFrequencyChart — horizontal bar chart of action frequencies */
function GTOFrequencyChart({
  gtoActions,
  playerAction,
}: {
  gtoActions: ActionFrequency[];
  playerAction: string;
}) {
  const sorted = [...gtoActions].sort((a, b) => b.frequency - a.frequency);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">GTO Frequency Distribution</h4>
      <div className="space-y-1.5">
        {sorted.map((a) => {
          const pct = Math.round(a.frequency * 100);
          const isPlayer = a.actionType === playerAction;
          return (
            <div key={a.actionType} className="flex items-center gap-2">
              <span className={`w-14 text-xs font-medium text-right ${isPlayer ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                {ACTION_LABELS[a.actionType] ?? a.actionType}
              </span>
              <div className="flex-1 h-5 bg-gray-100 rounded-lg overflow-hidden relative">
                <div
                  className={`h-full rounded-lg transition-all ${ACTION_COLORS[a.actionType] ?? 'bg-gray-400'} ${isPlayer ? 'opacity-100' : 'opacity-70'}`}
                  style={{ width: `${Math.max(pct, 1)}%` }}
                />
                {isPlayer && (
                  <div className="absolute inset-y-0 left-0 flex items-center pl-1">
                    <span className="text-[10px] text-white font-bold drop-shadow">YOU</span>
                  </div>
                )}
              </div>
              <span className={`w-10 text-xs text-right ${isPlayer ? 'font-bold text-gray-900' : 'text-gray-400'}`}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** EVAnalysisCard — EV comparison between player and GTO */
function EVAnalysisCard({ evAnalysis }: { evAnalysis: EVAnalysis }) {
  const isLoss = evAnalysis.evLoss > 0;
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">EV Analysis</h4>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-[10px] uppercase text-gray-400 font-medium mb-1">Your EV</p>
          <p className={`text-base font-bold ${evAnalysis.playerEV >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatBB(evAnalysis.playerEV)}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-[10px] uppercase text-gray-400 font-medium mb-1">GTO Optimal</p>
          <p className={`text-base font-bold ${evAnalysis.gtoOptimalEV >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatBB(evAnalysis.gtoOptimalEV)}
          </p>
        </div>
        <div className={`rounded-lg p-3 text-center ${isLoss ? 'bg-red-50' : 'bg-emerald-50'}`}>
          <p className="text-[10px] uppercase text-gray-400 font-medium mb-1">EV Loss</p>
          <p className={`text-base font-bold ${isLoss ? 'text-red-600' : 'text-emerald-600'}`}>
            {isLoss ? `-${evAnalysis.evLoss.toFixed(2)} BB` : '0.00 BB'}
          </p>
        </div>
      </div>
    </div>
  );
}

/** CardDisplay — renders a single card */
function CardDisplay({ card }: { card: Card }) {
  const suit = SUIT_SYMBOLS[card.suit];
  return (
    <span className={`inline-flex items-center justify-center w-8 h-10 bg-white border border-gray-200 rounded shadow-sm text-sm font-bold ${suit?.color ?? ''}`}>
      {card.rank}{suit?.char ?? card.suit}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function DecisionPointPanel({ decisionPoint, className = '' }: DecisionPointPanelProps) {
  const { index, street, snapshot, playerAction, gtoEvaluation } = decisionPoint;
  const { deviationSeverity, deviationDescription, gtoActions, evAnalysis } = gtoEvaluation;
  const severityCfg = SEVERITY_CONFIG[deviationSeverity];

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${severityCfg.bg} ${severityCfg.border}`}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
          <span className="text-sm font-semibold text-gray-900">{STREET_LABELS[street] ?? street}</span>
          {snapshot.communityCards.length > 0 && (
            <div className="flex gap-1">
              {snapshot.communityCards.map((c, i) => (
                <CardDisplay key={i} card={c} />
              ))}
            </div>
          )}
        </div>
        <DeviationBadge severity={deviationSeverity} />
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Context bar: pot + player action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">Pot:</span>
            <span className="font-semibold text-gray-900">{snapshot.pot.mainPot} BB</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">You chose:</span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white ${ACTION_COLORS[playerAction.actionType] ?? 'bg-gray-500'}`}>
              {ACTION_LABELS[playerAction.actionType] ?? playerAction.actionType}
              {playerAction.amount != null && playerAction.amount > 0 && ` ${playerAction.amount} BB`}
            </span>
          </div>
        </div>

        {/* Frequency Chart */}
        <GTOFrequencyChart gtoActions={gtoActions} playerAction={playerAction.actionType} />

        {/* Deviation description */}
        {deviationDescription && deviationSeverity !== 'none' && (
          <div className={`flex items-start gap-2 px-4 py-3 rounded-lg border text-sm ${severityCfg.bg} ${severityCfg.border} ${severityCfg.text}`}>
            <span className="font-bold mt-0.5">{severityCfg.icon}</span>
            <p>{deviationDescription}</p>
          </div>
        )}

        {/* EV Analysis */}
        <EVAnalysisCard evAnalysis={evAnalysis} />
      </div>
    </div>
  );
}