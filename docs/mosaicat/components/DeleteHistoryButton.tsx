import React from 'react';

interface DeleteHistoryButtonProps {
  selectedCount: number;
  loading?: boolean;
  onClick: () => void;
}

export const DeleteHistoryButton: React.FC<DeleteHistoryButtonProps> = ({
  selectedCount,
  loading = false,
  onClick,
}) => {
  const isDisabled = selectedCount === 0 || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-colors duration-150
        ${isDisabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200'
        }
      `}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span>
        {loading
          ? '删除中...'
          : selectedCount > 0
            ? `删除 (${selectedCount})`
            : '删除'}
      </span>
    </button>
  );
};

export default DeleteHistoryButton;