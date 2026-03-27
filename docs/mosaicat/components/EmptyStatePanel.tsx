import React from 'react';

interface EmptyStatePanelProps {
  icon: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  cards: (
    <svg className="w-16 h-16 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="12" height="16" rx="2" />
      <rect x="9" y="2" width="12" height="16" rx="2" />
    </svg>
  ),
  chart: (
    <svg className="w-16 h-16 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 20h18M5 20V10m4 10V6m4 14v-8m4 8V4" strokeLinecap="round" />
    </svg>
  ),
  history: (
    <svg className="w-16 h-16 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" strokeLinecap="round" />
    </svg>
  ),
};

export const EmptyStatePanel: React.FC<EmptyStatePanelProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="mb-6 p-6 bg-gray-800 rounded-full">
        {iconMap[icon] ?? iconMap['cards']}
      </div>
      <h3 className="text-xl font-semibold text-gray-50 mb-2 text-center">{title}</h3>
      <p className="text-gray-400 text-sm text-center max-w-sm mb-8">{description}</p>
      <button
        onClick={onAction}
        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-semibold rounded-xl transition-colors"
      >
        {actionLabel}
      </button>
    </div>
  );
};