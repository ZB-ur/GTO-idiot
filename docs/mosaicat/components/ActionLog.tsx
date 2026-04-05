import React from 'react';

interface ActionRecord {
  playerId: string;
  playerName: string;
  position: 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
  actionType: 'fold' | 'check' | 'call' | 'raise' | 'all_in' | 'post_sb' | 'post_bb';
  amount?: number | null;
  street: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
  potAfter: number;
  timestamp: number;
  isUserAction?: boolean;
}

interface ActionLogProps {
  actions: ActionRecord[];
  currentIndex: number;
  collapsed?: boolean;
  onToggle?: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  fold: '弃牌',
  check: '过牌',
  call: '跟注',
  raise: '加注',
  all_in: '全下',
  post_sb: '小盲',
  post_bb: '大盲',
};

const STREET_LABELS: Record<string, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

export const ActionLog: React.FC<ActionLogProps> = ({
  actions,
  currentIndex,
  collapsed = false,
  onToggle,
}) => {
  // Group actions by street
  const groupedByStreet: Record<string, ActionRecord[]> = {};
  for (const action of actions) {
    if (!groupedByStreet[action.street]) {
      groupedByStreet[action.street] = [];
    }
    groupedByStreet[action.street].push(action);
  }

  const formatAction = (action: ActionRecord): string => {
    const label = ACTION_LABELS[action.actionType] ?? action.actionType;
    if (action.amount != null && action.amount > 0) {
      return `${action.playerName} (${action.position}) ${label} ${action.amount}`;
    }
    return `${action.playerName} (${action.position}) ${label}`;
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-750 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-100">动作记录</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`text-gray-400 transition-transform ${collapsed ? '' : 'rotate-180'}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Body */}
      {!collapsed && (
        <div className="px-4 pb-3 max-h-64 overflow-y-auto space-y-3">
          {Object.entries(groupedByStreet).map(([street, streetActions]) => (
            <div key={street}>
              <div className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wide">
                {STREET_LABELS[street] ?? street}
              </div>
              <div className="space-y-0.5">
                {streetActions.map((action, i) => {
                  const globalIndex = actions.indexOf(action);
                  const isCurrent = globalIndex === currentIndex;
                  const isPast = globalIndex < currentIndex;

                  return (
                    <div
                      key={`${street}-${i}`}
                      className={`text-sm px-2 py-1 rounded-lg transition-colors ${
                        isCurrent
                          ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                          : isPast
                            ? action.isUserAction
                              ? 'text-amber-400'
                              : 'text-gray-300'
                            : 'text-gray-500'
                      }`}
                    >
                      {isCurrent && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 align-middle" />
                      )}
                      {formatAction(action)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};