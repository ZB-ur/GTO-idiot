import React from 'react';

interface ErrorModalProps {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ title, message, actionLabel, onAction }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg shadow-black/40 p-8 max-w-md w-full mx-4 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/15">
          <span className="text-2xl text-red-400">!</span>
        </div>
        <h2 className="text-xl font-bold text-gray-50 mb-2">{title}</h2>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">{message}</p>
        <button
          onClick={onAction}
          className="w-full rounded-lg bg-red-500 hover:bg-red-400 text-white font-semibold py-3 px-6 text-sm transition-colors"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;