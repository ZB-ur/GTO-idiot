import React, { useState } from 'react';

export interface EndSessionButtonProps {
  onEndSession: () => void;
}

export function EndSessionButton({ onEndSession }: EndSessionButtonProps) {
  const [confirming, setConfirming] = useState(false);

  const handleClick = () => {
    if (confirming) {
      onEndSession();
      setConfirming(false);
    } else {
      setConfirming(true);
    }
  };

  const handleCancel = () => {
    setConfirming(false);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleClick}
        className={`
          px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
          border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950
          ${confirming
            ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 focus:ring-red-500'
            : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-300 hover:border-gray-600 focus:ring-gray-500'
          }
        `}
      >
        {confirming ? 'Confirm End Session' : 'End Session'}
      </button>
      {confirming && (
        <button
          onClick={handleCancel}
          className="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-400 transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}