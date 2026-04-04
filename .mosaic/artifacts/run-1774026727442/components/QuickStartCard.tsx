import React from 'react';

interface QuickStartCardProps {
  onQuickStart: () => void;
}

const QuickStartCard: React.FC<QuickStartCardProps> = ({ onQuickStart }) => {
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 flex flex-col items-center text-center space-y-5">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-emerald-800/50 border border-emerald-600/30 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Title & Description */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">快速开始</h3>
        <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
          以默认设置立即开始一局 6 人桌德州扑克，100BB 深筹码
        </p>
      </div>

      {/* Default Config Summary */}
      <div className="w-full bg-gray-700/50 rounded-lg px-4 py-3 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">座位</span>
          <span className="text-gray-200">BTN（庄位）</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">起始筹码</span>
          <span className="text-gray-200">100 BB</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">对手风格</span>
          <span className="text-gray-200">混合 (GTO/TAG/LAG)</span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onQuickStart}
        className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 flex items-center justify-center space-x-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>一键开始</span>
      </button>

      {/* Hint */}
      <p className="text-xs text-gray-500">
        或在下方自定义牌桌设置
      </p>
    </div>
  );
};

export default QuickStartCard;