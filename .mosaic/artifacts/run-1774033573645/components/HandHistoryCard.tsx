import React from 'react';

// Types matching API schema
export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface HandListItem {
  id: string;
  sessionId: string;
  handNumber: number;
  humanPosition: Position;
  profitLossBB: number;
  scenarioTags: string[];
  showdown?: boolean;
  createdAt: string;
}

export interface HandHistoryCardProps {
  hand: HandListItem;
  onReplay: (handId: string) => void;
  onExport: (handId: string) => void;
}

const SCENARIO_LABELS: Record<string, string> = {
  open_raise: 'Open Raise',
  '3bet_pot': '3-Bet Pot',
  '4bet_pot': '4-Bet Pot',
  single_raised_pot: 'SRP',
  limp_pot: 'Limp Pot',
  river_bluff: 'River Bluff',
  check_raise: 'Check-Raise',
  all_in_preflop: 'All-In Pre',
};

const SCENARIO_COLORS: Record<string, { bg: string; text: string }> = {
  open_raise: { bg: 'bg-blue-50', text: 'text-blue-700' },
  '3bet_pot': { bg: 'bg-purple-50', text: 'text-purple-700' },
  '4bet_pot': { bg: 'bg-red-50', text: 'text-red-700' },
  single_raised_pot: { bg: 'bg-slate-100', text: 'text-slate-600' },
  limp_pot: { bg: 'bg-gray-100', text: 'text-gray-600' },
  river_bluff: { bg: 'bg-amber-50', text: 'text-amber-700' },
  check_raise: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  all_in_preflop: { bg: 'bg-rose-50', text: 'text-rose-700' },
};

const POSITION_COLORS: Record<Position, string> = {
  UTG: 'bg-slate-100 text-slate-700',
  HJ: 'bg-slate-100 text-slate-700',
  CO: 'bg-blue-50 text-blue-700',
  BTN: 'bg-emerald-50 text-emerald-700',
  SB: 'bg-amber-50 text-amber-700',
  BB: 'bg-amber-50 text-amber-700',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

function formatProfit(bb: number): string {
  const sign = bb >= 0 ? '+' : '';
  return `${sign}${bb.toFixed(1)} BB`;
}

export const HandHistoryCard: React.FC<HandHistoryCardProps> = ({
  hand,
  onReplay,
  onExport,
}) => {
  const isProfit = hand.profitLossBB >= 0;
  const profitColor = isProfit ? 'text-emerald-600' : 'text-red-500';
  const profitBg = isProfit ? 'bg-emerald-50' : 'bg-red-50';

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      {/* Top row: hand number + date + profit */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900">
            #{hand.handNumber}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${POSITION_COLORS[hand.humanPosition]}`}
          >
            {hand.humanPosition}
          </span>
          {hand.showdown && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 uppercase tracking-wider">
              SD
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{formatDate(hand.createdAt)}</span>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold ${profitColor} ${profitBg}`}
          >
            {formatProfit(hand.profitLossBB)}
          </span>
        </div>
      </div>

      {/* Scenario tags */}
      {hand.scenarioTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hand.scenarioTags.map((tag) => {
            const colors = SCENARIO_COLORS[tag] ?? {
              bg: 'bg-gray-100',
              text: 'text-gray-600',
            };
            return (
              <span
                key={tag}
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colors.bg} ${colors.text}`}
              >
                {SCENARIO_LABELS[tag] ?? tag}
              </span>
            );
          })}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => onReplay(hand.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-150"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Replay
        </button>
        <button
          onClick={() => onExport(hand.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export
        </button>
      </div>
    </div>
  );
};

export default HandHistoryCard;