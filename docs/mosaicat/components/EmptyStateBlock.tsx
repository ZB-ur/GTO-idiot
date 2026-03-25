import React from 'react';

interface EmptyStateBlockProps {
  illustration?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

const EmptyStateBlock: React.FC<EmptyStateBlockProps> = ({
  illustration = '🃏',
  title,
  description,
  ctaLabel,
  onCtaClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-6xl mb-6 select-none">{illustration}</div>
      <h3 className="text-xl font-semibold text-gray-100 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 text-sm max-w-sm mb-6">{description}</p>
      )}
      {ctaLabel && (
        <button
          onClick={onCtaClick}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg transition-colors duration-150"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyStateBlock;