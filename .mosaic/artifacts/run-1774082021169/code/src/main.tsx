import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

/** Placeholder pages — replaced by actual page components in later modules */
function HomePage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-4xl font-bold text-felt-400">GTO Idiot</h1>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Future routes injected by downstream modules */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
