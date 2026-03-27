import React from 'react';

interface NoGTODataNoticeProps {
  onGoToReplay: () => void;
}

export const NoGTODataNotice: React.FC<NoGTODataNoticeProps> = ({
  onGoToReplay,
}) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-sky-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-sky-400"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-gray-50">
            完成复盘后才能显示 GTO 统计
          </span>
          <span className="text-xs text-gray-500">
            复盘你的手牌来解锁 GTO 符合率和 EV 分析
          </span>
        </div>
      </div>

      <button
        onClick={onGoToReplay}
        className="bg-gray-800 hover:bg-gray-700 text-amber-500 font-medium text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
      >
        去复盘
      </button>
    </div>
  );
};