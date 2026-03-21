// ============================================================
// EmptyState — Reusable placeholder for empty data views
// ============================================================

import React from 'react';

interface EmptyStateProps {
  /** Emoji or icon string */
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🃏',
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <span className="text-5xl mb-4" role="img" aria-hidden="true">
      {icon}
    </span>
    <h3 className="text-xl font-semibold text-gray-200 mb-2">{title}</h3>
    {description && (
      <p className="text-gray-400 max-w-md mb-6">{description}</p>
    )}
    {actionLabel && onAction && (
      <button onClick={onAction} className="btn-primary">
        {actionLabel}
      </button>
    )}
  </div>
);
