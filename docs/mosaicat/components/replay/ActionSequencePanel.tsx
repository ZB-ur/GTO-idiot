import React from 'react';

export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'bet' | 'all_in';

export interface StreetAction {
  playerId: string;
  nickname: string;
  actionType: ActionType;
  amount?: number | null;
  sequenceIndex: number;
  potAfter: number;
  isUserAction?: boolean;
}

interface ActionSequencePanelProps {
  actions: StreetAction[];
  selectedIndex?: number;
  onSelectAction: (index: number) => void;
}

const ACTION_LABELS: Record<ActionType, string> = {
  fold: '弃牌',
  check: '过牌',
  call: '跟注',
  raise: '加注',
  bet: '下注',
  all_in: '全押',
};

const ACTION_COLORS: Record<ActionType, { bg: string; text: string; border: string }> = {
  fold: { bg: 'bg-gray-800/50', text: 'text-gray-500', border: 'border-gray-700' },
  check: { bg: 'bg-gray-800/50', text: 'text-gray-300', border: 'border-gray-700' },
  call: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  raise: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  bet: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  all_in: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

export const ActionSequencePanel: React.FC<ActionSequencePanelProps> = ({
  actions,
  selectedIndex,
  onSelectAction,
}) => {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-gray-50">行动序列</h3>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {actions.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            暂无行动记录
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {actions.map((action, index) => {
              const colors = ACTION_COLORS[action.actionType];
              const isSelected = selectedIndex === index;
              const isUser = action.isUserAction;

              return (
                <button
                  key={`${action.sequenceIndex}-${index}`}
                  onClick={() => onSelectAction(index)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-all
                    hover:bg-gray-800/60
                    ${isSelected ? 'bg-gray-800 ring-1 ring-inset ring-amber-500/40' : ''}
                    ${isUser ? 'border-l-2 border-l-amber-500' : 'border-l-2 border-l-transparent'}
                  `}
                >
                  {/* Sequence number */}
                  <span className="text-xs text-gray-600 w-5 text-right shrink-0">
                    {action.sequenceIndex}
                  </span>

                  {/* Player name */}
                  <span className={`text-sm truncate w-16 shrink-0 ${isUser ? 'text-amber-400 font-medium' : 'text-gray-300'}`}>
                    {action.nickname}
                  </span>

                  {/* Action badge */}
                  <span
                    className={`
                      inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium
                      border ${colors.bg} ${colors.text} ${colors.border}
                    `}
                  >
                    {ACTION_LABELS[action.actionType]}
                    {action.amount != null && ` ${action.amount}`}
                  </span>

                  {/* Pot after */}
                  <span className="ml-auto text-xs text-gray-500 shrink-0">
                    底池 {action.potAfter}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};