import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TopNav />
      <main><Outlet /></main>
    </div>
  );
}
