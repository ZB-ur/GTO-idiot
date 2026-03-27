import React from 'react';

interface FullScreenErrorAction {
  label: string;
  onClick: () => void;
  variant: 'primary' | 'secondary';
}

interface FullScreenErrorProps {
  title: string;
  message: string;
  actions: FullScreenErrorAction[];
}

export const FullScreenError: React.FC<FullScreenErrorProps> = ({ title, message, actions }) => {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
      {/* Error Icon */}
      <div className="mb-8 p-5 bg-red-400/10 rounded-full">
        <svg className="w-16 h-16 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-50 mb-3 text-center">{title}</h1>
      <p className="text-gray-400 text-base text-center max-w-md mb-10">{message}</p>

      <div className="flex items-center gap-3">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${
              action.variant === 'primary'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-gray-950'
                : 'border border-gray-700 text-gray-400 hover:text-gray-50 hover:border-gray-500'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};