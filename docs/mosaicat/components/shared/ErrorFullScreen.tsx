import React from 'react';

interface ErrorFullScreenProps {
  message: string;
  actionText: string;
  onAction: () => void;
}

export const ErrorFullScreen: React.FC<ErrorFullScreenProps> = ({
  message,
  actionText,
  onAction,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center px-6 text-center">
      {/* Error icon */}
      <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mb-6">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-gray-50 mb-2">Something Went Wrong</h2>
      <p className="text-sm text-gray-400 max-w-sm mb-8">{message}</p>

      <button
        onClick={onAction}
        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold text-sm rounded-lg transition-colors"
      >
        {actionText}
      </button>
    </div>
  );
};

export default ErrorFullScreen;