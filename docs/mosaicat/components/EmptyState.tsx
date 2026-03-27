import React from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon ? (
        <div className="mb-4 text-gray-500">{icon}</div>
      ) : (
        <div className="mb-4 w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12H9.75m3 0h.008v.008H12.75v-.008ZM9.75 15h.008v.008H9.75V15Zm0-3h.008v.008H9.75V12Zm-3 3h.008v.008H6.75V15Zm0-3h.008v.008H6.75V12ZM6.75 7.5h10.5"
            />
          </svg>
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-50 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-xs mb-6">{message}</p>
      <button
        onClick={onAction}
        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold text-sm rounded-lg transition-colors"
      >
        {actionLabel}
      </button>
    </div>
  );
};