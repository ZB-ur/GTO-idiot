import React from 'react';

interface IconButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'solid';
  className?: string;
}

const sizeConfig = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

const variantConfig = {
  ghost:
    'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900',
  outline:
    'bg-transparent border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900',
  solid:
    'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  label,
  size = 'md',
  variant = 'ghost',
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        cursor-pointer
        ${sizeConfig[size]}
        ${variantConfig[variant]}
        ${className}
      `}
    >
      {icon}
    </button>
  );
};

export default IconButton;