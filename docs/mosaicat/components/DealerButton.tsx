import React from 'react';

export interface DealerButtonProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * DealerButton — 庄家按钮标记，白底"D"字
 * Atomic component rendered on the TableLayout to indicate the dealer position.
 */
const DealerButton: React.FC<DealerButtonProps> = ({ className = '' }) => {
  return (
    <div
      className={`
        inline-flex items-center justify-center
        w-8 h-8
        bg-white
        border-2 border-gray-300
        rounded-full
        shadow-md
        text-sm font-bold text-gray-900
        select-none
        ${className}
      `.trim()}
      aria-label="Dealer"
    >
      D
    </div>
  );
};

export default DealerButton;