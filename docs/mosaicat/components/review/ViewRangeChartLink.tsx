import React from 'react';

interface ViewRangeChartLinkProps {
  position: string;
  onClick: () => void;
}

const ViewRangeChartLink: React.FC<ViewRangeChartLinkProps> = ({ position, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors duration-150"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h4V3H3v7zm0 11h4v-7H3v7zm6 0h4v-11H9v11zm6 0h4v-15h-4v15zm-6-18v4h4V3H9z"
        />
      </svg>
      <span>View {position} Range Chart</span>
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </button>
  );
};

export default ViewRangeChartLink;