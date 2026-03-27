import React from 'react';

export interface ThinkingDotsProps {
  className?: string;
}

export const ThinkingDots: React.FC<ThinkingDotsProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  );
};

export default ThinkingDots;