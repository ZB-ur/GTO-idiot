// ============================================================
// AppShell — Root layout: TopNav + main content area + toast
// ============================================================

import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { Skeleton } from '../common/Skeleton';

const PageFallback: React.FC = () => (
  <div className="p-6 space-y-4">
    <Skeleton height="h-8" width="w-48" />
    <Skeleton height="h-64" />
  </div>
);

export const AppShell: React.FC = () => (
  <div className="flex flex-col h-screen overflow-hidden bg-gray-900 text-gray-100">
    <TopNav />
    <main className="flex-1 overflow-y-auto">
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </main>
  </div>
);
