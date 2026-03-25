import React from 'react';

export const SimplifiedGtoBadge: React.FC = () => {
  return (
    <span
      className="
        inline-flex items-center gap-1.5
        bg-amber-400/10 border border-amber-400/30
        text-amber-400 text-xs font-medium
        rounded-lg px-2.5 py-1
        select-none
      "
    >
      <svg
        className="w-3.5 h-3.5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
        />
      </svg>
      <span>简化GTO参考</span>
      <span className="text-amber-400/60">|</span>
      <span className="text-amber-300/80">Simplified GTO Reference</span>
    </span>
  );
};

export default SimplifiedGtoBadge;