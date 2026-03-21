import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeClasses: Record<string, { spinner: string; border: string; label: string }> = {
  sm: { spinner: 'w-5 h-5', border: 'border-2', label: 'text-xs' },
  md: { spinner: 'w-8 h-8', border: 'border-[3px]', label: 'text-sm' },
  lg: { spinner: 'w-12 h-12', border: 'border-4', label: 'text-base' },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
}) => {
  const s = sizeClasses[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${s.spinner} ${s.border} border-gray-700 border-t-emerald-500
          rounded-full animate-spin`}
      />
      {label && (
        <span className={`${s.label} text-gray-400 font-medium`}>{label}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;