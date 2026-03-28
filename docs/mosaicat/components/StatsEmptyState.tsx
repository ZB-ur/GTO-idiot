import React from 'react';

interface StatsEmptyStateProps {
  onStartPlaying: () => void;
}

export const StatsEmptyState: React.FC<StatsEmptyStateProps> = ({ onStartPlaying }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* Illustration: bar chart placeholder */}
      <div className="relative w-32 h-32 mb-8 flex items-end justify-center gap-2">
        <div className="w-6 h-8 bg-gray-800 border border-gray-700 rounded-t-lg" />
        <div className="w-6 h-14 bg-gray-800 border border-gray-700 rounded-t-lg" />
        <div className="w-6 h-10 bg-gray-800 border border-gray-700 rounded-t-lg" />
        <div className="w-6 h-16 bg-gray-800 border border-gray-700 rounded-t-lg" />
        <div className="w-6 h-6 bg-gray-800 border border-gray-700 rounded-t-lg" />
      </div>

      <h3 className="text-xl font-semibold text-gray-50 mb-2">暂无统计数据</h3>
      <p className="text-gray-500 text-sm text-center max-w-xs mb-8">
        完成几手牌后，你的胜率、盈亏和 GTO 一致性数据将会在这里展示。
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