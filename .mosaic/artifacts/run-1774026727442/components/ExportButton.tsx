import React from 'react';

interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  disabled = false,
}) => {
  return (
    <button
      onClick={onExport}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
        transition-all duration-150
        ${
          disabled
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-500 active:bg-gray-600'
        }
      `}
    >
      {/* Download icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path
          fillRule="evenodd"
          d="M10 3a.75.75 0 01.75.75v7.69l2.22-2.22a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06l2.22 2.22V3.75A.75.75 0 0110 3z"
          clipRule="evenodd"
        />
        <path
          d="M3 15.75a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
        />
      </svg>
      导出 JSON
    </button>
  );
};

export default ExportButton;