import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TopNavBar } from './components/TopNavBar';
import { PageContainer } from './components/PageContainer';
import { LobbyPage } from './features/lobby/LobbyPage';
import { PokerTablePage } from './features/table/PokerTablePage';
import { HandReplayPage } from './features/replay/HandReplayPage';
import { HandListPage } from './features/replay/HandListPage';
import { StatsPage } from './features/stats/StatsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <TopNavBar />
      <PageContainer>
        <Routes>
          <Route path="/" element={<LobbyPage />} />
          <Route path="/table/:sessionId" element={<PokerTablePage />} />
          <Route path="/hands" element={<HandListPage />} />
          <Route path="/hands/:handId/replay" element={<HandReplayPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageContainer>
    </BrowserRouter>
  );
}

export default App;
