import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import LandingPage from './pages/LandingPage';
import GamePage from './pages/GamePage';
import ReplayPage from './pages/ReplayPage';
import StatsPage from './pages/StatsPage';
import LearnPage from './pages/LearnPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<LandingPage />} />
          <Route path="play" element={<GamePage />} />
          <Route path="replay" element={<ReplayPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="learn" element={<LearnPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
