import React from 'react';

export const BotThinkingIndicator: React.FC = () => {
  return (
    <div
      className="inline-flex items-center gap-1 bg-slate-800 text-gray-100 px-3 py-1.5 rounded-full shadow-md"
      role="status"
      aria-label="Bot is thinking"
    >
      <span className="text-xs font-medium mr-1">Thinking</span>
      <span className="flex gap-0.5">
        <span
          className="w-1.5 h-1.5 bg-gray-100 rounded-full animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '1.2s' }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-100 rounded-full animate-bounce"
          style={{ animationDelay: '200ms', animationDuration: '1.2s' }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-100 rounded-full animate-bounce"
          style={{ animationDelay: '400ms', animationDuration: '1.2s' }}
        />
      </span>
    </div>
  );
};

export default BotThinkingIndicator;