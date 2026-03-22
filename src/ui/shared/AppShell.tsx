import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './TopNav';

const AppShell: React.FC = () => {
  const location = useLocation();
  const isGamePage = location.pathname === '/play';

  return (
    <div className="flex flex-col min-h-screen bg-felt-950">
      <TopNav />
      <main
        className={`
          flex-1 flex flex-col
          ${isGamePage
            ? '' /* Game page manages its own full-bleed layout */
            : 'max-w-6xl w-full mx-auto px-4 sm:px-6 py-6'
          }
        `}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
