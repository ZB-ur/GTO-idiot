import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`max-w-4xl mx-auto px-4 py-6 ${className}`.trim()}>
      {children}
    </div>
  );
};

export default PageContainer;