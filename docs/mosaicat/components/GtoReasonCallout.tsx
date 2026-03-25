import React from 'react';

interface GtoReasonCalloutProps {
  reason: string;
  visible: boolean;
  className?: string;
}

export const GtoReasonCallout: React.FC<GtoReasonCalloutProps> = ({
  reason,
  visible,
  className = '',
}) => {
  if (!visible) return null;

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4
        bg-red-500/10 border border-red-500/30 rounded-xl
        animate-in fade-in slide-in-from-top-1
        ${className}
      `}
    >
      {/* Warning icon */}
      <div className="flex-shrink-0 mt-0.5">
        <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-red-400 mb-1">GTO Deviation</p>
        <p className="text-sm text-gray-300 leading-relaxed">{reason}</p>
      </div>

      {/* Accent bar */}
      <div className="absolute left-0 top-3 bottom-3 w-1 bg-red-500 rounded-full" />
    </div>
  );
};

export default GtoReasonCallout;