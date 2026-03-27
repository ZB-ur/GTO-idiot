import React, { useEffect } from 'react';

interface HandResultToastProps {
  chipChange: number;
  onDismiss: () => void;
}

export const HandResultToast: React.FC<HandResultToastProps> = ({
  chipChange,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isPositive = chipChange >= 0;
  const label = isPositive ? `+${chipChange}` : `${chipChange}`;

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-5 py-3 rounded-xl
        shadow-lg shadow-black/40 backdrop-blur-sm
        animate-bounce-in transition-opacity duration-300
        ${isPositive
          ? 'bg-emerald-900/80 border border-emerald-700 text-emerald-400'
          : 'bg-red-900/80 border border-red-700 text-red-400'
        }
      `}
      role="status"
      aria-live="polite"
    >
      <span className="text-lg">🪙</span>
      <span className="text-lg font-bold tabular-nums tracking-tight">
        {label} chips
      </span>
    </div>
  );
};

export default HandResultToast;