import React from 'react';

interface EmptyStatsStateProps {
  onStartGame: () => void;
}

export const EmptyStatsState: React.FC<EmptyStatsStateProps> = ({
  onStartGame,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      {/* Illustration: stylized cards */}
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-20 h-20"
          >
            {/* Card back 1 */}
            <rect
              x="10"
              y="8"
              width="36"
              height="50"
              rx="4"
              fill="#1f2937"
              stroke="#374151"
              strokeWidth="1.5"
              transform="rotate(-10 28 33)"
            />
            {/* Card back 2 */}
            <rect
              x="30"
              y="8"
              width="36"
              height="50"
              rx="4"
              fill="#1f2937"
              stroke="#374151"
              strokeWidth="1.5"
              transform="rotate(10 48 33)"
            />
            {/* Question mark */}
            <text
              x="40"
              y="48"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="24"
              fontFamily="system-ui"
              fontWeight="bold"
            >
              ?
            </text>
          </svg>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-50 mb-2">
        还没有对战数据
      </h3>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
        完成你的第一局对战后，这里将显示你的统计数据和盈亏走势
      </p>

      <button
        onClick={onStartGame}
        className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold text-sm px-6 py-3 rounded-lg transition-colors"
      >
        开始第一局
      </button>
    </div>
  );
};