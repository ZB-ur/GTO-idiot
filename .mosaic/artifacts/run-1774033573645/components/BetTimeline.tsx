import React, { useMemo } from 'react';

// ============================================================
// Types
// ============================================================
export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all_in';
export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface Action {
  playerSeatIndex: number;
  playerName?: string;
  actionType: ActionType;
  amount?: number;
  street: Street;
  potAfter?: number;
  timestamp: string;
}

export interface Player {
  seatIndex: number;
  name: string;
  chips: number;
  position: Position;
  isHuman: boolean;
  isActive: boolean;
}

// ============================================================
// Constants
// ============================================================
const STREET_ORDER: Street[] = ['preflop', 'flop', 'turn', 'river'];

const STREET_LABELS: Record<Street, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const ACTION_CONFIG: Record<ActionType, { label: string; color: string; bg: string; icon: string }> = {
  fold:   { label: 'Fold',   color: 'text-gray-400',    bg: 'bg-gray-100',    icon: '✕' },
  check:  { label: 'Check',  color: 'text-blue-600',    bg: 'bg-blue-50',     icon: '✓' },
  call:   { label: 'Call',   color: 'text-emerald-600', bg: 'bg-emerald-50',  icon: '→' },
  raise:  { label: 'Raise',  color: 'text-amber-600',   bg: 'bg-amber-50',    icon: '↑' },
  all_in: { label: 'All-In', color: 'text-red-500',     bg: 'bg-red-50',      icon: '★' },
};

// ============================================================
// Sub-components
// ============================================================
interface ActionChipProps {
  action: Action;
  playerName: string;
  isHuman: boolean;
}

const ActionChip: React.FC<ActionChipProps> = ({ action, playerName, isHuman }) => {
  const config = ACTION_CONFIG[action.actionType];
  const showAmount = action.amount && action.amount > 0 && action.actionType !== 'fold' && action.actionType !== 'check';

  return (
    <div className="flex items-center gap-2 group">
      {/* Connector dot */}
      <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm flex-shrink-0 ${
        action.actionType === 'fold' ? 'bg-gray-300' :
        action.actionType === 'all_in' ? 'bg-red-500' :
        action.actionType === 'raise' ? 'bg-amber-500' :
        action.actionType === 'call' ? 'bg-emerald-500' :
        'bg-blue-500'
      }`} />

      {/* Action card */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-shadow group-hover:shadow-md ${config.bg} ${
        isHuman ? 'ring-2 ring-blue-200' : ''
      }`}>
        <span className="text-xs">{config.icon}</span>
        <span className={`font-medium ${config.color}`}>
          {playerName}
        </span>
        <span className={`${config.color} opacity-75`}>
          {config.label}
        </span>
        {showAmount && (
          <span className={`font-semibold ${config.color}`}>
            {action.amount! >= 1000 ? `${(action.amount! / 1000).toFixed(1)}k` : action.amount}
          </span>
        )}
      </div>

      {/* Pot after */}
      {action.potAfter != null && (
        <span className="text-xs text-gray-400 hidden group-hover:inline">
          Pot: {action.potAfter}
        </span>
      )}
    </div>
  );
};

interface StreetSectionProps {
  street: Street;
  actions: Action[];
  players: Player[];
  isCurrent: boolean;
  isCompleted: boolean;
}

const StreetSection: React.FC<StreetSectionProps> = ({ street, actions, players, isCurrent, isCompleted }) => {
  const playerMap = useMemo(() => {
    const map = new Map<number, Player>();
    players.forEach(p => map.set(p.seatIndex, p));
    return map;
  }, [players]);

  return (
    <div className="relative">
      {/* Street header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
          isCurrent
            ? 'bg-blue-600 text-white shadow-sm'
            : isCompleted
              ? 'bg-gray-200 text-gray-600'
              : 'bg-gray-100 text-gray-400'
        }`}>
          {STREET_LABELS[street]}
        </div>
        {isCurrent && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
        )}
        {actions.length > 0 && (
          <span className="text-xs text-gray-400">
            {actions.length} action{actions.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Actions list */}
      {actions.length > 0 ? (
        <div className="flex flex-col gap-1.5 pl-1">
          {/* Vertical connector line */}
          <div className="absolute left-[7px] top-10 bottom-0 w-px bg-gray-200" />
          {actions.map((action, idx) => {
            const player = playerMap.get(action.playerSeatIndex);
            return (
              <ActionChip
                key={`${street}-${idx}`}
                action={action}
                playerName={action.playerName || player?.name || `Seat ${action.playerSeatIndex}`}
                isHuman={player?.isHuman ?? false}
              />
            );
          })}
        </div>
      ) : (
        <div className="pl-6 text-sm text-gray-400 italic">
          {isCurrent ? 'Waiting for action...' : 'No actions'}
        </div>
      )}
    </div>
  );
};

// ============================================================
// Main Component
// ============================================================
export interface BetTimelineProps {
  actions: Action[];
  players: Player[];
  currentStreet: Street;
}

const BetTimeline: React.FC<BetTimelineProps> = ({ actions, players, currentStreet }) => {
  const actionsByStreet = useMemo(() => {
    const grouped: Record<Street, Action[]> = {
      preflop: [],
      flop: [],
      turn: [],
      river: [],
    };
    actions.forEach(a => {
      if (grouped[a.street]) {
        grouped[a.street].push(a);
      }
    });
    return grouped;
  }, [actions]);

  const currentStreetIndex = STREET_ORDER.indexOf(currentStreet);

  // Only show streets up to and including the current street
  const visibleStreets = STREET_ORDER.filter((_, idx) => idx <= currentStreetIndex);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Bet Timeline</h3>
        <div className="flex items-center gap-3">
          {Object.entries(ACTION_CONFIG).map(([type, cfg]) => (
            <div key={type} className="flex items-center gap-1 text-xs text-gray-500">
              <span className={`w-2 h-2 rounded-full ${
                type === 'fold' ? 'bg-gray-300' :
                type === 'check' ? 'bg-blue-500' :
                type === 'call' ? 'bg-emerald-500' :
                type === 'raise' ? 'bg-amber-500' :
                'bg-red-500'
              }`} />
              {cfg.label}
            </div>
          ))}
        </div>
      </div>

      {/* Street progress bar */}
      <div className="flex items-center gap-1 mb-5">
        {STREET_ORDER.map((street, idx) => (
          <div
            key={street}
            className={`h-1 flex-1 rounded-full transition-colors ${
              idx < currentStreetIndex
                ? 'bg-blue-600'
                : idx === currentStreetIndex
                  ? 'bg-blue-400'
                  : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Street sections */}
      <div className="space-y-5">
        {visibleStreets.map((street) => (
          <StreetSection
            key={street}
            street={street}
            actions={actionsByStreet[street]}
            players={players}
            isCurrent={street === currentStreet}
            isCompleted={STREET_ORDER.indexOf(street) < currentStreetIndex}
          />
        ))}
      </div>

      {/* Total actions summary */}
      {actions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <span>{actions.length} total actions</span>
          {actions[actions.length - 1]?.potAfter != null && (
            <span className="font-medium text-gray-600">
              Current Pot: {actions[actions.length - 1].potAfter}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BetTimeline;