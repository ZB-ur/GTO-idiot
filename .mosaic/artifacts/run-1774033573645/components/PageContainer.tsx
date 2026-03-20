import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  fullWidth = false,
}) => {
  return (
    <main
      className={`
        px-4 py-6 sm:px-6 lg:px-8
        ${fullWidth ? 'w-full' : 'max-w-4xl mx-auto'}
        ${className}
      `.trim()}
    >
      {children}
    </main>
  );
};

export default PageContainer;