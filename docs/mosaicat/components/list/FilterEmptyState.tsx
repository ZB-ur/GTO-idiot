import React from 'react';

export const FilterEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Celebration icon */}
      <div className="w-16 h-16 rounded-full bg-emerald-900/40 border border-emerald-700/30 flex items-center justify-center mb-5">
        <span className="text-3xl">🎉</span>
      </div>

      <h3 className="text-base font-semibold text-gray-50 mb-2">
        没有包含 ❌ 错误决策的手牌
      </h3>
      <p className="text-sm text-gray-500 max-w-xs">
        继续保持！你的 GTO 决策做得很好。
      </p>
    </div>
  );
};