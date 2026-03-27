import React from 'react';

interface HandInfoBarProps {
  handNumber: number;
  blinds: { small: number; big: number };
  sessionInfo?: string;
}

export const HandInfoBar: React.FC<HandInfoBarProps> = ({ handNumber, blinds, sessionInfo }) => {
  return (
    <div className="w-full bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <span className="text-gray-50 font-semibold">
          Hand #{handNumber}
        </span>
        <span className="text-gray-400">
          Blinds {blinds.small}/{blinds.big}
        </span>
      </div>
      {sessionInfo && (
        <span className="text-gray-500 text-xs">{sessionInfo}</span>
      )}
    </div>
  );
};