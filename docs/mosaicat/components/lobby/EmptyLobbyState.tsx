import React from 'react';

export interface EmptyLobbyStateProps {
  onStartGame: () => void;
}

export const EmptyLobbyState: React.FC<EmptyLobbyStateProps> = ({ onStartGame }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Chip illustration */}
      <div className="w-24 h-24 mb-6 relative">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-dashed border-amber-500/30 flex items-center justify-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            className="text-amber-500/60"
          >
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
            <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="6" fill="currentColor" opacity="0.3" />
            <line x1="24" y1="4" x2="24" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="38" x2="24" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4" y1="24" x2="10" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="38" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Text */}
      <h3 className="text-gray-50 text-lg font-semibold mb-2">还没有对战记录</h3>
      <p className="text-gray-500 text-sm mb-8 max-w-xs">
        开始你的第一局德州扑克，和 AI 对手一起磨练技术
      </p>

      {/* CTA Button */}
      <button
        onClick={onStartGame}
        className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 text-base font-semibold rounded-lg transition-colors shadow-lg shadow-amber-500/20"
      >
        开始对局
      </button>
    </div>
  );
};