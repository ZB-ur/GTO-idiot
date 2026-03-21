import React from 'react';

interface BotThinkingIndicatorProps {
  isThinking: boolean;
}

const BotThinkingIndicator: React.FC<BotThinkingIndicatorProps> = ({ isThinking }) => {
  if (!isThinking) return null;

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-800/80 text-gray-300 text-xs">
      <span>Thinking</span>
      <span className="flex gap-0.5">
        <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-1 h-1 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
      </span>
    </div>
  );
};

export default BotThinkingIndicator;