import React from 'react';

interface ErrorScreenProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title,
  message,
  actionLabel = 'Try Again',
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-6 text-center">
      {/* Error icon */}
      <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-6">
        <span className="text-red-500 text-3xl font-bold">!</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-50 mb-2">{title}</h1>
      <p className="text-sm text-gray-400 max-w-sm mb-8">{message}</p>

      {onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 text-sm font-medium text-gray-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};