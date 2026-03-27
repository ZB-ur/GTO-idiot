import React from 'react';

interface GTOUnavailableNoticeProps {
  reason?: string;
}

export const GTOUnavailableNotice: React.FC<GTOUnavailableNoticeProps> = ({
  reason = 'GTO数据暂不可用',
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-700 bg-gray-900 px-6 py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800">
        <svg
          className="h-6 w-6 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-400">{reason}</p>
    </div>
  );
};

export default GTOUnavailableNotice;