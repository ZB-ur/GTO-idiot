import React from 'react';

export interface BotThinkingIndicatorProps {
  visible: boolean;
  className?: string;
}

export const BotThinkingIndicator: React.FC<BotThinkingIndicatorProps> = ({ visible, className = '' }) => {
  if (!visible) return null;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800/70 border border-gray-700/50 ${className}`}
      role="status"
      aria-label="Bot is thinking"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[pulse-dot_1.4s_ease-in-out_infinite]" />
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[pulse-dot_1.4s_ease-in-out_0.2s_infinite]" />
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-[pulse-dot_1.4s_ease-in-out_0.4s_infinite]" />
    </div>
  );
};

export default BotThinkingIndicator;