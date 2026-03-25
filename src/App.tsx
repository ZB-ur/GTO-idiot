import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import LandingHero from './components/table/LandingHero';
import PokerTable from './components/table/PokerTable';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<LandingHero />} />
          <Route path="play" element={<PokerTable />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
