import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeConfig = {
  sm: { spinner: 'w-4 h-4 border-2', text: 'text-xs' },
  md: { spinner: 'w-6 h-6 border-2', text: 'text-sm' },
  lg: { spinner: 'w-8 h-8 border-[3px]', text: 'text-base' },
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label,
  className = '',
}) => {
  const config = sizeConfig[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`} role="status">
      <div
        className={`${config.spinner} rounded-full border-gray-200 border-t-blue-600 animate-spin`}
      />
      {label && (
        <span className={`${config.text} text-gray-600`}>{label}</span>
      )}
      <span className="sr-only">{label ?? 'Loading...'}</span>
    </div>
  );
};

export default Spinner;