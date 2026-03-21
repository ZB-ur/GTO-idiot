import React from 'react';

interface ActionIndicatorProps {
  isActive: boolean;
  children?: React.ReactNode;
}

const ActionIndicator: React.FC<ActionIndicatorProps> = ({ isActive, children }) => {
  return (
    <div
      className={`relative rounded-xl transition-all duration-300 ${
        isActive
          ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-emerald-800 shadow-[0_0_16px_rgba(96,165,250,0.5)]'
          : ''
      }`}
    >
      {isActive && (
        <div className="absolute inset-0 rounded-xl ring-2 ring-blue-400 animate-pulse pointer-events-none" />
      )}
      {children}
    </div>
  );
};

export default ActionIndicator;