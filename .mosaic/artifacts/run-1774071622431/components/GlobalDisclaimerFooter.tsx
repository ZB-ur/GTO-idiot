import React from 'react';

export const GlobalDisclaimerFooter: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800 border-t border-slate-700">
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
        <svg
          className="h-4 w-4 text-amber-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M10.29 3.86l-8.5 14.14A1.98 1.98 0 003.5 21h17a1.98 1.98 0 001.71-2.99l-8.5-14.15a2 2 0 00-3.42 0z"
          />
        </svg>
        <p className="text-sm text-gray-100">
          For learning purposes only — not financial advice. GTO solutions are simplified approximations.
        </p>
      </div>
    </footer>
  );
};

export default GlobalDisclaimerFooter;