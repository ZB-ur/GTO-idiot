import React, { useState } from 'react';

// === Types ===
type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

interface SessionStats {
  totalHands: number;
  winRate: number;
  vpip: number;
  pfr: number;
  threeBetPercent: number;
  avgProfitPerHand: number;
  totalProfit?: number;
  handsWon?: number;
  handsLost?: number;
  biggestWin?: number;
  biggestLoss?: number;
  showdownWinRate?: number;
}

interface HoleCards {
  card1: { rank: string; suit: string; notation?: string };
  card2: { rank: string; suit: string; notation?: string };
}

interface HandHistorySummary {
  id: string;
  handNumber: number;
  position: Position;
  holeCards?: HoleCards;
  result: number;
  keyAction?: string;
  playedAt: string;
}

interface CreateGameRequest {
  seatPosition: Position;
  startingStack?: number;
  blindSize?: { smallBlind: number; bigBlind: number };
}

interface HomeScreenProps {
  stats?: SessionStats;
  recentHands?: HandHistorySummary[];
  onStartGame: (config: CreateGameRequest) => void;
  onOpenHistory: () => void;
  onOpenHand: (handId: string) => void;
}

// === Helpers ===
const formatProfit = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} BB`;
};

const formatCardNotation = (cards?: HoleCards): string => {
  if (!cards) return '??';
  const c1 = cards.card1.notation || `${cards.card1.rank}${cards.card1.suit}`;
  const c2 = cards.card2.notation || `${cards.card2.rank}${cards.card2.suit}`;
  return `${c1} ${c2}`;
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// === Component ===
const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  recentHands,
  onStartGame,
  onOpenHistory,
  onOpenHand,
}) => {
  const [selectedSeat, setSelectedSeat] = useState<Position>('BTN');
  const positions: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

  const handleStartGame = () => {
    onStartGame({ seatPosition: selectedSeat, startingStack: 100 });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero / Start Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">GTO Idiot</h1>
          <p className="text-gray-600">Texas Hold'em GTO Trainer</p>
        </div>

        {/* Seat Selector */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Select Your Seat
          </label>
          <div className="flex gap-2 flex-wrap">
            {positions.map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedSeat(pos)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selectedSeat === pos
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartGame}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-lg"
        >
          Start Practice
        </button>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
            <span className="text-sm text-gray-400">{stats.totalHands} hands</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Win Rate"
              value={`${stats.winRate >= 0 ? '+' : ''}${stats.winRate.toFixed(1)}`}
              unit="BB/100"
              color={stats.winRate >= 0 ? 'text-green-600' : 'text-rose-500'}
            />
            <StatCard
              label="VPIP"
              value={stats.vpip.toFixed(1)}
              unit="%"
              color="text-gray-900"
            />
            <StatCard
              label="PFR"
              value={stats.pfr.toFixed(1)}
              unit="%"
              color="text-gray-900"
            />
            <StatCard
              label="3-Bet"
              value={stats.threeBetPercent.toFixed(1)}
              unit="%"
              color="text-gray-900"
            />
          </div>
          {stats.totalProfit !== undefined && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Profit</span>
              <span
                className={`text-lg font-bold ${
                  stats.totalProfit >= 0 ? 'text-green-600' : 'text-rose-500'
                }`}
              >
                {formatProfit(stats.totalProfit)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Recent Hands */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Hands</h2>
          <button
            onClick={onOpenHistory}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All →
          </button>
        </div>

        {recentHands && recentHands.length > 0 ? (
          <div className="space-y-2">
            {recentHands.slice(0, 5).map((hand) => (
              <button
                key={hand.id}
                onClick={() => onOpenHand(hand.id)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    #{hand.handNumber}
                  </span>
                  <span className="text-sm font-medium text-gray-700 w-10">
                    {hand.position}
                  </span>
                  <span className="text-sm font-mono text-gray-500">
                    {formatCardNotation(hand.holeCards)}
                  </span>
                  {hand.keyAction && (
                    <span className="text-xs text-gray-400">{hand.keyAction}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-semibold ${
                      hand.result >= 0 ? 'text-green-600' : 'text-rose-500'
                    }`}
                  >
                    {formatProfit(hand.result)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {timeAgo(hand.playedAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            No hands played yet. Start a practice session!
          </div>
        )}
      </div>
    </div>
  );
};

// === Sub-components ===
interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, color }) => (
  <div className="text-center">
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className={`text-xl font-bold ${color}`}>
      {value}
      <span className="text-xs font-normal text-gray-400 ml-0.5">{unit}</span>
    </p>
  </div>
);

export default HomeScreen;