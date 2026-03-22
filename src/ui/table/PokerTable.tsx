import React from 'react';
import type { GameState } from '../../types';
import SeatPosition from './SeatPosition';
import CommunityCards from './CommunityCards';
import PotDisplay from './PotDisplay';

export interface PokerTableProps {
  gameState: GameState;
}

const PokerTable: React.FC<PokerTableProps> = ({ gameState }) => {
  return (
    <div className="poker-table">
      {gameState.players.map((player) => (
        <SeatPosition key={player.playerId} player={player} />
      ))}
      <CommunityCards cards={gameState.currentHand?.communityCards ?? []} />
      <PotDisplay amount={gameState.currentHand?.pot ?? 0} />
    </div>
  );
};

export default PokerTable;
