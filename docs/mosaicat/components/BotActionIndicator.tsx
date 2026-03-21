import React from 'react';

interface BotActionIndicatorProps {
  /** Whether the bot is currently thinking/deciding */
  isThinking: boolean;
  /** The action the bot decided on (e.g., "Fold", "Call", "Raise", "All-in", "Check") */
  action?: string;
  /** The amount associated with the action (for Raise/Call/All-in) */
  amount?: number;
}

const actionStyles: Record<string, { bg: string; text: string; border: string }> = {
  fold: { bg: 'bg-gray-800/80', text: 'text-gray-400', border: 'border-gray-600' },
  check: { bg: 'bg-emerald-900/60', text: 'text-emerald-400', border: 'border-emerald-700' },
  call: { bg: 'bg-emerald-900/60', text: 'text-emerald-400', border: 'border-emerald-700' },
  raise: { bg: 'bg-yellow-900/60', text: 'text-yellow-400', border: 'border-yellow-700' },
  'all-in': { bg: 'bg-red-900/60', text: 'text-red-400', border: 'border-red-700' },
  all_in: { bg: 'bg-red-900/60', text: 'text-red-400', border: 'border-red-700' },
};

function getActionStyle(action: string) {
  const key = action.toLowerCase().replace(/[\s_-]+/g, '-');
  return actionStyles[key] ?? actionStyles[action.toLowerCase()] ?? {
    bg: 'bg-gray-800/80',
    text: 'text-gray-300',
    border: 'border-gray-600',
  };
}

function formatAmount(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k`;
  return amount.toFixed(amount % 1 === 0 ? 0 : 1);
}

export const BotActionIndicator: React.FC<BotActionIndicatorProps> = ({
  isThinking,
  action,
  amount,
}) => {
  if (isThinking) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 animate-pulse">
        <div className="flex gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
        <span className="text-xs font-medium text-gray-400">Thinking…</span>
      </div>
    );
  }

  if (!action) return null;

  const style = getActionStyle(action);

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border
        ${style.bg} ${style.border}
        transition-all duration-300 ease-out
        animate-in fade-in slide-in-from-bottom-1
      `}
    >
      <span className={`text-xs font-bold uppercase tracking-wide ${style.text}`}>
        {action}
      </span>
      {amount !== undefined && (
        <span className={`text-xs font-semibold ${style.text} opacity-80`}>
          {formatAmount(amount)}
        </span>
      )}
    </div>
  );
};

export default BotActionIndicator;