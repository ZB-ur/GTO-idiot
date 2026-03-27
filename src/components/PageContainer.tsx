import type { ReactNode } from 'react';

export function PageContainer({ children }: { children: ReactNode }): ReactNode {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </div>
    </main>
  );
}
