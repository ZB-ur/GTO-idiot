import React from 'react';

export interface EmptyStateProps {
  /** Custom icon or illustration node */
  icon?: React.ReactNode;
  /** Main heading text */
  title: string;
  /** Supporting description text */
  description?: string;
  /** Label for the call-to-action button */
  actionLabel?: string;
  /** Handler when CTA button is clicked */
  onAction?: () => void;
}

const DefaultIcon: React.FC = () => (
  <svg
    className="w-16 h-16 text-gray-300"
    fill="none"
    viewBox="0 0 64 64"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <rect x="8" y="12" width="48" height="40" rx="4" />
    <path d="M8 24h48" />
    <circle cx="32" cy="38" r="6" />
    <path d="M29 38l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Icon / Illustration */}
      <div className="mb-4">
        {icon ?? <DefaultIcon />}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* CTA Button */}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;