import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<string, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`
        ${sizeClasses[size]}
        rounded-full border-slate-600 border-t-green-400
        animate-spin
      `}
    />
  );
};

export default Spinner;
