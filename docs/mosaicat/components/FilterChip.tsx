import React from 'react';

export interface FilterChipProps {
  label: string;
  active: boolean;
  onRemove: () => void;
  className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  active,
  onRemove,
  className = '',
}) => {
  if (!active) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full hover:bg-emerald-500/30 transition-colors text-emerald-400"
        aria-label={`移除筛选: ${label}`}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
};

export default FilterChip;