import React from 'react';

interface StartButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export function StartButton({ onClick, loading = false }: StartButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        relative inline-flex items-center justify-center
        px-10 py-4 text-lg font-bold text-gray-950
        bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400
        rounded-xl shadow-lg shadow-amber-500/25
        transition-all duration-200
        hover:from-amber-300 hover:via-amber-400 hover:to-amber-300
        hover:shadow-xl hover:shadow-amber-500/40
        hover:scale-105
        active:scale-95
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-950
      `}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-950"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          准备中...
        </>
      ) : (
        '开始对战'
      )}
    </button>
  );
}