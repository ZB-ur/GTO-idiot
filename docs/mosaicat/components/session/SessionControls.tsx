import React, { useState } from 'react';

interface SessionControlsProps {
  isInSession: boolean;
  onStartSession: () => void;
  onEndSession: () => void;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  isInSession,
  onStartSession,
  onEndSession,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEndClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmEnd = () => {
    setShowConfirm(false);
    onEndSession();
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (!isInSession) {
    return (
      <button
        onClick={onStartSession}
        className="px-6 py-3 bg-blue-600 text-white text-base font-semibold rounded-xl shadow-sm hover:bg-blue-700 transition-colors duration-150"
      >
        开始新牌局
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleEndClick}
        className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors duration-150"
      >
        结束牌局
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-sm mx-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">确认结束</h3>
            <p className="text-sm text-gray-600">
              确定要结束当前牌局吗？你的进度会被保存。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-slate-100 transition-colors duration-150"
              >
                取消
              </button>
              <button
                onClick={handleConfirmEnd}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-150"
              >
                确认结束
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionControls;