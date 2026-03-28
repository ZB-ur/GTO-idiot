import React from 'react';

interface EmptyStateIllustrationProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyStateIllustration: React.FC<EmptyStateIllustrationProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="mb-4 text-gray-500">{icon}</div>
      )}
      {!icon && (
        <div className="mb-4 w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" />
          </svg>
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-50 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 max-w-xs mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold text-sm rounded-xl transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};