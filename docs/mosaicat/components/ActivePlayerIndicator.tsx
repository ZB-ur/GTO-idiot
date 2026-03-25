import React from 'react';

export interface ActivePlayerIndicatorProps {
  active: boolean;
  children: React.ReactNode;
}

export const ActivePlayerIndicator: React.FC<ActivePlayerIndicatorProps> = ({
  active,
  children,
}) => {
  return (
    <div
      className={`
        relative rounded-xl transition-shadow duration-300
        ${active ? 'shadow-[0_0_16px_4px_rgba(59,130,246,0.5)] ring-2 ring-blue-400' : ''}
      `}
    >
      {children}

      {active && (
        <div
          className="absolute inset-0 rounded-xl ring-2 ring-blue-400 animate-glow-pulse pointer-events-none"
          aria-hidden="true"
        />
      )}

      <style>{`
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 16px 4px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 24px 8px rgba(59, 130, 246, 0.7); }
        }
        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ActivePlayerIndicator;