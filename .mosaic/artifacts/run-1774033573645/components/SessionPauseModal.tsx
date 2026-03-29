import React from 'react';

interface SessionPauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPause: () => void;
  onEnd: () => void;
}

export const SessionPauseModal: React.FC<SessionPauseModalProps> = ({
  isOpen,
  onClose,
  onPause,
  onEnd,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold text-gray-900">暂停游戏</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            你可以暂停当前 Session 稍后继续，或者直接结束并查看本次统计摘要。
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          {/* Pause Button */}
          <button
            onClick={onPause}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            暂停 Session
          </button>

          {/* End Button */}
          <button
            onClick={onEnd}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-red-50 text-red-500 text-sm font-medium rounded-lg border border-red-200 hover:border-red-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            结束 Session
          </button>

          {/* Cancel */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            继续游戏
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionPauseModal;