import React from 'react';

interface BustedDialogProps {
  visible: boolean;
  onRebuy: () => void;
  onEndSession: () => void;
}

export const BustedDialog: React.FC<BustedDialogProps> = ({
  visible,
  onRebuy,
  onEndSession,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-xl">
        {/* Busted Icon */}
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-gray-100 text-center mb-2">筹码归零！</h3>
        <p className="text-sm text-gray-400 text-center mb-6">
          你的筹码已经用完了。你可以重新买入继续游戏，或者结束本次 Session。
        </p>

        {/* Rebuy Info */}
        <div className="bg-gray-800 border border-gray-700/50 rounded-lg p-4 mb-6 flex items-center justify-between">
          <span className="text-sm text-gray-400">重新买入</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-amber-400">100</span>
            <span className="text-sm text-gray-500">BB</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onRebuy}
            className="w-full py-3 rounded-lg font-semibold bg-emerald-500 hover:bg-emerald-400 text-gray-950 transition-colors active:scale-[0.98]"
          >
            重新买入
          </button>
          <button
            onClick={onEndSession}
            className="w-full py-3 rounded-lg font-semibold border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors active:scale-[0.98]"
          >
            结束游戏
          </button>
        </div>
      </div>
    </div>
  );
};

export default BustedDialog;