import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  fullWidth = false,
  className = '',
}) => {
  return (
    <div
      className={`min-h-screen bg-gray-950 px-4 py-6 sm:px-6 lg:px-8 ${
        fullWidth ? '' : 'mx-auto max-w-4xl'
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
};

export default PageContainer;