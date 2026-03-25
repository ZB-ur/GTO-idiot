import React from 'react';

interface SkeletonCardProps {
  width?: string;
  height?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  width = 'w-full',
  height = 'h-32',
}) => {
  return (
    <div
      className={`${width} ${height} rounded-xl bg-[#1e293b] border border-gray-700 animate-pulse`}
    >
      <div className="p-4 space-y-3 h-full flex flex-col justify-center">
        <div className="h-3 bg-gray-700 rounded-md w-3/4" />
        <div className="h-3 bg-gray-700 rounded-md w-1/2" />
        <div className="h-3 bg-gray-700 rounded-md w-5/6" />
      </div>
    </div>
  );
};

export default SkeletonCard;