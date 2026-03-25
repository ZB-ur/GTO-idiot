import React from 'react';

export interface CardBackProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { card: 'w-10 h-14', inner: 'w-6 h-9' },
  md: { card: 'w-14 h-20', inner: 'w-9 h-14' },
  lg: { card: 'w-20 h-28', inner: 'w-14 h-20' },
};

export const CardBack: React.FC<CardBackProps> = ({ size = 'md' }) => {
  const s = sizeMap[size];

  return (
    <div
      className={`${s.card} rounded-lg bg-blue-800 border border-blue-900 shadow-sm flex items-center justify-center`}
    >
      <div
        className={`${s.inner} rounded border border-blue-600 bg-gradient-to-br from-blue-700 to-blue-900 opacity-80`}
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
        }}
      />
    </div>
  );
};

export default CardBack;