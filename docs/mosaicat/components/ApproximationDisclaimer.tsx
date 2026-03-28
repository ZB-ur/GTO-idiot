import React from 'react';

interface ApproximationDisclaimerProps {
  text?: string;
}

const ApproximationDisclaimer: React.FC<ApproximationDisclaimerProps> = ({
  text = '此GTO建议基于近似求解器计算，可能与精确GTO策略存在细微偏差，仅供参考。',
}) => {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
      <svg
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-xs leading-relaxed text-amber-700">{text}</p>
    </div>
  );
};

export default ApproximationDisclaimer;