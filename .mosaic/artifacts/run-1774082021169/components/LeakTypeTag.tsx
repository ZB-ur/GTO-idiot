import React from 'react';

interface LeakTypeTagProps {
  leakType: string;
  className?: string;
}

// Deterministic color from string hash
const tagColors = [
  { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200' },
  { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
  { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200' },
  { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
  { bg: 'bg-pink-50',    text: 'text-pink-700',    border: 'border-pink-200' },
  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const LeakTypeTag: React.FC<LeakTypeTagProps> = ({ leakType, className = '' }) => {
  const colorIdx = hashString(leakType) % tagColors.length;
  const color = tagColors[colorIdx];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-xs font-medium ${color.bg} ${color.text} ${color.border} ${className}`}
    >
      {leakType}
    </span>
  );
};

export default LeakTypeTag;