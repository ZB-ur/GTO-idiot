import React from 'react';
import { TopNav } from './TopNav';
import { ToastNotification } from './ToastNotification';

export interface PageLayoutProps {
  activePage: string;
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ activePage, children }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-50 flex flex-col">
      {/* Top Navigation */}
      <TopNav activePage={activePage} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Toast Notification Container */}
      <ToastNotification />
    </div>
  );
};