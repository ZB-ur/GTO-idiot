import React from 'react';

interface GtoDisclaimerBannerProps {
  text: string;
  onDismiss: () => void;
}

export const GtoDisclaimerBanner: React.FC<GtoDisclaimerBannerProps> = ({
  text,
  onDismiss,
}) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
      <span className="flex-shrink-0 text-amber-500 mt-0.5">
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <p className="flex-1 text-sm text-amber-800 leading-relaxed">{text}</p>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-amber-400 hover:text-amber-600 transition-colors mt-0.5"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
        </svg>
      </button>
    </div>
  );
};

export default GtoDisclaimerBanner;