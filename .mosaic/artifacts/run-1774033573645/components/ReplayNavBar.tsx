import React from 'react';

interface ReplayNavBarProps {
  currentIndex: number;
  totalPoints: number;
  isPlaying: boolean;
  speed: number;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

export const ReplayNavBar: React.FC<ReplayNavBarProps> = ({
  currentIndex,
  totalPoints,
  isPlaying,
  speed,
  onPrev,
  onNext,
  onTogglePlay,
  onSpeedChange,
}) => {
  const isFirst = currentIndex <= 0;
  const isLast = currentIndex >= totalPoints - 1;
  const progress = totalPoints > 1 ? (currentIndex / (totalPoints - 1)) * 100 : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3">
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-500">决策点</span>
          <span className="text-xs font-semibold text-gray-900">
            {currentIndex + 1} / {totalPoints}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Dot indicators for small totalPoints */}
        {totalPoints <= 10 && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {Array.from({ length: totalPoints }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  i === currentIndex
                    ? 'bg-blue-600 scale-110'
                    : i < currentIndex
                    ? 'bg-blue-300'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        {/* Playback controls */}
        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            onClick={onPrev}
            disabled={isFirst || isPlaying}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-slate-100 hover:text-gray-900 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
            aria-label="上一步"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={onTogglePlay}
            disabled={isLast && !isPlaying}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors shadow-sm"
            aria-label={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            disabled={isLast || isPlaying}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-slate-100 hover:text-gray-900 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
            aria-label="下一步"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>

        {/* Speed selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 mr-1">速度</span>
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                speed === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
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

export default ReplayNavBar;