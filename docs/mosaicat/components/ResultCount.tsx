import React from 'react';

export interface ResultCountProps {
  filtered: number;
  total: number;
  className?: string;
}

export const ResultCount: React.FC<ResultCountProps> = ({
  filtered,
  total,
  className = '',
}) => {
  const isFiltered = filtered < total;

  return (
    <span className={`text-sm text-gray-500 ${className}`}>
      显示{' '}
      <span className={isFiltered ? 'text-emerald-400 font-medium' : 'text-gray-100 font-medium'}>
        {filtered}
      </span>
      {' / '}
      <span className="text-gray-100 font-medium">{total}</span>
      {' 手'}
    </span>
  );
};

export default ResultCount;