import React from 'react';

export interface ThinkingIndicatorProps {
  visible: boolean;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-900/70 rounded-lg backdrop-blur-sm">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-thinking-dot"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}

      <style>{`
        @keyframes thinking-dot {
          0%, 60%, 100% { opacity: 0.3; transform: scale(1); }
          30% { opacity: 1; transform: scale(1.3); }
        }
        .animate-thinking-dot {
          animation: thinking-dot 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ThinkingIndicator;