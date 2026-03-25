import React from 'react';

interface ThinkingIndicatorProps {
  isThinking: boolean;
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ isThinking }) => {
  if (!isThinking) return null;

  return (
    <div className="flex items-center gap-1 px-2 py-1">
      <span
        className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce"
        style={{ animationDelay: '0ms' }}
      />
      <span
        className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce"
        style={{ animationDelay: '150ms' }}
      />
      <span
        className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce"
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
};

export default ThinkingIndicator;