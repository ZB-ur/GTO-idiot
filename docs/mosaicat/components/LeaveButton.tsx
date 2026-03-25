import React from 'react';

interface LeaveButtonProps {
  onClick: () => void;
  loading?: boolean;
}

const LeaveButton: React.FC<LeaveButtonProps> = ({ onClick, loading = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium
        transition-all duration-150 ease-in-out
        ${loading
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 active:scale-[0.97] shadow-sm'
        }
      `}
      aria-label="离开牌桌"
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      )}
      {loading ? '保存中...' : '离开'}
    </button>
  );
};

export default LeaveButton;