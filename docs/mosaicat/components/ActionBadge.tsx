import React from 'react';

export interface ActionBadgeProps {
  actionText: string;
  animate?: boolean;
}

export const ActionBadge: React.FC<ActionBadgeProps> = ({
  actionText,
  animate = false,
}) => {
  return (
    <div
      className={`
        inline-flex items-center px-3 py-1.5
        bg-gray-900/80 text-white text-sm font-semibold
        rounded-lg shadow-md backdrop-blur-sm
        ${animate ? 'animate-action-pop' : ''}
      `}
    >
      {actionText}

      <style>{`
        @keyframes action-pop {
          0% { transform: scale(0.7); opacity: 0; }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-action-pop {
          animation: action-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ActionBadge;