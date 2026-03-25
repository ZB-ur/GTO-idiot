import React from 'react';

export interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        px-5 py-2.5
        text-sm font-medium
        text-blue-600 bg-white
        border border-blue-600
        rounded-lg
        transition-colors duration-150
        hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-600 disabled:hover:border-blue-600
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;