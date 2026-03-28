import React from 'react';

interface HistoryEmptyStateProps {
  onStartPlaying: () => void;
}

export const HistoryEmptyState: React.FC<HistoryEmptyStateProps> = ({ onStartPlaying }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* Illustration: stylized card fan */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-22 bg-gray-800 border border-gray-700 rounded-xl -rotate-12 absolute shadow-md" />
          <div className="w-16 h-22 bg-gray-800 border border-gray-700 rounded-xl rotate-0 absolute shadow-md" />
          <div className="w-16 h-22 bg-gray-800 border border-gray-700 rounded-xl rotate-12 absolute shadow-md" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-50 mb-2">暂无手牌记录</h3>
      <p className="text-gray-500 text-sm text-center max-w-xs mb-8">
        开始一局游戏，你的手牌历史将会显示在这里。每手牌的关键决策都会被自动记录。
      </p>

      <button
        onClick={onStartPlaying}
        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold rounded-xl transition-colors"
      >
        开始游戏
      </button>
    </div>
  );
};