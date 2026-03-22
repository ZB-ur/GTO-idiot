import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <main className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`.trim()}>
      {children}
    </main>
  );
};

export default PageContainer;