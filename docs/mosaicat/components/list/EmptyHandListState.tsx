import React from 'react';

interface EmptyHandListStateProps {
  onStartGame: () => void;
}

export const EmptyHandListState: React.FC<EmptyHandListStateProps> = ({
  onStartGame,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Illustration placeholder — stylized card icon */}
      <div className="w-20 h-20 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5h6a2 2 0 012 2v10a2 2 0 01-2 2h-6" opacity="0.5" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-50 mb-2">
        还没有对战记录
      </h3>
      <p className="text-sm text-gray-500 mb-8 max-w-xs">
        开始你的第一局德州扑克，和 AI 对手过招吧！
      </p>

      <button
        onClick={onStartGame}
        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded-lg transition-colors duration-200 shadow-sm"
      >
        去打一局
      </button>
    </div>
  );
};