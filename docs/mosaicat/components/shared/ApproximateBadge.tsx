import React from 'react';

export interface ApproximateBadgeProps {
  className?: string;
}

export const ApproximateBadge: React.FC<ApproximateBadgeProps> = ({
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium rounded-full border bg-sky-400/10 text-sky-400 border-sky-400/25 px-2.5 py-0.5 ${className}`}
    >
      <svg
        className="w-3 h-3"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
      </svg>
      <span>近似参考</span>
    </span>
  );
};

export default ApproximateBadge;