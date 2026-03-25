import React, { useMemo } from 'react';
import type { LegalActions, PlayerAction, ActionType } from '../../types';

interface ActionPanelProps {
  legalActions: LegalActions;
  onAction: (action: PlayerAction) => void;
  isDisabled: boolean;
}

interface LegalAction {
  type: ActionType;
  isAvailable: boolean;
  callAmount?: number;
  minRaise?: number;
  maxRaise?: number;
  allInAmount?: number;
}

const getActionConfig = (action: LegalAction) => {
  switch (action.type) {
    case 'fold':
      return {
        label: 'Fold',
        bg: 'bg-gray-600/80',
        hoverBg: 'hover:bg-gray-500/80',
        textColor: 'text-gray-100',
        sublabel: '',
      };
    case 'check':
      return {
        label: 'Check',
        bg: 'bg-sky-500',
        hoverBg: 'hover:bg-sky-400',
        textColor: 'text-white',
        sublabel: '',
      };
    case 'call':
      return {
        label: 'Call',
        bg: 'bg-sky-500',
        hoverBg: 'hover:bg-sky-400',
        textColor: 'text-white',
        sublabel: action.callAmount ? `${action.callAmount}` : '',
      };
    case 'raise':
      return {
        label: 'Raise',
        bg: 'bg-emerald-500',
        hoverBg: 'hover:bg-emerald-400',
        textColor: 'text-white',
        sublabel: '',
      };
    case 'allin':
      return {
        label: 'All In',
        bg: 'bg-red-500',
        hoverBg: 'hover:bg-red-400',
        textColor: 'text-white',
        sublabel: action.allInAmount ? `${action.allInAmount}` : '',
      };
    default:
      return {
        label: action.type,
        bg: 'bg-gray-500',
        hoverBg: 'hover:bg-gray-400',
        textColor: 'text-white',
        sublabel: '',
      };
  }
};

export const ActionPanel: React.FC<ActionPanelProps> = ({
  legalActions,
  onAction,
  isDisabled,
}) => {
  const sortedActions = useMemo(() => {
    const order: ActionType[] = ['fold', 'check', 'call', 'raise', 'allin'];
    return [...legalActions.actions].sort(
      (a, b) => order.indexOf(a.type) - order.indexOf(b.type),
    );
  }, [legalActions.actions]);

  const raiseAction = useMemo(
    () => sortedActions.find((a) => a.type === 'raise' && a.isAvailable),
    [sortedActions],
  );

  const nonRaiseActions = useMemo(
    () => sortedActions.filter((a) => a.type !== 'raise'),
    [sortedActions],
  );

  const [expanded, setExpanded] = React.useState(false);
  const [raiseAmount, setRaiseAmount] = React.useState(raiseAction?.minRaise ?? 0);

  React.useEffect(() => {
    if (raiseAction?.minRaise) setRaiseAmount(raiseAction.minRaise);
  }, [raiseAction?.minRaise]);

  const clamp = React.useCallback(
    (val: number) => {
      const min = raiseAction?.minRaise ?? 0;
      const max = raiseAction?.maxRaise ?? 0;
      return Math.min(max, Math.max(min, Math.round(val)));
    },
    [raiseAction],
  );

  const potSize = useMemo(() => {
    // Estimate pot from call amount as a rough heuristic; real pot comes from HandState
    const call = sortedActions.find((a) => a.type === 'call')?.callAmount ?? 0;
    return call * 3 || (raiseAction?.minRaise ?? 0) * 2;
  }, [sortedActions, raiseAction]);

  const handleRaiseConfirm = React.useCallback(() => {
    onAction({ type: 'raise', amount: raiseAmount });
    setExpanded(false);
  }, [onAction, raiseAmount]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-gradient-to-t from-gray-950/95 via-gray-900/90 to-transparent backdrop-blur-sm pt-6 pb-4 px-4">
        {/* Raise expanded panel */}
        {expanded && raiseAction && (
          <div className="max-w-md mx-auto mb-3 bg-emerald-900/90 rounded-xl p-4 space-y-3 border border-emerald-700/50 shadow-lg">
            {/* Pot shortcuts */}
            <div className="flex gap-2">
              {[
                { label: '½ Pot', mult: 0.5 },
                { label: '¾ Pot', mult: 0.75 },
                { label: 'Pot', mult: 1 },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setRaiseAmount(clamp(Math.round(potSize * s.mult)))}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700/60 text-emerald-100 hover:bg-emerald-600/80 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Slider */}
            <input
              type="range"
              min={raiseAction.minRaise}
              max={raiseAction.maxRaise}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(clamp(Number(e.target.value)))}
              className="w-full h-2 appearance-none rounded-full accent-emerald-400 cursor-pointer"
              style={{
                background: `linear-gradient(to right, #34d399 0%, #34d399 ${((raiseAmount - (raiseAction.minRaise ?? 0)) / ((raiseAction.maxRaise ?? 1) - (raiseAction.minRaise ?? 0))) * 100}%, rgba(6,78,59,0.5) ${((raiseAmount - (raiseAction.minRaise ?? 0)) / ((raiseAction.maxRaise ?? 1) - (raiseAction.minRaise ?? 0))) * 100}%, rgba(6,78,59,0.5) 100%)`,
              }}
            />
            <div className="flex justify-between text-[10px] text-emerald-400/60">
              <span>{raiseAction.minRaise}</span>
              <span>{raiseAction.maxRaise}</span>
            </div>

            {/* Input + confirm */}
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={raiseAction.minRaise}
                max={raiseAction.maxRaise}
                value={raiseAmount}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!isNaN(v)) setRaiseAmount(clamp(v));
                }}
                className="flex-1 bg-emerald-950/60 border border-emerald-600/40 rounded-lg px-3 py-2 text-center text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
              <button
                type="button"
                onClick={handleRaiseConfirm}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg transition-colors shadow-md"
              >
                Raise
              </button>
            </div>
          </div>
        )}

        {/* Action buttons row */}
        <div className="max-w-md mx-auto flex gap-2">
          {nonRaiseActions.map((action) => {
            const config = getActionConfig(action);
            const btnDisabled = isDisabled || !action.isAvailable;

            return (
              <button
                key={action.type}
                type="button"
                disabled={btnDisabled}
                onClick={() => onAction({ type: action.type })}
                className={`
                  flex-1 py-3.5 rounded-xl font-bold text-base transition-all
                  ${btnDisabled
                    ? 'bg-gray-700/40 text-gray-500 cursor-not-allowed'
                    : `${config.bg} ${config.hoverBg} ${config.textColor} shadow-md`
                  }
                `}
              >
                <span className="block">{config.label}</span>
                {config.sublabel && (
                  <span className="block text-xs font-normal opacity-80">{config.sublabel}</span>
                )}
              </button>
            );
          })}

          {/* Raise button */}
          {raiseAction && (
            <button
              key="raise"
              type="button"
              disabled={isDisabled || !raiseAction.isAvailable}
              onClick={() => {
                if (!isDisabled && raiseAction.isAvailable) {
                  setExpanded((p) => !p);
                  setRaiseAmount(raiseAction.minRaise ?? 0);
                }
              }}
              className={`
                flex-1 py-3.5 rounded-xl font-bold text-base transition-all
                ${isDisabled || !raiseAction.isAvailable
                  ? 'bg-gray-700/40 text-gray-500 cursor-not-allowed'
                  : expanded
                    ? 'bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-md'
                }
              `}
            >
              {expanded ? 'Cancel' : 'Raise'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;