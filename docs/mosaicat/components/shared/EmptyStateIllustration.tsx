import React from 'react';

type IllustrationType = 'chips' | 'cards' | 'chart';

interface EmptyStateIllustrationProps {
  illustration: IllustrationType;
  title: string;
  description?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

const illustrations: Record<IllustrationType, React.ReactNode> = {
  chips: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="65" r="40" fill="#1f2937" stroke="#374151" strokeWidth="2" />
      <circle cx="60" cy="65" r="30" fill="#111827" stroke="#f59e0b" strokeWidth="3" strokeDasharray="8 4" />
      <circle cx="60" cy="65" r="12" fill="#f59e0b" opacity="0.3" />
      <circle cx="45" cy="50" r="40" fill="#1f2937" stroke="#374151" strokeWidth="2" opacity="0.4" />
    </svg>
  ),
  cards: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="20" width="50" height="70" rx="6" fill="#1f2937" stroke="#374151" strokeWidth="2" transform="rotate(-10 25 20)" />
      <rect x="45" y="20" width="50" height="70" rx="6" fill="#111827" stroke="#f59e0b" strokeWidth="2" transform="rotate(10 70 55)" />
      <text x="60" y="62" textAnchor="middle" fill="#6b7280" fontSize="24">?</text>
    </svg>
  ),
  chart: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="70" width="16" height="30" rx="3" fill="#374151" />
      <rect x="42" y="50" width="16" height="50" rx="3" fill="#374151" />
      <rect x="64" y="60" width="16" height="40" rx="3" fill="#374151" />
      <rect x="86" y="40" width="16" height="60" rx="3" fill="#374151" />
      <line x1="15" y1="100" x2="107" y2="100" stroke="#4b5563" strokeWidth="2" />
    </svg>
  ),
};

export const EmptyStateIllustration: React.FC<EmptyStateIllustrationProps> = ({
  illustration,
  title,
  description,
  ctaText,
  onCtaClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-6 opacity-60">
        {illustrations[illustration]}
      </div>
      <h3 className="text-lg font-semibold text-gray-50 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-400 max-w-xs mb-6">{description}</p>
      )}
      {ctaText && onCtaClick && (
        <button
          onClick={onCtaClick}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold text-sm rounded-lg transition-colors"
        >
          {ctaText}
        </button>
      )}
    </div>
  );
};

export default EmptyStateIllustration;