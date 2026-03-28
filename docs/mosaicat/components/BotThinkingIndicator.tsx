import React from 'react';

interface BotThinkingIndicatorProps {
  visible: boolean;
  className?: string;
}

export const BotThinkingIndicator: React.FC<BotThinkingIndicatorProps> = ({ visible, className = '' }) => {
  if (!visible) return null;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:300ms]" />
    </div>
  );
};