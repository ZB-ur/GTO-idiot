import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const DefaultIcon: React.FC = () => (
  <svg
    className="w-12 h-12 text-gray-600"
    fill="none"
    viewBox="0 0 48 48"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <rect x="6" y="10" width="36" height="28" rx="4" />
    <path d="M6 18h36" />
    <circle cx="24" cy="30" r="4" />
  </svg>
);

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4">
        {icon || <DefaultIcon />}
      </div>
      <h3 className="text-gray-50 text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 text-sm max-w-xs mb-6">{description}</p>
      )}
      {actionLabel && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950
            font-semibold text-sm rounded-lg transition-colors duration-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;