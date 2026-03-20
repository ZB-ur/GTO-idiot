import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', text: 'text-xs', suit: 'text-sm' },
  md: { container: 'w-12 h-12', text: 'text-sm', suit: 'text-lg' },
  lg: { container: 'w-16 h-16', text: 'text-base', suit: 'text-2xl' },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
}) => {
  const s = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`relative ${s.container}`}>
        {/* Spinning ring */}
        <div
          className={`absolute inset-0 rounded-full border-2 border-gray-700 border-t-emerald-400 animate-spin`}
        />
        {/* Center suit icon */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${s.suit} text-emerald-400`}
        >
          ♠
        </div>
      </div>
      {label && (
        <span className={`${s.text} text-gray-300 animate-pulse`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;