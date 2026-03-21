import React from 'react';

interface SessionControlsProps {
  status: 'active' | 'paused';
  handCount: number;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}

const SessionControls: React.FC<SessionControlsProps> = ({
  status,
  handCount,
  onPause,
  onResume,
  onEnd,
}) => {
  const [showEndConfirm, setShowEndConfirm] = React.useState(false);

  const handleEndClick = () => {
    if (showEndConfirm) {
      onEnd();
      setShowEndConfirm(false);
    } else {
      setShowEndConfirm(true);
    }
  };

  const handleCancelEnd = () => {
    setShowEndConfirm(false);
  };

  return (
    <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5">
      {/* Left: Session status & hand count */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              status === 'active'
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-yellow-500'
            }`}
          />
          <span className="text-sm font-medium text-gray-50">
            {status === 'active' ? '进行中' : '已暂停'}
          </span>
        </div>
        <div className="w-px h-4 bg-gray-700" />
        <span className="text-sm text-gray-400">
          第 <span className="text-gray-50 font-medium">{handCount}</span> 手
        </span>
      </div>

      {/* Right: Control buttons */}
      <div className="flex items-center gap-2">
        {showEndConfirm ? (
          <>
            <span className="text-sm text-gray-400 mr-1">确认结束？</span>
            <button
              onClick={handleEndClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              确认
            </button>
            <button
              onClick={handleCancelEnd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-50 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              取消
            </button>
          </>
        ) : (
          <>
            {status === 'active' ? (
              <button
                onClick={onPause}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-50 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
                </svg>
                暂停
              </button>
            ) : (
              <button
                onClick={onResume}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
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
                </svg>
                继续
              </button>
            )}
            <button
              onClick={handleEndClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 hover:text-white hover:bg-red-500 bg-gray-800 border border-gray-700 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
              结束
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SessionControls;