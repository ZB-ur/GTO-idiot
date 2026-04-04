import React, { useCallback } from 'react';

interface PauseOverlayProps {
  onResume: () => void;
  onEnd: () => void;
}

const PauseOverlay: React.FC<PauseOverlayProps> = ({ onResume, onEnd }) => {
  const handleResume = useCallback(() => {
    onResume();
  }, [onResume]);

  const handleEnd = useCallback(() => {
    onEnd();
  }, [onEnd]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Overlay card */}
      <div className="relative w-full max-w-sm mx-4 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600" />

        <div className="px-8 py-10 flex flex-col items-center text-center">
          {/* Pause icon */}
          <div className="w-16 h-16 rounded-full bg-gray-700 border-2 border-emerald-600 flex items-center justify-center mb-5">
            <svg
              className="w-8 h-8 text-emerald-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2">游戏已暂停</h2>
          <p className="text-gray-300 text-sm mb-8">
            当前牌局进度已保存，你可以随时继续
          </p>

          {/* Action buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={handleResume}
              className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              继续游戏
            </button>

            <button
              onClick={handleEnd}
              className="w-full py-3 px-6 bg-gray-700 hover:bg-red-500/20 hover:border-red-500 border border-gray-600 text-gray-300 hover:text-red-400 font-semibold rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              结束牌局
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="px-8 pb-5">
          <p className="text-gray-500 text-xs text-center">
            按 <kbd className="px-1.5 py-0.5 bg-gray-700 border border-gray-600 rounded text-gray-400 text-xs font-mono">ESC</kbd> 继续游戏
          </p>
        </div>
      </div>
    </div>
  );
};

export default PauseOverlay;