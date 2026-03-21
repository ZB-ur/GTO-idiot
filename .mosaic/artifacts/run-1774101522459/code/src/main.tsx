import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// App component will be provided by the app-shell module
// For now, render a minimal root
const Root: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <h1 className="text-3xl font-bold text-white">GTO Idiot</h1>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
