import React from 'react';

export interface ChipStackProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
}

const ChipStack: React.FC<ChipStackProps> = ({ amount, size = 'md' }) => {
  return (
    <div className={`chip-stack chip-${size}`}>
      <span>{amount}</span>
    </div>
  );
};

export default ChipStack;
