import React from 'react';
import { NavHeader } from './NavHeader';
import { ToastContainer } from '../common/Toast';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-felt-950">
      <NavHeader />
      <main className="flex-1">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <footer className="border-t border-gray-800 py-4 text-center text-gray-600 text-xs">
        GTO Idiot — Texas Hold'em GTO Trainer
      </footer>
      <ToastContainer />
    </div>
  );
};
