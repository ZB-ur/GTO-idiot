import React from 'react';

interface ReplayControlsProps {
  onPrevStreet: () => void;
  onNextStreet: () => void;
  onPrevHand: () => void;
  onNextHand: () => void;
  isAutoPlay: boolean;
  onToggleAutoPlay: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  hasPrevHand: boolean;
  hasNextHand: boolean;
}

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  onPrevStreet,
  onNextStreet,
  onPrevHand,
  onNextHand,
  isAutoPlay,
  onToggleAutoPlay,
  speed,
  onSpeedChange,
  hasPrevHand,
  hasNextHand,
}) => {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
      {/* Hand navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevHand}
          disabled={!hasPrevHand}
          className={`p-2 rounded-lg text-sm font-medium transition-colors ${
            hasPrevHand
              ? 'text-gray-600 hover:bg-gray-100'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title="上一手"
        >
          ⏮
        </button>
        <span className="text-xs text-gray-400 font-medium">手牌</span>
        <button
          onClick={onNextHand}
          disabled={!hasNextHand}
          className={`p-2 rounded-lg text-sm font-medium transition-colors ${
            hasNextHand
              ? 'text-gray-600 hover:bg-gray-100'
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title="下一手"
        >
          ⏭
        </button>
      </div>

      {/* Street navigation + auto-play */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPrevStreet}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          title="上一轮"
        >
          ◀
        </button>

        <button
          onClick={onToggleAutoPlay}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isAutoPlay
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isAutoPlay ? '⏸ 暂停' : '▶ 播放'}
        </button>

        <button
          onClick={onNextStreet}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          title="下一轮"
        >
          ▶
        </button>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium">速度</span>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                speed === s
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReplayControls;