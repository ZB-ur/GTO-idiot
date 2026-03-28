import React from 'react';

interface GtoUnavailableNoticeProps {
  className?: string;
}

export const GtoUnavailableNotice: React.FC<GtoUnavailableNoticeProps> = ({
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-8 px-4 rounded-xl bg-gray-800/50 border border-gray-700 border-dashed ${className}`}>
      <svg className="w-8 h-8 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
      <p className="text-sm font-medium text-gray-500">No GTO Data Available</p>
      <p className="text-xs text-gray-600 mt-1 text-center">
        GTO reference is not available for this spot
      </p>
    </div>
  );
};