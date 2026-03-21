// ============================================================
// App — Root component with Router + Toast provider
// ============================================================

import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { ToastProvider } from './components/common/Toast';

const router = createBrowserRouter(routes);

const App: React.FC = () => (
  <ToastProvider>
    <RouterProvider router={router} />
  </ToastProvider>
);

export default App;
