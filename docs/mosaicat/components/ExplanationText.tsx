import React from 'react';

interface ExplanationTextProps {
  text: string;
}

export const ExplanationText: React.FC<ExplanationTextProps> = ({ text }) => {
  // Split text into paragraphs
  const paragraphs = text.split('\n').filter((p) => p.trim().length > 0);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-emerald-400 flex-shrink-0">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 7v4M8 5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-semibold text-gray-100">GTO 策略解释</span>
      </div>

      {/* Text content */}
      <div className="space-y-2">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="text-sm text-gray-300 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};