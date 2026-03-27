import React, { useRef, useEffect } from 'react';

interface Action {
  seatIndex: number;
  position: string;
  street: string;
  actionType: string;
  amount?: number;
  isAllIn?: boolean;
  potAfterAction?: number;
  timestamp: string;
}

interface ActionLogProps {
  actions: Action[];
  currentStepIndex: number;
  className?: string;
}

const streetLabel: Record<string, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const actionColors: Record<string, string> = {
  fold: 'text-gray-500',
  check: 'text-gray-400',
  call: 'text-emerald-400',
  raise: 'text-amber-400',
  allIn: 'text-red-400',
};

const formatAction = (action: Action): string => {
  const amount = action.amount && action.amount > 0 ? ` ${action.amount}` : '';
  const allIn = action.isAllIn ? ' (All-In)' : '';
  const type = action.actionType.charAt(0).toUpperCase() + action.actionType.slice(1);
  return `${type}${amount}${allIn}`;
};

export const ActionLog: React.FC<ActionLogProps> = ({
  actions,
  currentStepIndex,
  className = '',
}) => {
  const activeRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentStepIndex]);

  // Group actions by street
  let currentStreet = '';

  return (
    <div
      ref={scrollRef}
      className={`bg-gray-900 border border-gray-700 rounded-xl overflow-hidden flex flex-col ${className}`}
    >
      <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-50">Action Log</h3>
      </div>
      <div className="overflow-y-auto flex-1 p-2 space-y-0.5">
        {actions.map((action, index) => {
          const showStreetHeader = action.street !== currentStreet;
          if (showStreetHeader) currentStreet = action.street;
          const isCurrent = index === currentStepIndex;
          const isPast = index < currentStepIndex;

          return (
            <React.Fragment key={index}>
              {showStreetHeader && (
                <div className="px-3 py-1.5 mt-1 first:mt-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                    {streetLabel[action.street] ?? action.street}
                  </span>
                </div>
              )}
              <div
                ref={isCurrent ? activeRef : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isCurrent
                    ? 'bg-amber-500/15 border border-amber-500/30'
                    : isPast
                      ? 'opacity-60'
                      : 'opacity-40'
                }`}
              >
                <span className="text-xs font-mono text-gray-500 w-8 text-right flex-shrink-0">
                  {action.position}
                </span>
                <span
                  className={`text-sm font-medium flex-1 ${actionColors[action.actionType] ?? 'text-gray-400'}`}
                >
                  {formatAction(action)}
                </span>
                {action.potAfterAction !== undefined && (
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    Pot: {action.potAfterAction}
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};