import React from 'react';

interface BotThinkingIndicatorProps {
  className?: string;
}

export const BotThinkingIndicator: React.FC<BotThinkingIndicatorProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-700 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      <span
        className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"
        style={{ animationDelay: '0.2s' }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"
        style={{ animationDelay: '0.4s' }}
      />
    </div>
  );
};