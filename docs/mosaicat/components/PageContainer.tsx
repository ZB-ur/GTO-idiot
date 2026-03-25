'use client';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function PageContainer({
  children,
  maxWidth = 'max-w-7xl',
  className = '',
}: PageContainerProps) {
  return (
    <div className={`${maxWidth} mx-auto px-4 py-6 ${className}`}>
      {children}
    </div>
  );
}

export default PageContainer;