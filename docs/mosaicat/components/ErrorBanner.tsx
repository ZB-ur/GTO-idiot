import React from 'react';

interface ErrorBannerProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, actionLabel, onAction }) => {
  return (
    <div
      className="w-full bg-amber-400/10 border-b border-amber-400/30 px-5 py-3 flex items-center gap-3"
      role="alert"
    >
      <span className="text-amber-400 text-sm font-semibold shrink-0">⚠</span>
      <span className="text-sm text-gray-50 flex-1">{message}</span>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors shrink-0"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;