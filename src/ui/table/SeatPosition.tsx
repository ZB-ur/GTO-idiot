import React from 'react';
import type { PlayerInfo } from '../../types';

export interface SeatPositionProps {
  player: PlayerInfo;
  isDealer?: boolean;
  isActive?: boolean;
}

const SeatPosition: React.FC<SeatPositionProps> = ({ player, isDealer, isActive }) => {
  return (
    <div className={`seat-position ${isActive ? 'active' : ''} ${isDealer ? 'dealer' : ''}`}>
      <span className="player-name">{player.name}</span>
      <span className="chip-stack">{player.chipStack}</span>
    </div>
  );
};

export default SeatPosition;
