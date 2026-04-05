import React from 'react';

export interface DealerButtonProps {
  visible: boolean;
  className?: string;
}

export const DealerButton: React.FC<DealerButtonProps> = ({ visible, className = '' }) => {
  if (!visible) return null;

  return (
    <div
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500 shadow-md shadow-yellow-500/30 ${className}`}
      aria-label="Dealer"
    >
      <span className="text-[10px] font-black text-gray-900 leading-none">
        D
      </span>
    </div>
  );
};

export default DealerButton;