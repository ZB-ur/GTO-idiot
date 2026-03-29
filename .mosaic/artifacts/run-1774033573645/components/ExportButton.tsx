import React from 'react';

interface ExportButtonProps {
  onClick: () => void;
  label?: string;
  variant?: 'primary' | 'secondary';
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  label = 'Export',
  variant = 'primary',
}) => {
  const baseClasses =
    'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

  const variantClasses =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
      : 'bg-white text-gray-900 border border-gray-200 hover:bg-slate-50 active:bg-slate-100';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      {/* Download / Export icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path
          fillRule="evenodd"
          d="M10 3a.75.75 0 01.75.75v7.19l2.22-2.22a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06l2.22 2.22V3.75A.75.75 0 0110 3zM3 15.75a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
          clipRule="evenodd"
        />
      </svg>
      {label}
    </button>
  );
};

export default ExportButton;