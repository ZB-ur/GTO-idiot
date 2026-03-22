import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { gtoService } from './gto/gto-service';

// Eagerly initialize GTO preflop data at startup (<2MB)
// This runs in the background and doesn't block rendering
gtoService.init().catch((err) => {
  console.error('Failed to initialize GTO preflop data:', err);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
