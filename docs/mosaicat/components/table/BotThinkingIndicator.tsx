import React from 'react';

interface BotThinkingIndicatorProps {
  visible: boolean;
}

export const BotThinkingIndicator: React.FC<BotThinkingIndicatorProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="flex items-center justify-center gap-1 px-2 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:300ms]" />
    </div>
  );
};