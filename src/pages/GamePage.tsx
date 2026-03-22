import React from 'react';
import { useGameStore } from '../store/game-store';
import PokerTable from '../ui/table/PokerTable';
import ActionPanel from '../ui/actions/ActionPanel';

const GamePage: React.FC = () => {
  const { gameState } = useGameStore();

  if (!gameState) {
    return <div className="game-page">GamePage</div>;
  }

  return (
    <div className="game-page">
      <PokerTable gameState={gameState} />
      {gameState.currentHand?.isPlayerTurn && (
        <ActionPanel
          availableActions={{ actions: [], potSize: 0, toCall: 0 }}
          onAction={() => {}}
        />
      )}
    </div>
  );
};

export default GamePage;
