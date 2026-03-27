import React from 'react';

interface ActionLabelProps {
  action: string;
  visible: boolean;
}

export const ActionLabel: React.FC<ActionLabelProps> = ({ action, visible }) => {
  if (!visible) return null;

  return (
    <div
      className={`
        inline-flex items-center justify-center
        px-3 py-1
        bg-gray-900/90 backdrop-blur-sm
        border border-gray-700
        rounded-lg
        text-sm font-semibold text-gray-50
        whitespace-nowrap
        animate-fade-in
        select-none
      `}
    >
      {action}
    </div>
  );
};