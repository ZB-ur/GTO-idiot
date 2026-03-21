
import { GameProvider } from './contexts/GameContext';
import { AppShell } from './components/shell/AppShell';
import { ToastContainer } from './components/shared/Toast';

export default function App() {
  return (
    <GameProvider>
      <AppShell />
      <ToastContainer />
    </GameProvider>
  );
}
